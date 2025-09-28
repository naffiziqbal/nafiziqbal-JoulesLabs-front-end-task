import type { Edge, Node } from "@xyflow/react";
import type { FlowEdge, FlowNode, FlowState, NodeType } from "../types/types";

export const STORAGE_KEY = "visual-workflow:v1";

export function fromReactFlowNodes(nodes: Node[]): FlowNode[] {
  return nodes.map((n) => ({
    id: n.id,
    type: (n.data?.userData?.type as NodeType) || "webhook",
    position: { x: n.position.x, y: n.position.y },
    label: n.data?.label || "Node",
    data: n.data?.userData || n.data || {},
  }));
}

export function fromReactFlowEdges(edges: Edge[]): FlowEdge[] {
  return edges.map((e) => ({
    id: e.id,
    from: { nodeId: e.source, port: "out" },
    to: { nodeId: e.target, port: "in" },
  }));
}

export function validateImported(obj: any): obj is FlowState {
  if (!obj || typeof obj !== "object") return false;
  if (obj.version == null) return false;
  if (!Array.isArray(obj.nodes)) return false;
  if (!Array.isArray(obj.edges)) return false;
  if (!obj.viewport || typeof obj.viewport !== "object") return false;
  return true;
}

export function toReactFlowNodes(nodes: FlowNode[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    position: n.position,
    data: { label: n.label, userData: n.data },
    // use default node type visually
  }));
}


export function toReactFlowEdges(edges: FlowEdge[]): Edge[] {
    return edges.map((e) => ({
      id: e.id,
      source: e.from.nodeId,
      target: e.to.nodeId,
      animated: true,
    }));
  }