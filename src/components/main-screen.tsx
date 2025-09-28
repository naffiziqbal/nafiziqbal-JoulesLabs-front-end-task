import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef, useState } from "react";
import { NODE_TEMPLATES } from "../data/data";
import { v4 as uuidv4 } from "uuid";
import useSaveToLocal from "../hooks/useSaveToLocal";
import useLoadFromStorage from "../hooks/useLoadFromStorage";
import useRestoreViewport from "../hooks/useRestoreViewport";
import useDeleteNode from "../hooks/useDeleteNode";
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
  setRfInstance,
}: {
  selected: Node | null;
  setSelected: (node: Node | null) => void;
  nodes: Node[];
  setNodes: (nodes: Node[]) => void;
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  rfInstance: ReactFlowInstance | null;
  setRfInstance: (rfInstance: ReactFlowInstance | null) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [editingNode, setEditingNode] = useState<Node | null>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!wrapperRef.current) return;
      console.log(nodes);
      const type = event.dataTransfer.getData("application/reactflow");
      console.log(type);
      if (!type) return;
      const template = NODE_TEMPLATES.find((t) => t.type === type);
      const reactFlowBounds = wrapperRef.current.getBoundingClientRect();

      const position = rfInstance
        ? rfInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          })
        : {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          };

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
    [rfInstance, setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = addEdge(connection as Edge, edges);
      setEdges(edge as Edge[]);
    },
    [edges, setEdges]
  );
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelected(node);
  }, []);
  const onNodeDoubleClick = useCallback((_: any, node: Node) => {
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
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={onNodeDoubleClick}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
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
        {/* <MiniMap /> */}
      </ReactFlow>
    </div>
  );
}
