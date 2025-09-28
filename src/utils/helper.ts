import type { Edge, Node } from "@xyflow/react";
import type { FlowEdge, FlowNode, NodeType } from "../types/types";

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
