import { CiExport, CiImport } from "react-icons/ci";
import { NODE_TEMPLATES } from "../data/data";
import type { NodeType } from "../types/types";

export default function SideBar({
  handleExport,
  handleImportClick,
  importError,
  exportError,
  fileRef,
  handleFile,
}: {
  handleExport: () => void;
  handleImportClick: () => void;
  importError: string | null;
  exportError: string | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
  handleFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-white p-3 space-y-4 grid grid-rows-[auto_1fr_auto]">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg">Nodes</h4>
        <div className=" flex justify-end  items-end  gap-3  *:py-2 *:rounded px-4 py-2 rounded *:cursor-pointer">
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFile}
          />
          <button onClick={handleImportClick}>
            <ToolTip text="Import">
              <CiImport className="size-4" />
            </ToolTip>
          </button>
          <button onClick={handleExport}>
            <ToolTip text="Export">
              <CiExport className="size-4" />
            </ToolTip>
          </button>
        </div>
      </div>
      <div className="space-y-2 ">
        {NODE_TEMPLATES.map((t) => (
          <PaletteItem key={t.type} template={t} />
        ))}
      </div>
      <div className="w-full ">
        {importError && <div className="text-red-500">{importError}</div>}
        {exportError && <div className="text-red-500">{exportError}</div>}
      </div>
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

function ToolTip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 mb-2 
                      whitespace-nowrap bg-black text-white text-xs 
                      px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200 pointer-events-none"
      >
        {text}
      </div>
    </div>
  );
}
