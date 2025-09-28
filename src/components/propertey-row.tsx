export default function PropertyRow({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return (
    <div className="flex justify-between bg-white p-2 rounded shadow-sm">
      <div className="text-xs text-gray-600">{name}</div>
      <div className="text-sm font-mono">{value}</div>
    </div>
  );
}
