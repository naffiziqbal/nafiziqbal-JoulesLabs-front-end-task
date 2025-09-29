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
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [editingNode, setEditingNode] = useState<Node | null>(null);

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

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = addEdge(connection as Edge, edges);
      setEdges(edge as Edge[]);
    },
    [edges, setEdges]
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
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  label: (newData.name as string) || n.data?.label,
                  userData: { ...newData },
                },
              }
            : n
        )
      );
      setEditingNode(null);
    },
    [setNodes]
  );
  const deleteNodeFromModal = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((es) =>
        es.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      setEditingNode(null);
    },
    [setNodes, setEdges]
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
        onEdgesChange={onEdgesChange}
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
