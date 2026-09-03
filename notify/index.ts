import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

import { execFile } from "node:child_process";

// Log to terminal:
// ctx.ui.notify(`Hello ${args || "world"}!`, "info");
// Event flow is nicely available here; https://pi.dev/docs/latest/extensions#lifecycle-overview
// Can hot reload with /reload.


/// This is the duration of an agent loop in seconds below which no notification is sent.
const short_loop_skip_notify_value_s: number = 30.0;

// Ugh, this probably goes through dbus or something, which currently isn't exposed to my sandbox.
function dispatch_notify(message: string) {
  // -u low, normal, critical,
  let args = ["-t", "5000"];

  // Icon needs to be an absolute path on the host... so lets do this env var thing to obtain that path.
  let icon_file = process.env.HOST_PI_IW_EXTENSIONS_DIR || null;
  if (icon_file !== null) {
    args.push("-i");
    args.push(icon_file +"/notify/assets/pi-logo-on-light.svg");
  }
  args.push(message);
  execFile("notify-send", args , {  }, () => {});
}


function crackArgs(args: string): [string, string | null]  {
  const trimmed = args.trim();
  const firstSpaceIndex = trimmed.indexOf(" ");

  if (firstSpaceIndex === -1) {
    // Handle case where there is only one word and no spaces
    const firstWord = trimmed; 
    return [firstWord, null];
  } else {
    const firstWord = trimmed.slice(0, firstSpaceIndex);
    const remainingText = trimmed.slice(firstSpaceIndex + 1).trim();
    return [firstWord, remainingText];
  }
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
    description: "Send a notification to the user through a desktop notification.",
    handler: async (args, ctx) => {
      function printNotifyHelp() {
        ctx.ui.notify(`/notify help\n/notify send <message>`, "info");
      }
      let [first_word, second_part] = crackArgs(args);
      if (first_word == "help" && second_part === null) {
        printNotifyHelp();
        return;
      } else if (first_word == "send") {
        dispatch_notify(second_part || "");
      } else { 
        printNotifyHelp();
        return;
      } 
    },
  });

  // Is this the proper way to make stateful extensions or is there a proper mechanism?
  let start_time: number | null = null;
  pi.on("agent_start", async () => {
    start_time = Date.now();
  });

  pi.on("agent_settled", async (_event, _ctx) => {
    if (start_time === null) {
      // This is a bug? state machine not followed.
      ctx.ui.notify("Agent settle event hit while start_time is null", "info");
      return;
    }
    // Date.now is in milliseconds since 1970, so subtract it and make it seconds.
    let elapsed_s = (Date.now() - start_time) / 1000.0;
    start_time = null;
    if (elapsed_s < short_loop_skip_notify_value_s) {
      // No notification necessary.
      return;
    }
    dispatch_notify(`agent_settled after ${elapsed_s.toFixed(2)} seconds.`);
  });
}
