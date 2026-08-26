export const portfolioPaletteIds = ["calm", "luxurious", "energetic", "creative", "professional"] as const;

export type PortfolioPaletteId = typeof portfolioPaletteIds[number];

export type PortfolioPalette = {
  id: PortfolioPaletteId;
  name: string;
  description: string;
  background: string;
  foreground: string;
  accent: string;
};

export const portfolioPalettes: Record<PortfolioPaletteId, PortfolioPalette> = {
  calm: {
    id: "calm",
    name: "The Calm Palette",
    description: "Serene & Grounded",
    background: "#E8ECE9",
    foreground: "#2A3B32",
    accent: "#8CA191",
  },
  luxurious: {
    id: "luxurious",
    name: "The Luxurious Palette",
    description: "High-End & Elegant",
    background: "#111111",
    foreground: "#FDFBF7",
    accent: "#D4AF37",
  },
  energetic: {
    id: "energetic",
    name: "The Energetic Palette",
    description: "Bold & Vibrant",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
    accent: "#FF4B2B",
  },
  creative: {
    id: "creative",
    name: "The Creative Palette",
    description: "Playful & Imaginative",
    background: "#FCEFEF",
    foreground: "#6320EE",
    accent: "#FFB703",
  },
  professional: {
    id: "professional",
    name: "The Professional Palette",
    description: "Trustworthy & Corporate",
    background: "#F8FAFC",
    foreground: "#0F172A",
    accent: "#2563EB",
  },
};

export function isPortfolioPaletteId(value: unknown): value is PortfolioPaletteId {
  return typeof value === "string" && portfolioPaletteIds.includes(value as PortfolioPaletteId);
}

export function getPortfolioPalette(value: unknown): PortfolioPalette {
  return portfolioPalettes[isPortfolioPaletteId(value) ? value : "luxurious"];
}
