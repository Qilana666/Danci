export enum AppView {
  LANGUAGE_SELECT = 'LANGUAGE_SELECT',
  SEARCH = 'SEARCH',
  RESULT = 'RESULT',
  NOTEBOOK = 'NOTEBOOK',
  FLASHCARDS = 'FLASHCARDS'
}

export interface Language {
  code: string;
  name: string;
  flag: string; // Emoji
}

export interface ExampleSentence {
  target: string;
  native: string;
}

export interface WordResult {
  id: string;
  originalText: string;
  definition: string;
  examples: ExampleSentence[];
  usageNotes: string; // The "fun" casual explanation
  imageUrl?: string;
  targetLang: string;
  nativeLang: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// Structured Output Schema for Gemini
export interface AnalysisResponse {
  definition: string;
  examples: ExampleSentence[];
  usageNotes: string;
  imagePrompt: string;
}
