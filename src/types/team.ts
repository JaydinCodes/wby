export interface Team {
  id: string;
  name: string;
  score: number;
  logo: string;

  heroImage: string;

  accent: string;
  accentGlow: string;

  heroPosition?: string;
  heroScale?: number;
}