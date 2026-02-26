export interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Document {
  filename: string;
  subject: string;
}

export type Subject = 'Math' | 'Physics' | 'Chemistry';

export interface MCQ {
  question: string;
  options: string[];
  answer: number;
}

export interface ShortQuestion {
  question: string;
  answer: string;
}

export interface StudyData {
  mcqs: MCQ[];
  short: ShortQuestion[];
}

export interface ChatResponse {
  text?: string;
  error?: string;
}
