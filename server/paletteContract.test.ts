import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getPortfolioPalette, portfolioPaletteIds, portfolioPalettes } from "../shared/palettes";

const homeSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");
const stylesheet = readFileSync(resolve(import.meta.dirname, "../client/src/index.css"), "utf8");
const adminSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Admin.tsx"), "utf8");

describe("owner-managed portfolio palettes", () => {
  it("retains all five supplied palette definitions with their supplied primary values", () => {
    expect(portfolioPaletteIds).toEqual(["calm", "luxurious", "energetic", "creative", "professional"]);
    expect(portfolioPalettes.calm.background).toBe("#E8ECE9");
    expect(portfolioPalettes.luxurious.accent).toBe("#D4AF37");
    expect(portfolioPalettes.energetic.accent).toBe("#FF4B2B");
    expect(portfolioPalettes.creative.foreground).toBe("#6320EE");
    expect(portfolioPalettes.professional.foreground).toBe("#0F172A");
  });

  it("falls back to the premium default when a legacy portfolio has no valid palette", () => {
    expect(getPortfolioPalette(undefined).id).toBe("luxurious");
    expect(getPortfolioPalette("unsupported").id).toBe("luxurious");
  });

  it("applies the exact supplied background, foreground, and accent values without alternate theme variants", () => {
    expect(homeSource).toContain('"--portfolio-bg": palette.background');
    expect(homeSource).toContain('"--portfolio-fg": palette.foreground');
    expect(homeSource).toContain('"--portfolio-accent": palette.accent');
    expect(homeSource).not.toContain("palette.light");
    expect(homeSource).not.toContain("palette.dark");
    expect(stylesheet).toContain(".portfolio-palette { background: var(--portfolio-bg");
    for (const utility of [".bg-\\[\\#16161b\\]", ".bg-\\[\\#18181d\\]", ".bg-black", ".bg-black\\/70", ".project-signal-reveal"]) {
      expect(stylesheet).toContain(utility);
    }
    expect(adminSource).toContain("const paletteOptions = Object.values(portfolioPalettes)");
    expect(adminSource).toContain("Site palette");
    expect(adminSource).toContain("aria-pressed={draft.site.palette === palette.id}");
  });

  it("covers every selectable palette across public section, project, dialog, fallback, action, and contact states", () => {
    for (const paletteId of portfolioPaletteIds) {
      const palette = getPortfolioPalette(paletteId);
      expect(palette.id).toBe(paletteId);
      expect(palette.background).toMatch(/^#[0-9A-F]{6}$/);
      expect(palette.foreground).toMatch(/^#[0-9A-F]{6}$/);
      expect(palette.accent).toMatch(/^#[0-9A-F]{6}$/);
    }
    for (const stateComponent of ["function Hero", "function About", "function Work", "function MobileProjectDialog", "function ProjectVisual", "function ProjectSignalReveal", "function Services", "function Contact", "function Footer"]) {
      expect(homeSource).toContain(stateComponent);
    }
    expect(homeSource).not.toMatch(/#(25D366|53e88b|ff9e7a|ffb39a|8164ff)/);
    expect(homeSource).not.toMatch(/amber-|emerald-|slate-[0-9]{3}/);
    expect(homeSource).toContain('role="alert" className="relative z-[70] border-b border-[var(--portfolio-accent)]/30');
    expect(homeSource).toContain('const availabilityStyle = "bg-[var(--portfolio-accent)]"');
  });
});
