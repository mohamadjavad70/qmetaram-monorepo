import { describe, it, expect } from "vitest";
import ts from "typescript";
import { processCouncilCommand, COUNCIL_MEMBERS } from "./councilEngine";

describe("processCouncilCommand", () => {
  it("returns layered Persian output with executable code", async () => {
    const result = await processCouncilCommand("آزمایش اتصال Q-Net");

    expect(result.votes).toHaveLength(COUNCIL_MEMBERS.length);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);

    const output = result.finalResponse;
    expect(output).toContain("🔵 لایه ۱");
    expect(output).toContain("🟡 لایه ۲");
    expect(output).toContain("🔴 لایه ۳");
    expect(output).toContain("🟢 لایه ۴");
    expect(output).toContain("⭐ گزارش نهایی فرمانده سام آرمان");
    expect(output).toMatch(/```ts[\s\S]*```/);

    const codeMatch = output.match(/```ts([\s\S]*?)```/);
    expect(codeMatch).not.toBeNull();
    const codeBlock = codeMatch?.[1] ?? "";
    const transpileResult = ts.transpileModule(codeBlock, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
      reportDiagnostics: true,
    });
    expect(transpileResult.diagnostics?.length ?? 0).toBe(0);
  });
});
