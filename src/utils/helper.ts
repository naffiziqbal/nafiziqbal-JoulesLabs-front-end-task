import type { Edge, Node } from "@xyflow/react";
import type { FlowEdge, FlowNode, FlowState, NodeType } from "../types/types";

export const STORAGE_KEY = "visual-workflow:v1";

export function fromReactFlowNodes(nodes: Node[]): FlowNode[] {
  console.log(nodes);
  return nodes.map((n) => ({
    id: n.id,
    type: (n.data?.userData as { type?: NodeType })?.type || "webhook",
    position: { x: n.position.x, y: n.position.y },
    label: (n.data?.label as string) || "Node",
    data: (n.data?.userData || n.data || {}) as Record<string, unknown>,
  }));
}

export function fromReactFlowEdges(edges: Edge[]): FlowEdge[] {
  return edges.map((e) => ({
    id: e.id,
    from: { nodeId: e.source, port: "out" },
    to: { nodeId: e.target, port: "in" },
  }));
}

export function validateImported(obj: unknown): obj is {
  version: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: { x: number; y: number; zoom: number };
} {
  if (typeof obj !== "object" || obj === null) return false;

  const candidate = obj as {
    version?: unknown;
    nodes?: unknown;
    edges?: unknown;
    viewport?: unknown;
  };

  // version must be a number
  if (typeof candidate.version !== "number") return false;

  // nodes must be a non-empty array
  if (!Array.isArray(candidate.nodes) || candidate.nodes.length === 0)
    return false;

  // edges must be a non-empty array
  if (!Array.isArray(candidate.edges) || candidate.edges.length === 0)
    return false;

  // viewport must be an object with x, y, zoom all numbers
  if (typeof candidate.viewport !== "object" || candidate.viewport === null) {
    return false;
  }

  const vp = candidate.viewport as Record<string, unknown>;
  if (
    typeof vp.x !== "number" ||
    typeof vp.y !== "number" ||
    typeof vp.zoom !== "number"
  ) {
    return false;
  }

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

export function exportToJSON(flow: FlowState) {
  return JSON.stringify(flow, null, 2);
}
