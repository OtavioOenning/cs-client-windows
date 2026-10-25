import { describe, it, expect, vi, beforeEach } from "vitest";

const accessMock = vi.fn();
const readFileMock = vi.fn();

vi.mock("node:fs", () => ({
  promises: {
    access: (...args: unknown[]) => accessMock(...args),
    readFile: (...args: unknown[]) => readFileMock(...args),
  },
}));

vi.mock("node:child_process", () => ({
  exec: vi.fn((_cmd: string, cb: (err: Error | null, result: { stdout: string; stderr: string }) => void) => {
    cb(new Error("registry lookup unavailable in test env"), { stdout: "", stderr: "" });
  }),
}));

import { detectCs2Installation, buildSteamLaunchUri } from "../../src/main/gameDetection";

describe("detectCs2Installation", () => {
  beforeEach(() => {
    accessMock.mockReset();
    readFileMock.mockReset();
    readFileMock.mockRejectedValue(new Error("no libraryfolders.vdf in test env"));
  });

  it("reports not-found with a clear reason when no override path works", async () => {
    accessMock.mockRejectedValue(new Error("ENOENT"));
    const result = await detectCs2Installation("C:\\Nonexistent\\Path");
    expect(result.found).toBe(false);
    if (!result.found) {
      expect(result.reason).toMatch(/cs2\.exe/i);
    }
  });

  it("reports found when the override path's cs2.exe resolves", async () => {
    accessMock.mockResolvedValue(undefined);
    const result = await detectCs2Installation("C:\\Games\\CS2");
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.source).toBe("override");
      expect(result.exePath).toContain("cs2.exe");
    }
  });
});

describe("buildSteamLaunchUri", () => {
  it("builds a steam:// run URI scoped to CS2's app id", () => {
    const uri = buildSteamLaunchUri(["-novid", "+fps_max 0"]);
    expect(uri).toMatch(/^steam:\/\/run\/730\/\//);
    expect(decodeURIComponent(uri)).toContain("-novid +fps_max 0");
  });
});
