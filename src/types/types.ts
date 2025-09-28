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
