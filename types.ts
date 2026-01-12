export enum ViewMode {
  EDITOR = 'EDITOR',
  PREVIEW = 'PREVIEW',
  SPLIT = 'SPLIT'
}

export enum ExportFormat {
  HTML = 'HTML',
  PDF = 'PDF',
  IMAGE = 'IMAGE'
}

export interface AiResponse {
  text: string;
  error?: string;
}

export enum AiActionType {
  FIX_GRAMMAR = 'Fix Grammar',
  SUMMARIZE = 'Summarize',
  EXPAND = 'Continue Writing',
  TONE_PROFESSIONAL = 'Make Professional'
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  GLASS = 'GLASS'
}