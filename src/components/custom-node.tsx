import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

export default memo(({ data, isConnectable }: { data: any; isConnectable: any }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div>▼</div>

      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 5 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 5, top: "auto" }}
        isConnectable={isConnectable}
      />
    </>
  );
});
