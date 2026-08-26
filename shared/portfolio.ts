import type { PortfolioPaletteId } from "./palettes";
import { portfolioPalettes } from "./palettes";

export type Skill = {
  id: string;
  name: string;
  level: "Working knowledge" | "Strong" | "Expert";
};

export type SkillGroup = {
  id: string;
  title: string;
  items: Skill[];
};

export type Project = {
  id: string;
  visible: boolean;
  hidden: boolean;
  title: string;
  category: "Design" | "Frontend" | "Full-stack" | "Open source";
  summary: string;
  tech: string[];
  liveUrl: string;
  codeUrl: string;
  images: string[];
};

export function createDraftProject(id: string): Project {
  return {
    id,
    visible: true,
    hidden: false,
    title: "Untitled project",
    category: "Full-stack",
    summary: "Describe the problem, the product signal, and the outcome this project demonstrates.",
    tech: [],
    liveUrl: "",
    codeUrl: "",
    images: [],
  };
}

export type Service = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type PortfolioContent = {
  site: {
    name: string;
    role: string;
    pitch: string;
    bio: string;
    location: string;
    email: string;
    resumeUrl: string;
    heroImage: string;
    profileImage: string;
    accent: string;
    palette: PortfolioPaletteId;
    githubUrl: string;
    githubUsername: string;
    linkedinUrl: string;
    availability: "Open to new work" | "Currently booked" | "Open to select conversations";
  };
  skills: SkillGroup[];
  projects: Project[];
  services: Service[];
};

export const defaultPortfolioContent: PortfolioContent = {
  site: {
    name: "Parshv Chandaria",
    role: "FULL-STACK DEVELOPER · DESIGN-MINDED ENGINEER",
    pitch: "I create resilient digital products where the interface earns the attention and the system earns the trust.",
    bio: "Welcome to my space. I specialize in turning complex ideas into smooth websites and high-performance applications. When I am not writing code for the web, I am designing, wiring, and programming robotics projects.",
    location: "Available worldwide",
    email: "chandariaparshv@gmail.com",
    resumeUrl: "",
    heroImage: "https://cdn.phototourl.com/free/2026-08-24-03340257-fe38-40b9-a1a5-23ed054ea0e5.jpg",
    profileImage: "",
    accent: portfolioPalettes.luxurious.accent,
    palette: "luxurious",
    githubUrl: "https://github.com/Parshv-collab",
    githubUsername: "Parshv-collab",
    linkedinUrl: "",
    availability: "Open to select conversations",
  },
  skills: [
    {
      id: "frontend",
      title: "Frontend",
      items: [
        { id: "react", name: "React", level: "Strong" },
        { id: "typescript", name: "TypeScript", level: "Strong" },
        { id: "motion", name: "Framer Motion", level: "Working knowledge" },
      ],
    },
    {
      id: "backend",
      title: "Backend",
      items: [
        { id: "node", name: "Node.js", level: "Strong" },
        { id: "api", name: "API design", level: "Strong" },
        { id: "database", name: "Relational data", level: "Working knowledge" },
      ],
    },
    {
      id: "craft",
      title: "Product craft",
      items: [
        { id: "ux", name: "Interaction design", level: "Strong" },
        { id: "systems", name: "Design systems", level: "Strong" },
        { id: "a11y", name: "Accessibility", level: "Working knowledge" },
      ],
    },
  ],
  projects: [
    {
      id: "jarvis-voice-assistant",
      visible: true,
      hidden: false,
      title: "Jarvis",
      category: "Open source",
      summary: "An AI assistant capable of everything from opening a file to joining a meeting",
      tech: ["Python", "API"],
      liveUrl: "",
      codeUrl: "https://github.com/Parshv-collab/Jarvis-Voice-Assistant",
      images: [],
    },
    {
      id: "sample-pulseboard",
      visible: true,
      hidden: false,
      title: "Sample — Pulseboard",
      category: "Frontend",
      summary: "Sample project for testing compact project cards, visual density, and the expanded mobile detail view. Replace with a real project before publishing.",
      tech: ["React", "TypeScript", "Framer Motion"],
      liveUrl: "",
      codeUrl: "",
      images: [],
    },
    {
      id: "sample-circuit-lab",
      visible: true,
      hidden: false,
      title: "Sample — Circuit Lab",
      category: "Full-stack",
      summary: "Sample project for testing a multi-item portfolio list, filtering, and on-demand mobile project details. Replace with a real project before publishing.",
      tech: ["Node.js", "API", "MongoDB"],
      liveUrl: "",
      codeUrl: "",
      images: [],
    },
  ],
  services: [
    { id: "service-1", eyebrow: "01", title: "Web development", description: "Modern, premium and futuristic design with proper outcome." },
    { id: "service-2", eyebrow: "02", title: "App development", description: "Professional apps that feel out of this world." },
    { id: "service-3", eyebrow: "03", title: "Robotics", description: "Testing and creating useful robots and other projects related to it." },
  ],
};
