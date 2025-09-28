import React, { useEffect } from "react";
import type { FlowState } from "../types/types";
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";
import {
  fromReactFlowEdges,
  fromReactFlowNodes,
  STORAGE_KEY,
} from "../utils/helper";

export default function useSaveToLocal({
  nodes,
  edges,
  rfInstance,
}: {
  nodes: Node[];
  edges: Edge[];
  rfInstance: ReactFlowInstance;
}) {
  useEffect(() => {
    const id = setTimeout(() => {
      const flow: FlowState = {
        version: 1,
        nodes: fromReactFlowNodes(nodes),
        edges: fromReactFlowEdges(edges),
        viewport: rfInstance ? rfInstance.toObject() : { x: 0, y: 0, zoom: 1 },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
    }, 350);
    return () => clearTimeout(id);
  }, [nodes, edges, rfInstance]);
}
