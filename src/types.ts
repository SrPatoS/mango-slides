export interface Slide {
  id: string;
  title: string;
  subtitle: string;
}

export type ContentDensity = "bullets" | "low" | "medium" | "high";

export interface AiGenerationConfig {
  prompt: string;
  numSlides: number;
  density: ContentDensity;
  includeQuiz: boolean;
  numQuizQuestions: number;
  model: string;
}
