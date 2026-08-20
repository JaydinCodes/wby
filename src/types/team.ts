export interface Team {
  id: string;
  name: string;
  score: number;
  logo: string;

  desktopHeroImage: string;
  mobileHeroImage: string;

  accent: string;
  accentGlow: string;

  heroPosition?: string;
  heroScale?: number;
}
