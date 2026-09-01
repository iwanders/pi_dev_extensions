import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

import { execFile } from "node:child_process";

// Log to terminal:
// ctx.ui.notify(`Hello ${args || "world"}!`, "info");

// Ugh, this probably goes through dbus or something, which currently isn't exposed to my sandbox.
function dispatch_notify(message: string) {
  // -u low, normal, critical,
  // -i icon, could be nice to use a pi icon, icon needs to be the path on the HOST.

  let args = ["-t", "5000"];
  let icon_file = process.env.HOST_PI_IW_EXTENSIONS_DIR || null;
  if (icon_file !== null) {
    args.push("-i");
    args.push(icon_file +"/notify/assets/pi-logo-on-light.svg");
  }
  args.push(message);
  execFile("notify-send", args , {  }, () => {});
}
export default function (pi: ExtensionAPI) {
  // Register a custom tool
  pi.registerTool({
    name: "notify",
    label: "Notify",
    description: "Notify the user through a desktop notification.",
    parameters: Type.Object({
      text: Type.String({ description: "Text to send with the notification." }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      dispatch_notify(params.text);
      return {
        content: [{ type: "text", text: `Notified with "${params.text}"` }],
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

  pi.on("agent_settled", async (_event, _ctx) => {
      dispatch_notify("agent_settled");
  });
}
