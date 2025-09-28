import { NODE_TEMPLATES } from "../data/data";
import type { NodeType } from "../types/types";

export default function SideBar({
  handleExport,
}: {
  handleExport: () => void;
}) {
  return (
    <div className="bg-white p-3 space-y-4">
      <h4 className="font-bold text-lg">Nodes</h4>
      <div className="space-y-2 ">
        {NODE_TEMPLATES.map((t) => (
          <PaletteItem key={t.type} template={t} />
        ))}
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleExport}
      >
        Export
      </button>
    </div>
  );
}

function PaletteItem({
  template,
}: {
  template: {
    type: NodeType;
    label: string;
    defaultData: Record<string, unknown>;
  };
}) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", template.type);
    event.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="border rounded p-2 bg-white cursor-grab hover:shadow"
    >
      <div className="font-medium">{template.label}</div>
      <div className="text-xs text-gray-500">{template.type}</div>
    </div>
  );
}
