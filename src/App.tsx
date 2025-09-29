import { useCallback, useEffect, useRef, useState } from "react";
import MainScreen from "./components/main-screen";
import RightBar from "./components/right-bar";
import SideBar from "./components/side-bar";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const handleImportClick = useCallback(() => fileRef.current?.click(), []);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (!validateImported(parsed))
            throw new Error(
              "Invalid flow structure. Missing nodes[], edges[] or viewport."
            );
          setNodes(toReactFlowNodes(parsed.nodes));
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
        />
      </ReactFlowProvider>
      <RightBar selected={selected} />
    </div>
  );
}
