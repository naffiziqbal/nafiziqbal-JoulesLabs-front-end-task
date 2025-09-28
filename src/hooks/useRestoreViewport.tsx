import type { ReactFlowInstance } from "@xyflow/react";
import { useEffect } from "react";

export default function useRestoreViewport({
  rfInstance,
}: {
  rfInstance: ReactFlowInstance;
}) {
  useEffect(() => {
    const raw = sessionStorage.getItem("visual-workflow:viewport");
    if (!raw || !rfInstance) return;
    try {
      const vp = JSON.parse(raw);
      rfInstance.setViewport(vp);
      sessionStorage.removeItem("visual-workflow:viewport");
    } catch (err) {
      console.log(err);
      // ignore
    }
  }, [rfInstance]);
}
