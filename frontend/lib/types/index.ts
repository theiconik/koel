export type SurveyStatus = "live" | "draft" | "closed";
export type Sentiment = "delighted" | "neutral" | "frustrated";

export interface TranscriptSegment {
  t: string;
  who: "koel" | "them";
  text: string;
  highlight?: boolean;
}

export interface ThemeQuote {
  q: string;
  who: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: SurveyStatus;
  responseCount: number;
  avgDuration: string;
  completionRate: string;
  questions: Question[];
  createdAt: string;
  shareUrl: string;
}

export interface Question {
  id: string;
  text: string;
  order: number;
  askedCount?: number;
  answeredCount?: number;
  avgFollowUps?: number;
  topTag?: string;
}

export interface Response {
  id: string;
  surveyId: string;
  respondentName: string;
  respondentRole: string;
  isAnonymous: boolean;
  quote: string;
  duration: string;
  durationSeconds: number;
  tags: string[];
  sentiment: Sentiment;
  transcript: TranscriptSegment[];
  koelSummary: string;
  createdAt: string;
}

export interface Theme {
  name: string;
  count: number;
  color: string;
  summary?: string;
  quotes?: ThemeQuote[];
}

export interface DashboardStats {
  activeSurveys: number;
  voicesThisWeek: number;
  hoursOfAudio: number;
  completionRate: string;
  voicesNote: string;
}

export interface InsightMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export type VoiceAgentMode = "speaking" | "listening" | "thinking" | "ended" | "error";

export interface VoiceAgentSnapshot {
  mode: VoiceAgentMode;
  caption: string;
  level: number;
  elapsedSeconds: number;
  canInterrupt: boolean;
  conversationId?: string;
  error?: string;
}

export interface VoiceAgentSession {
  getSnapshot: () => VoiceAgentSnapshot;
  subscribe: (listener: () => void) => () => void;
  start: () => void;
  interrupt: () => void;
  end: () => void;
  dispose: () => void;
}
