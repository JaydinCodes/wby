// src/data/teams.ts
import type { Team } from "../types/team";

export const initialTeams: Team[] = [
  {
    id: "chosen",
    name: "The Chosen",
    score: 0,
    logo: "/images/chosen.png",

    heroImage: "/images/team-art/chosen-hero.png",

    accent: "#22d3ee",
    accentGlow: "rgba(34, 211, 238, 0.55)",

    heroPosition: "78% 47%",
    heroScale: 1.12,
  },

  {
    id: "eagles-wings",
    name: "Eagles Wings",
    score: 0,
    logo: "/images/eagles.png",

    heroImage: "/images/team-art/eagles-hero.png",

    accent: "#fbbf24",
    accentGlow: "rgba(251, 191, 36, 0.55)",

    heroPosition: "76% 49%",
    heroScale: 1.12,
  },

  {
    id: "pathfinders",
    name: "Pathfinders",
    score: 0,
    logo: "/images/pathfinders.png",

    heroImage: "/images/team-art/pathfinders-hero.png",

    accent: "#a855f7",
    accentGlow: "rgba(168, 85, 247, 0.55)",

    heroPosition: "75% 48%",
    heroScale: 1.11,
  },

  {
    id: "striped-warriors",
    name: "Striped Warriors",
    score: 0,
    logo: "/images/striped.png",

    heroImage: "/images/team-art/striped-hero.png",

    accent: "#f97316",
    accentGlow: "rgba(249, 115, 22, 0.55)",

    heroPosition: "77% 50%",
    heroScale: 1.13,
  },
];