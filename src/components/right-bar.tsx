import type { Node } from "@xyflow/react";
import PropertyRow from "./propertey-row";

export default function RightBar({ selected }: { selected: Node | null }) {
  const selectedProps = selected
    ? selected.data?.userData || selected.data
    : null;

  return (
    <div className="w-full bg-white p-3 space-y-3">
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
    </div>
  );
}
