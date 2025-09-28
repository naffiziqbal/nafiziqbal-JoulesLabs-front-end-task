import type { NodeType } from "../types/types";

export const NODE_TEMPLATES: {
  type: NodeType;
  label: string;
  defaultData: Record<string, unknown>;
}[] = [
  {
    type: "webhook",
    label: "Webhook In",
    defaultData: { name: "Webhook In", method: "POST", path: "/inbound" },
  },
  {
    type: "code",
    label: "Code",
    defaultData: {
      name: "Run Code",
      language: "javascript",
      code: "// code here",
    },
  },
  {
    type: "http",
    label: "HTTP Request",
    defaultData: { name: "Fetch API", method: "GET", url: "" },
  },
  {
    type: "smtp",
    label: "SMTP",
    defaultData: {
      name: "Send Email",
      host: "",
      port: 587,
      username: "",
      from: "",
      to: "",
      subject: "",
      text: "",
      html: "",
    },
  },
];
