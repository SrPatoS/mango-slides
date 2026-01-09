export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
  activeTheme: SlideTheme;
  activeFont: SlideFont;
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'rect' | 'circle';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
}

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  elements: SlideElement[];
  backgroundColor?: string;
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

