import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const filesToCheck = [
  resolve(process.cwd(), "src/api/orchestrator.ts"),
  resolve(process.cwd(), "src/pages/DeviceControl.tsx"),
  resolve(process.cwd(), "workers/q-agent/src/index.ts"),
  resolve(process.cwd(), "supabase/migrations/20260411183000_add_iot_commands.sql"),
];

for (const file of filesToCheck) {
  await readFile(file, "utf8");
}

const seoContent = await readFile(resolve(process.cwd(), "src/i18n/seo-content.ts"), "utf8");
if (!seoContent.includes('"q-agent"')) {
  throw new Error("SEO content is missing the q-agent key.");
}

const appRoutes = await readFile(resolve(process.cwd(), "src/App.tsx"), "utf8");
if (!appRoutes.includes('path="/q-agent"')) {
  throw new Error("App routes are missing /q-agent.");
}

console.log("Q-Agent checks passed.");