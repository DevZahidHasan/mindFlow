export interface GraphNode {
  id: string;
  label: string;
  description: string;
  notesCount: number;
  referencesCount: number;
  relatedConcepts: string[];
  x: number; // Normalized initial X position (-100 to 100)
  y: number; // Normalized initial Y position (-100 to 100)
}

export interface GraphEdge {
  source: string;
  target: string;
}

export const mockNodes: GraphNode[] = [
  {
    id: "ai",
    label: "Artificial Intelligence",
    description: "Systems that perform tasks historically requiring human intelligence, built on computational neural pathways.",
    notesCount: 14,
    referencesCount: 8,
    relatedConcepts: ["Cognitive Science", "Knowledge", "Information Theory"],
    x: -80,
    y: -40,
  },
  {
    id: "cog-sci",
    label: "Cognitive Science",
    description: "The interdisciplinary study of mind, brain, and intelligence, combining philosophy, psychology, and neuroscience.",
    notesCount: 9,
    referencesCount: 4,
    relatedConcepts: ["Artificial Intelligence", "Knowledge", "Research"],
    x: -20,
    y: -90,
  },
  {
    id: "research",
    label: "Research",
    description: "Systematic investigation and gathering of insights to construct new theories, hypotheses, and knowledge graphs.",
    notesCount: 22,
    referencesCount: 15,
    relatedConcepts: ["Cognitive Science", "Ideas", "Knowledge"],
    x: 40,
    y: -70,
  },
  {
    id: "ideas",
    label: "Ideas",
    description: "Conceptual sparks and raw thoughts that serve as the seeds for complex papers, designs, and systems.",
    notesCount: 31,
    referencesCount: 6,
    relatedConcepts: ["Research", "Creativity", "Knowledge"],
    x: 80,
    y: -10,
  },
  {
    id: "knowledge",
    label: "Knowledge",
    description: "The synthesis of structured information, connections, and personal insights mapped as a living universe.",
    notesCount: 45,
    referencesCount: 24,
    relatedConcepts: [
      "Artificial Intelligence",
      "Cognitive Science",
      "Research",
      "Ideas",
      "Creativity",
      "Information Theory",
    ],
    x: 0,
    y: 0,
  },
  {
    id: "creativity",
    label: "Creativity",
    description: "The cognitive capability to form novel connections between seemingly unrelated concepts or thoughts.",
    notesCount: 12,
    referencesCount: 3,
    relatedConcepts: ["Ideas", "Knowledge"],
    x: 50,
    y: 70,
  },
  {
    id: "info-theory",
    label: "Information Theory",
    description: "The mathematical study of the coding of information, transmission rates, entropy, and signal processing.",
    notesCount: 8,
    referencesCount: 5,
    relatedConcepts: ["Artificial Intelligence", "Knowledge"],
    x: -60,
    y: 60,
  },
];

export const mockEdges: GraphEdge[] = [
  { source: "ai", target: "cog-sci" },
  { source: "ai", target: "knowledge" },
  { source: "ai", target: "info-theory" },
  { source: "cog-sci", target: "knowledge" },
  { source: "cog-sci", target: "research" },
  { source: "research", target: "knowledge" },
  { source: "research", target: "ideas" },
  { source: "ideas", target: "knowledge" },
  { source: "ideas", target: "creativity" },
  { source: "knowledge", target: "creativity" },
  { source: "knowledge", target: "info-theory" },
];
