import type { Edge, Node } from "@xyflow/react";
import { useEffect } from "react";

export default function useDeleteNode({
  selected,
  setNodes,
  setEdges,
  setSelected,
}: {
  selected: Node | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelected: (node: Node | null) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!selected) return;
        setNodes((nds) => nds.filter((n) => n.id !== selected.id));
        setEdges((es) =>
          es.filter((e) => e.source !== selected.id && e.target !== selected.id)
        );
        setSelected(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, setNodes, setEdges]);
}
