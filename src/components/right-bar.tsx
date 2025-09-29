import type { Node } from "@xyflow/react";
import PropertyRow from "./propertey-row";

export default function RightBar({ selected }: { selected: Node | null }) {
  const selectedProps = selected
    ? selected.data?.userData || selected.data
    : null;

  return (
    <div className="w-full bg-white p-3 space-y-3 z-10">
      <h4 className="font-bold text-lg"> Properties</h4>
      <div>
        {selectedProps ? (
          <div className="text-sm space-y-2">
            <PropertyRow
              name="Label"
              value={String(selected?.data?.label || "")}
            />
            {Object.entries(selectedProps).map(([k, v]) => (
              <PropertyRow key={k} name={k} value={JSON.stringify(v)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Select a node to see read-only properties.
          </p>
        )}
      </div>
      <div className="pt-2 border-t absolute bottom-10">
        <h5 className="font-semibold text-sm mb-1">Shortcuts</h5>
        <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
          <li>Copy selection: Cmd/Ctrl + C</li>
          <li>Paste selection: Cmd/Ctrl + V</li>
          <li>Undo: Cmd/Ctrl + Z</li>
          <li>Redo: Shift+Cmd+Z (Mac) or Ctrl+Y (Win/Linux)</li>
        </ul>
      </div>
    </div>
  );
}
