import { useCallback, useEffect, useRef, useState } from "react";
import MainScreen from "./components/main-screen";
import RightBar from "./components/right-bar";
import SideBar from "./components/side-bar";
import "@xyflow/react/dist/style.css";

import {
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type ReactFlowInstance,
  ReactFlowProvider,
} from "@xyflow/react";
import type { FlowState } from "./types/types";
import {
  exportToJSON,
  fromReactFlowEdges,
  fromReactFlowNodes,
  toReactFlowEdges,
  toReactFlowNodes,
  validateImported,
} from "./utils/helper";

export default function App() {
  const [selected, setSelected] = useState<Node | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  type HistoryAction =
    | { type: "addNode"; node: Node }
    | { type: "deleteNode"; node: Node; edges: Edge[] }
    | {
        type: "updateNode";
        id: string;
        prevData: Record<string, unknown> | undefined;
        nextData: Record<string, unknown> | undefined;
        prevLabel?: string | undefined;
        nextLabel?: string | undefined;
      }
    | { type: "addEdge"; edge: Edge }
    | { type: "removeEdge"; edge: Edge };

  const [undoStack, setUndoStack] = useState<HistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleImportClick = useCallback(() => fileRef.current?.click(), []);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  console.log(importError);
  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (!validateImported(parsed)) {
            setImportError(
              "Invalid flow structure. Missing nodes[], edges[] or viewport"
            );
            return;
          }
          // importing new flow resets history
          setNodes(toReactFlowNodes(parsed.nodes));
          setUndoStack([]);
          setRedoStack([]);
          setEdges(toReactFlowEdges(parsed.edges));
          // store viewport to apply once rfInstance available
          sessionStorage.setItem(
            "visual-workflow:viewport",
            JSON.stringify(parsed.viewport)
          );
          setImportError(null);
        } catch (err: unknown) {
          setImportError(
            err instanceof Error ? err.message : "Import failed: invalid JSON"
          );
          setImportError(null);
          setExportError(null);
        }
      };
      reader.readAsText(f);
      // reset input
      e.currentTarget.value = "";
    },
    [setNodes, setEdges]
  );

  // History-aware mutations
  const commit = useCallback((action: HistoryAction) => {
    setUndoStack((s) => [...s, action]);
    setRedoStack([]);
  }, []);

  const addNodeWithHistory = useCallback(
    (node: Node) => {
      setNodes((nds) => nds.concat(node));
      commit({ type: "addNode", node });
    },
    [commit, setNodes]
  );

  const deleteNodeWithHistory = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const node = nds.find((n) => n.id === nodeId);
        if (!node) return nds;
        setEdges((es) => {
          const connected = es.filter(
            (e) => e.source === nodeId || e.target === nodeId
          );
          commit({ type: "deleteNode", node, edges: connected });
          return es.filter((e) => e.source !== nodeId && e.target !== nodeId);
        });
        return nds.filter((n) => n.id !== nodeId);
      });
    },
    [setNodes, setEdges, commit]
  );

  const updateNodeWithHistory = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const prevData = n.data?.userData as
            | Record<string, unknown>
            | undefined;
          const prevLabel = n.data?.label as string | undefined;
          const nextLabel = (newData.name as string) || prevLabel;
          const nextNode: Node = {
            ...n,
            data: { ...n.data, label: nextLabel, userData: { ...newData } },
          };
          commit({
            type: "updateNode",
            id: nodeId,
            prevData,
            nextData: { ...newData },
            prevLabel,
            nextLabel,
          });
          return nextNode;
        })
      );
    },
    [setNodes, commit]
  );

  const addEdgeWithHistory = useCallback(
    (edge: Edge) => {
      setEdges((es) => es.concat(edge));
      commit({ type: "addEdge", edge });
    },
    [setEdges, commit]
  );

  const removeEdgeWithHistory = useCallback(
    (edgeId: string) => {
      setEdges((es) => {
        const edge = es.find((e) => e.id === edgeId);
        if (!edge) return es;
        commit({ type: "removeEdge", edge });
        return es.filter((e) => e.id !== edgeId);
      });
    },
    [setEdges, commit]
  );

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const undo = useCallback(() => {
    if (!undoStack.length) return;
    const action = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((s) => [...s, action]);
    switch (action.type) {
      case "addNode": {
        // inverse: remove node and any edges connected
        const nodeId = action.node.id;
        setEdges((es) =>
          es.filter((e) => e.source !== nodeId && e.target !== nodeId)
        );
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        break;
      }
      case "deleteNode": {
        // inverse: re-add node and its edges
        setNodes((nds) => nds.concat(action.node));
        setEdges((es) => es.concat(action.edges));
        break;
      }
      case "updateNode": {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === action.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    label: action.prevLabel ?? n.data?.label,
                    userData: action.prevData,
                  },
                }
              : n
          )
        );
        break;
      }
      case "addEdge": {
        setEdges((es) => es.filter((e) => e.id !== action.edge.id));
        break;
      }
      case "removeEdge": {
        setEdges((es) => es.concat(action.edge));
        break;
      }
    }
  }, [undoStack, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (!redoStack.length) return;
    const action = redoStack[redoStack.length - 1];
    setRedoStack((s) => s.slice(0, -1));
    setUndoStack((s) => [...s, action]);
    switch (action.type) {
      case "addNode": {
        setNodes((nds) => nds.concat(action.node));
        break;
      }
      case "deleteNode": {
        const nodeId = action.node.id;
        setEdges((es) =>
          es.filter((e) => e.source !== nodeId && e.target !== nodeId)
        );
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        break;
      }
      case "updateNode": {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === action.id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    label: action.nextLabel ?? n.data?.label,
                    userData: action.nextData,
                  },
                }
              : n
          )
        );
        break;
      }
      case "addEdge": {
        setEdges((es) => es.concat(action.edge));
        break;
      }
      case "removeEdge": {
        setEdges((es) => es.filter((e) => e.id !== action.edge.id));
        break;
      }
    }
  }, [redoStack, setNodes, setEdges]);

  const handleExport = useCallback(() => {
    if (!nodes.length) {
      setExportError("No nodes to export");
      return;
    }
    const flow: FlowState = {
      version: 1,
      nodes: fromReactFlowNodes(nodes),
      edges: fromReactFlowEdges(edges),
      viewport: rfInstance
        ? rfInstance.toObject().viewport
        : { x: 0, y: 0, zoom: 1 },
    };
    const blob = new Blob([exportToJSON(flow)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, rfInstance]);

  useEffect(() => {
    setRfInstance(rfInstance);
  }, [rfInstance]);

  return (
    <div className="grid grid-cols-[20%_60%_20%]">
      <SideBar
        fileRef={fileRef}
        handleFile={handleFile}
        handleExport={handleExport}
        handleImportClick={handleImportClick}
        importError={importError}
        exportError={exportError}
      />
      <ReactFlowProvider>
        <MainScreen
          selected={selected}
          setSelected={setSelected}
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          rfInstance={rfInstance}
          undoNodes={undo}
          redoNodes={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          addNodeWithHistory={addNodeWithHistory}
          deleteNodeWithHistory={deleteNodeWithHistory}
          updateNodeWithHistory={updateNodeWithHistory}
          addEdgeWithHistory={addEdgeWithHistory}
          removeEdgeWithHistory={removeEdgeWithHistory}
        />
      </ReactFlowProvider>
      <RightBar selected={selected} />
    </div>
  );
}
