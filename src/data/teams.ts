// src/data/teams.ts
import type { Team } from "../types/team";

export const initialTeams: Team[] = [
  {
    id: "chosen",
    name: "The Chosen",
    score: 0,
    logo: "/images/chosen.png",

    desktopHeroImage: "/images/team-art/optimized/chosen-hero-1440.webp",
    mobileHeroImage: "/images/team-art/optimized/chosen-hero-720.webp",

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

    desktopHeroImage: "/images/team-art/optimized/eagles-hero-1440.webp",
    mobileHeroImage: "/images/team-art/optimized/eagles-hero-720.webp",

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

    desktopHeroImage: "/images/team-art/optimized/pathfinders-hero-1440.webp",
    mobileHeroImage: "/images/team-art/optimized/pathfinders-hero-720.webp",

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

    desktopHeroImage: "/images/team-art/optimized/striped-hero-1440.webp",
    mobileHeroImage: "/images/team-art/optimized/striped-hero-720.webp",

    accent: "#f97316",
    accentGlow: "rgba(249, 115, 22, 0.55)",

    heroPosition: "77% 50%",
    heroScale: 1.13,
  },
];
