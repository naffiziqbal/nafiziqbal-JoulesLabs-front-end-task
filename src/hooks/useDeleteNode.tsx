import type { Edge, Node } from "@xyflow/react";
import { useEffect } from "react";

export default function useDeleteNode({
  selected,
  editingNode,
  setNodes,
  setEdges,
  setSelected,
}: {
  selected: Node | null;
  editingNode: Node | null;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setSelected: (node: Node | null) => void;
}) {
  useEffect(() => {
    if (editingNode?.id) {
      return;
    } else {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (!selected) return;
          // NOTE: This raw deletion bypasses history. Consumers can override by passing wrappers.
          setNodes((nds) => nds.filter((n) => n.id !== selected.id));
          setEdges((es) => es.filter((e) => e.source !== selected.id && e.target !== selected.id));
          setSelected(null);
        }
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [selected, setNodes, setEdges, setSelected, editingNode?.id]);
}
