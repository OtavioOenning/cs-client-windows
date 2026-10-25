import { describe, it, expect } from "vitest";
import {
  sanitizeCrosshair,
  sanitizeViewmodel,
  generateAutoexecCfg,
  createEmptyProfile,
  DEFAULT_CROSSHAIR,
  DEFAULT_VIEWMODEL,
} from "../../src/renderer/lib/cs2Config";

describe("sanitizeCrosshair", () => {
  it("clamps out-of-range values into each convar's valid range", () => {
    const dirty = { ...DEFAULT_CROSSHAIR, colorR: 999, size: -5, style: 9 as 0 };
    const clean = sanitizeCrosshair(dirty);
    expect(clean.colorR).toBe(255);
    expect(clean.size).toBe(0);
    expect(clean.style).toBe(5);
  });

  it("leaves already-valid values untouched", () => {
    const clean = sanitizeCrosshair(DEFAULT_CROSSHAIR);
    expect(clean).toEqual(DEFAULT_CROSSHAIR);
  });
});

describe("sanitizeViewmodel", () => {
  it("clamps FOV to CS2's documented 54-90 range", () => {
    expect(sanitizeViewmodel({ ...DEFAULT_VIEWMODEL, fov: 120 }).fov).toBe(90);
    expect(sanitizeViewmodel({ ...DEFAULT_VIEWMODEL, fov: 10 }).fov).toBe(54);
  });
});

describe("generateAutoexecCfg", () => {
  it("emits only documented, client-side convars — never a sv_cheats-gated command", () => {
    const profile = createEmptyProfile("Test Profile");
    const cfg = generateAutoexecCfg(profile);

    expect(cfg).toContain("cl_crosshairstyle");
    expect(cfg).toContain("viewmodel_fov");
    expect(cfg).toContain('profile "Test Profile"');
    expect(cfg).not.toMatch(/sv_cheats|god|noclip|give /);
  });

  it("is deterministic for the same profile input", () => {
    const profile = createEmptyProfile("Repeatable");
    expect(generateAutoexecCfg(profile)).toBe(generateAutoexecCfg(profile));
  });
});
