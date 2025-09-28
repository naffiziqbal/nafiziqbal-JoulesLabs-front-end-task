import type { Edge, Node } from "@xyflow/react";
import { useEffect } from "react";
import {
    STORAGE_KEY,
    toReactFlowEdges,
    toReactFlowNodes,
    validateImported,
} from "../utils/helper";

export default function useLoadFromStorage({
  setNodes,
  setEdges,
}: {
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}) {
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!validateImported(parsed)) return;
      setNodes(toReactFlowNodes(parsed.nodes));
      setEdges(toReactFlowEdges(parsed.edges));
      // optionally restore viewport
      // reactflow instance might not be ready yet; when ready, we will set view
      // store viewport in session to apply later
      sessionStorage.setItem(
        "visual-workflow:viewport",
        JSON.stringify(parsed.viewport || { x: 0, y: 0, zoom: 1 })
      );
    } catch (err) {
      console.warn("Failed to load saved flow", err);
    }
  }, [setNodes, setEdges]);
}
