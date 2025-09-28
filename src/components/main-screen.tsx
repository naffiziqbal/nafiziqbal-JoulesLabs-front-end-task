import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef, useState } from "react";
import { NODE_TEMPLATES } from "../data/data";
import { v4 as uuidv4 } from "uuid";
import useSaveToLocal from "../hooks/useSaveToLocal";
import useLoadFromStorage from "../hooks/useLoadFromStorage";

export default function MainScreen() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

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

  useSaveToLocal({ nodes, edges, rfInstance });
  useLoadFromStorage({ setNodes, setEdges });

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
        onConnect={onConnect}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} bgColor="#212121" />
        <Controls />
        {/* <MiniMap /> */}
      </ReactFlow>
    </div>
  );
}
