import type { Node } from "@xyflow/react";
import type { NodeType } from "../types/types";
import { useEffect, useState } from "react";

export default function ConfigModal({
  node,
  onClose,
  onSave,
  onDelete,
}: {
  node: Node;
  onClose: () => void;
  onSave: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const userData = (node.data?.userData as Record<string, unknown>) || {};
  const type =
    (userData.type as NodeType) || (userData.language ? "code" : "webhook");

  const [form, setForm] = useState<Record<string, any>>(() => ({
    ...userData,
  }));

  useEffect(() => setForm({ ...userData }), [node]);

  const update = (key: string, value: any) =>
    setForm((s) => ({ ...s, [key]: value }));

  const submit = () => {
    // Basic validation per type
    if (!form.name) {
      alert("Name is required");
      return;
    }
    onSave(node.id, { ...form, type });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold">
            Configure: {String(form.name || node.data?.label || type)}
          </h4>
          <div className="space-x-2">
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-auto">
          {/* Common: Name */}
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              value={form.name || ""}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {type === "webhook" && (
            <>
              <div>
                <label className="block text-sm font-medium">Method</label>
                <select
                  value={form.method || "GET"}
                  onChange={(e) => update("method", e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option>GET</option>
                  <option>POST</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Path</label>
                <input
                  value={form.path || ""}
                  onChange={(e) => update("path", e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
            </>
          )}

          {type === "code" && (
            <>
              <div>
                <label className="block text-sm font-medium">Language</label>
                <input
                  value={form.language || "javascript"}
                  disabled
                  className="w-full border rounded p-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Code</label>
                <textarea
                  value={form.code || ""}
                  onChange={(e) => update("code", e.target.value)}
                  className="w-full border rounded p-2 h-40 font-mono"
                />
              </div>
            </>
          )}

          {type === "http" && (
            <>
              <div>
                <label className="block text-sm font-medium">Method</label>
                <select
                  value={form.method || "GET"}
                  onChange={(e) => update("method", e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">URL</label>
                <input
                  value={form.url || ""}
                  onChange={(e) => update("url", e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>

              <KeyValueList
                value={form.headers || {}}
                onChange={(v) => update("headers", v)}
                label="Headers"
              />

              <div>
                <label className="block text-sm font-medium">Body Mode</label>
                <select
                  value={form.bodyMode || "none"}
                  onChange={(e) => update("bodyMode", e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="none">none</option>
                  <option value="json">json</option>
                  <option value="text">text</option>
                  <option value="form">form</option>
                </select>
              </div>

              {form.bodyMode && form.bodyMode !== "none" && (
                <div>
                  <label className="block text-sm font-medium">Body</label>
                  <textarea
                    value={form.body || ""}
                    onChange={(e) => update("body", e.target.value)}
                    className="w-full border rounded p-2 h-28 font-mono"
                  />
                </div>
              )}
            </>
          )}

          {type === "smtp" && (
            <>
              <div>
                <label className="block text-sm font-medium">Host</label>
                <input
                  value={form.host || ""}
                  onChange={(e) => update("host", e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Port</label>
                <input
                  value={form.port || 587}
                  onChange={(e) => update("port", Number(e.target.value))}
                  type="number"
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  value={form.username || ""}
                  onChange={(e) => update("username", e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">From</label>
                <input
                  value={form.from || ""}
                  onChange={(e) => update("from", e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">To</label>
                <input
                  value={form.to || ""}
                  onChange={(e) => update("to", e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Subject</label>
                <input
                  value={form.subject || ""}
                  onChange={(e) => update("subject", e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Text</label>
                <textarea
                  value={form.text || ""}
                  onChange={(e) => update("text", e.target.value)}
                  className="w-full border rounded p-2 h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">HTML</label>
                <textarea
                  value={form.html || ""}
                  onChange={(e) => update("html", e.target.value)}
                  className="w-full border rounded p-2 h-24 font-mono"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <div>
            <button className="btn mr-2" onClick={submit}>
              Save
            </button>
            <button className="btn" onClick={() => onDelete(node.id)}>
              Delete Node
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Double-click canvas background to pan/zoom | edges are automatic
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyValueList({
  value,
  onChange,
  label,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  label?: string;
}) {
  const entries = Object.entries(value || {});
  const [local, setLocal] = useState(entries.length ? entries : [["", ""]]);

  useEffect(() => setLocal(Object.entries(value || {})), [value]);

  const updateKey = (i: number, k: string) => {
    const copy = [...local];
    copy[i][0] = k;
    setLocal(copy);
  };
  const updateVal = (i: number, v: string) => {
    const copy = [...local];
    copy[i][1] = v;
    setLocal(copy);
  };
  const addRow = () => setLocal((l) => [...l, ["", ""]]);
  const removeRow = (i: number) =>
    setLocal((l) => l.filter((_, idx) => idx !== i));
  useEffect(
    () => onChange(Object.fromEntries(local.filter(([k]) => k))),
    [local]
  );

  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="space-y-2">
        {local.map((kv, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={kv[0]}
              onChange={(e) => updateKey(i, e.target.value)}
              placeholder="Key"
              className="flex-1 border rounded p-2"
            />
            <input
              value={kv[1]}
              onChange={(e) => updateVal(i, e.target.value)}
              placeholder="Value"
              className="flex-1 border rounded p-2"
            />
            <button className="btn" onClick={() => removeRow(i)}>
              −
            </button>
          </div>
        ))}
        <div>
          <button className="btn" onClick={addRow}>
            Add header
          </button>
        </div>
      </div>
    </div>
  );
}
