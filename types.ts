
export interface VocabularyItem {
  id: number;
  en: string;
  tr: string;
  example?: string;
}

export type ViewMode = 'card' | 'list';
