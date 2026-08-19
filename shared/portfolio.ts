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
  title: string;
  category: "Design" | "Frontend" | "Full-stack" | "Open source";
  summary: string;
  tech: string[];
  liveUrl: string;
  codeUrl: string;
  images: string[];
};

export type Service = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type WritingPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  publishedAt: string;
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
    githubUrl: string;
    githubUsername: string;
    linkedinUrl: string;
    availability: "Open to new work" | "Currently booked" | "Open to select conversations";
  };
  skills: SkillGroup[];
  projects: Project[];
  services: Service[];
  testimonials: Testimonial[];
  posts: WritingPost[];
};

export const defaultPortfolioContent: PortfolioContent = {
  site: {
    name: "YOUR NAME",
    role: "FULL-STACK DEVELOPER · DESIGN-MINDED ENGINEER",
    pitch: "I create resilient digital products where the interface earns the attention and the system earns the trust.",
    bio: "This portfolio is ready for your story. Use the owner dashboard to shape the narrative, introduce your experience, and present each selected project clearly.",
    location: "Available worldwide",
    email: "hello@yourdomain.com",
    resumeUrl: "",
    heroImage: "",
    profileImage: "",
    accent: "#b8ff5c",
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
      id: "placeholder-1",
      title: "Featured project",
      category: "Full-stack",
      summary: "A deliberately open canvas for a project worth showing clearly.",
      tech: ["Add", "your", "stack"],
      liveUrl: "",
      codeUrl: "",
      images: [],
    },
  ],
  services: [
    { id: "service-1", eyebrow: "01", title: "Your first expertise", description: "Add a genuine service offering and describe the kind of work you want to be known for." },
    { id: "service-2", eyebrow: "02", title: "Your second expertise", description: "Replace this starter entry with an actual specialty, client outcome, or delivery practice." },
    { id: "service-3", eyebrow: "03", title: "Your third expertise", description: "Use this final card to make the scope of your work clear, specific, and client-approved." },
  ],
  testimonials: [],
  posts: [],
};
