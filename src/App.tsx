import { useCallback, useState } from "react";
import MainScreen from "./components/main-screen";
import RightBar from "./components/right-bar";
import SideBar from "./components/side-bar";
import {
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import type { FlowState } from "./types/types";
import {
  exportToJSON,
  fromReactFlowEdges,
  fromReactFlowNodes,
} from "./utils/helper";

export default function App() {
  const [selected, setSelected] = useState<Node | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const handleExport = useCallback(() => {
    const flow: FlowState = {
      version: 1,
      nodes: fromReactFlowNodes(nodes),
      edges: fromReactFlowEdges(edges),
      viewport: rfInstance ? rfInstance.toObject() : { x: 0, y: 0, zoom: 1 },
    };
    const blob = new Blob([exportToJSON(flow)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, rfInstance]);

  return (
    <div className="grid grid-cols-[20%_60%_20%]">
      <SideBar handleExport={handleExport} />
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
        setRfInstance={setRfInstance}
      />
      <RightBar selected={selected} />
    </div>
  );
}
