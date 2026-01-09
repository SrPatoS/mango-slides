export interface Slide {
  id: string;
  title: string;
  subtitle: string;
}

export type ContentDensity = "bullets" | "low" | "medium" | "high";

export type SlideTheme = "light" | "dark" | "corporate" | "purple" | "minimal";

export type SlideFont = "sans" | "serif" | "mono" | "display" | "handwritten" | "times";

export interface AiGenerationConfig {
  prompt: string;
  numSlides: number;
  density: ContentDensity;
  includeQuiz: boolean;
  numQuizQuestions: number;
  model: string;
}
