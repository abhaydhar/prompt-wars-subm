export type DisabilityType = 
  | 'Deaf' 
  | 'Blind' 
  | 'Motor' 
  | 'Cognitive' 
  | 'Multiple' 
  | 'None';

export type LearningPreference = 
  | 'Visual' 
  | 'Auditory' 
  | 'Reading' 
  | 'Kinesthetic';

export interface StudentProfile {
  disability: DisabilityType;
  preferences: LearningPreference[];
  pace: number; // 0.5 to 2
  language: string;
  textSize: number;
  highContrast: boolean;
  reduceAnimations: boolean;
  readingOrderSimplified: boolean;
}

export interface ContentOutput {
  id: string;
  originalTitle: string;
  formats: {
    signLanguageVideo?: string; // URL
    screenReaderTranscript?: string; // HTML
    tactileDescription?: string; // Text
    simplifiedText?: string; // Grade 5
    kinestheticSteps?: string[]; // Steps
    summaryVariants?: {
      slow: string;
      medium: string;
      fast: string;
    };
    flashcards?: { question: string; answer: string }[];
  }
}
