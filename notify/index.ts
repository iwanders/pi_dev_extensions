import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

import { execFile } from "node:child_process";

// Log to terminal:
// ctx.ui.notify(`Hello ${args || "world"}!`, "info");

// Ugh, this probably goes through dbus or something, which currently isn't exposed to my sandbox.
function dispatch_notify(message: string) {
  // -u low, normal, critical,
  // -i icon, could be nice to use a pi icon...
  execFile("notify-send", [message, "-t", "5000"], {  }, () => {});
}
export default function (pi: ExtensionAPI) {
  // Register a custom tool
  pi.registerTool({
    name: "notify",
    label: "Notify",
    description: "Notify the user through a desktop notification.",
    parameters: Type.Object({
      name: Type.String({ description: "Name to greet" }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      return {
        content: [{ type: "text", text: `Hello, ${params.name}!` }],
        details: {},
      };
    },
  });

  // Register a command
  pi.registerCommand("notify", {
    description: "Send a notification to test.",
    handler: async (args, ctx) => {
      dispatch_notify("test");
    },
  });
}
