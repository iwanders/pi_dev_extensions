import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

import { execFile } from "node:child_process";

// Log to terminal:
// ctx.ui.notify(`Hello ${args || "world"}!`, "info");
// Event flow is nicely available here; https://pi.dev/docs/latest/extensions#lifecycle-overview
// Can hot reload with /reload.
// Based on https://github.com/earendil-works/pi/blob/9841914c71a74d81abe07f751aefd271fd924e63/packages/coding-agent/examples/extensions/commands.ts
// and https://github.com/earendil-works/pi/blob/9841914c71a74d81abe07f751aefd271fd924e63/packages/coding-agent/examples/extensions/input-transform.ts

export default function (pi: ExtensionAPI) {
  pi.on("input", async (event, ctx) => {
    const commands = pi.getCommands();
    const command_names = commands.map((c) => c.name);
    if (event.source === "extension") {
      return { action: "continue" };
    }

    if (event.text.startsWith("/")) {
      const command_name: string = event.text.slice(1).split(" ")[0];;
      if (!command_names.includes(command_name)){
        ctx.ui.notify(`/${command_name} is not a valid slash command, preventing sending slash command to the LLM.`, "warning");
        return { action: "handled" };
      }
    }

    return { action: "continue" };
  });
}
