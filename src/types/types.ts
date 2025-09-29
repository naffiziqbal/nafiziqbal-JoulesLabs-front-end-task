import type { Edge, Node } from "@xyflow/react";

export type NodeType = "webhook" | "code" | "http" | "smtp";

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  label: string;
  data: Record<string, unknown>;
}

export interface FlowEdge {
  id: string;
  from: { nodeId: string; port: "out" };
  to: { nodeId: string; port: "in" };
}

export interface FlowState {
  version: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: { x: number; y: number; zoom: number };
}

export type HistoryAction =
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
