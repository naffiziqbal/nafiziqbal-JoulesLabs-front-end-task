import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { NODE_TEMPLATES } from "../data/data";
import useDeleteNode from "../hooks/useDeleteNode";
import useLoadFromStorage from "../hooks/useLoadFromStorage";
import useRestoreViewport from "../hooks/useRestoreViewport";
import useSaveToLocal from "../hooks/useSaveToLocal";
import DownloadButton from "./download-btn";
import ConfigModal from "./edit-modal";

export default function MainScreen({
  selected,
  setSelected,
  nodes,
  setNodes,
  edges,
  setEdges,
  onNodesChange,
  onEdgesChange,
  rfInstance,
  undoNodes,
  redoNodes,
  canUndo,
  canRedo,
  addNodeWithHistory,
  deleteNodeWithHistory,
  updateNodeWithHistory,
  addEdgeWithHistory,
  removeEdgeWithHistory,
}: {
  selected: Node | null;
  setSelected: (node: Node | null) => void;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  rfInstance: ReactFlowInstance | null;
  undoNodes: () => void;
  redoNodes: () => void;
  canUndo: boolean;
  canRedo: boolean;
  addNodeWithHistory: (node: Node) => void;
  deleteNodeWithHistory: (nodeId: string) => void;
  updateNodeWithHistory: (nodeId: string, data: Record<string, unknown>) => void;
  addEdgeWithHistory: (edge: Edge) => void;
  removeEdgeWithHistory: (edgeId: string) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [editingNode, setEditingNode] = useState<Node | null>(null);

  // keyboard shortcuts: Cmd+Z / Ctrl+Z for undo, Shift+Cmd+Z or Ctrl+Y for redo
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      // Undo: Cmd+Z / Ctrl+Z without Shift
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undoNodes();
      }
      // Redo: Shift+Cmd+Z (Mac) or Ctrl+Y (Win/Linux)
      if ((isMac && e.key.toLowerCase() === "z" && e.shiftKey) || (!isMac && e.key.toLowerCase() === "y")) {
        e.preventDefault();
        if (canRedo) redoNodes();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undoNodes, redoNodes, canUndo, canRedo]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!wrapperRef.current) return;
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;
      const template = NODE_TEMPLATES.find((t) => t.type === type);
      const reactFlowBounds = wrapperRef.current.getBoundingClientRect();

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const id = uuidv4();
      const newNode: Node = {
        id,
        position,
        data: {
          label: template?.label || type,
          userData: { ...template?.defaultData, type },
        },
      };

      addNodeWithHistory(newNode);
    },
    [screenToFlowPosition, addNodeWithHistory]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const created = addEdge(connection as Edge, edges) as Edge[];
      const newOnes = created.filter((e) => !edges.find((x) => x.id === e.id));
      newOnes.forEach((e) => addEdgeWithHistory(e));
    },
    [edges, addEdgeWithHistory]
  );

  const onEdgesChangeWrapped = useCallback(
    (changes: EdgeChange[]) => {
      // record edge removals into history
      type RemoveChange = { type: "remove"; id: string };
      changes.forEach((ch) => {
        if ((ch as RemoveChange).type === "remove") {
          const id = (ch as RemoveChange).id;
          if (id) removeEdgeWithHistory(id);
        }
      });
      onEdgesChange(changes);
    },
    [onEdgesChange, removeEdgeWithHistory]
  );
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelected(node);
    },
    [setSelected]
  );
  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setEditingNode(node);
  }, []);
  const saveNodeConfig = useCallback(
    (nodeId: string, newData: Record<string, unknown>) => {
      updateNodeWithHistory(nodeId, newData);
      setEditingNode(null);
    },
    [updateNodeWithHistory]
  );
  const deleteNodeFromModal = useCallback(
    (nodeId: string) => {
      deleteNodeWithHistory(nodeId);
      setEditingNode(null);
    },
    [deleteNodeWithHistory]
  );

  useSaveToLocal({ nodes, edges, rfInstance });
  useLoadFromStorage({ setNodes, setEdges });
  useRestoreViewport({ rfInstance });
  useDeleteNode({ selected, setNodes, setEdges, setSelected, editingNode });

  const connectionLineStyle = { stroke: "#ffff" };
  const defaultEdgeOptions = {
    animated: true,
    type: "smoothstep",
  };
  const defaultViewport = { x: 0, y: 0, zoom: 0.5 };
  return (
    <div
      style={{ width: "100%", height: "100vh" }}
      ref={wrapperRef}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgesChange={onEdgesChangeWrapped}
        onConnect={onConnect}
        connectionLineStyle={connectionLineStyle}
        snapToGrid={true}
        defaultViewport={defaultViewport}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={defaultEdgeOptions}
        className="download-image"
      >
        <Controls />
        <Background />
        <DownloadButton />
        {/* Undo/Redo small toolbar */}
        <div
          style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8, zIndex: 10 }}
        >
          <button
            className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
            onClick={undoNodes}
            disabled={!canUndo}
            title="Undo (Cmd/Ctrl+Z)"
          >
            Undo
          </button>
          <button
            className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
            onClick={redoNodes}
            disabled={!canRedo}
            title="Redo (Shift+Cmd+Z or Ctrl+Y)"
          >
            Redo
          </button>
        </div>
        {editingNode && (
          <ConfigModal
            node={editingNode}
            onClose={() => setEditingNode(null)}
            onSave={saveNodeConfig}
            onDelete={deleteNodeFromModal}
          />
        )}
        <Background variant={BackgroundVariant.Dots} bgColor="#212121" />
        <Controls />
        <DownloadButton />
        {/* <MiniMap /> */}
      </ReactFlow>
    </div>
  );
}
