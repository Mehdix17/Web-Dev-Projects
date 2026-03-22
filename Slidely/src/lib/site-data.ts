export type ProjectCategory = "Pitch Decks" | "Keynote" | "Sales" | "Reports";

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: number;
  client: string;
  role: string;
  thumbnail: string;
  heroImage: string;
  challenge: string[];
  approach: { title: string; description: string }[];
  solutionImages: { src: string; alt: string }[];
  results: { label: string; value: string }[];
}

const makeProject = (
  slug: string,
  title: string,
  category: ProjectCategory,
  client: string,
  year: number,
): Project => ({
  slug,
  title,
  category,
  client,
  year,
  role: "Lead Presentation Designer",
  thumbnail: `https://picsum.photos/seed/${slug}-thumb/900/600`,
  heroImage: `https://picsum.photos/seed/${slug}-hero/1920/1080`,
  challenge: [
    `${client} needed to translate complex information into a persuasive executive narrative without losing technical credibility.`,
    `Existing decks were text-heavy, visually inconsistent, and difficult to present in high-stakes meetings across distributed teams.`,
    `The project required a scalable visual system that could reduce preparation time while improving audience clarity and confidence.`,
  ],
  approach: [
    {
      title: "Discover",
      description:
        "Mapped stakeholder goals, audience objections, and narrative risks through rapid workshops.",
    },
    {
      title: "Define",
      description:
        "Built a slide-by-slide story framework with clear tension, proof, and call-to-action moments.",
    },
    {
      title: "Design",
      description:
        "Created a modular visual language with reusable components and hierarchy-driven layouts.",
    },
    {
      title: "Deliver",
      description:
        "Shipped production-ready deck templates and presenter notes for consistent adoption.",
    },
  ],
  solutionImages: Array.from({ length: 6 }, (_, i) => ({
    src: `https://picsum.photos/seed/${slug}-slide-${i + 1}/1400/900`,
    alt: `${title} slide ${i + 1}`,
  })),
  results: [
    { label: "Win Rate", value: "+32%" },
    { label: "Prep Time", value: "-41%" },
    { label: "Stakeholder Confidence", value: "+27 NPS" },
  ],
});

export const projects: Project[] = [
  makeProject(
    "atlas-fundraise",
    "Atlas Series A Fundraise",
    "Pitch Decks",
    "Atlas Labs",
    2025,
  ),
  makeProject(
    "lumen-qbr",
    "Lumen QBR Narrative",
    "Reports",
    "Lumen Systems",
    2024,
  ),
  makeProject(
    "nova-go-to-market",
    "Nova GTM Launch Deck",
    "Sales",
    "Nova Commerce",
    2025,
  ),
  makeProject(
    "sora-keynote",
    "Sora Product Keynote",
    "Keynote",
    "Sora Health",
    2024,
  ),
  makeProject(
    "meridian-board",
    "Meridian Board Update",
    "Reports",
    "Meridian Capital",
    2025,
  ),
  makeProject(
    "strata-enterprise",
    "Strata Enterprise Pitch",
    "Pitch Decks",
    "Strata AI",
    2026,
  ),
  makeProject(
    "halo-revenue",
    "Halo Revenue Story",
    "Sales",
    "Halo Cloud",
    2025,
  ),
  makeProject(
    "pulse-vision",
    "Pulse Vision Day",
    "Keynote",
    "Pulse Energy",
    2026,
  ),
  makeProject(
    "arc-growth",
    "Arc Growth Narrative",
    "Pitch Decks",
    "Arc Motion",
    2024,
  ),
  makeProject(
    "fable-partner",
    "Fable Partner Enablement",
    "Sales",
    "Fable Tech",
    2026,
  ),
  makeProject(
    "zenith-strategy",
    "Zenith Strategy Report",
    "Reports",
    "Zenith Bio",
    2025,
  ),
  makeProject(
    "vivid-summit",
    "Vivid Annual Summit",
    "Keynote",
    "Vivid Retail",
    2026,
  ),
];

export const services = [
  {
    title: "Pitch Deck Design",
    description:
      "Investor-ready story architecture, visual hierarchy, and high-stakes presentation polish.",
    icon: "\u25b2",
  },
  {
    title: "Executive Reports",
    description:
      "Clear, data-driven communication systems for quarterly and board-level reporting.",
    icon: "\u25a0",
  },
  {
    title: "Keynote Narratives",
    description:
      "Launch, keynote, and internal event decks built for momentum and memorability.",
    icon: "\u25cf",
  },
] as const;

export const clientLogos = [
  "Atlas",
  "Lumen",
  "Nova",
  "Sora",
  "Meridian",
  "Halo",
  "Pulse",
  "Zenith",
];

export const testimonial = {
  quote:
    "Slidely turned a fragmented story into a crisp executive narrative that closed the room in one presentation.",
  author: "Head of Strategy, Atlas Labs",
};

export const processTimeline = [
  "Discover",
  "Define",
  "Design",
  "Validate",
  "Deliver",
];
