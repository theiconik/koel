export type SurveyStatus = "live" | "draft" | "closed";

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
}

export interface Response {
  id: string;
  surveyId: string;
  respondentName: string;
  respondentRole: string;
  isAnonymous: boolean;
  quote: string;
  duration: string;
  tags: string[];
  createdAt: string;
}

export interface Theme {
  name: string;
  count: number;
  color: string;
}

export interface DashboardStats {
  activeSurveys: number;
  voicesThisWeek: number;
  hoursOfAudio: number;
  completionRate: string;
  voicesNote: string;
}

export interface InsightMessage {
  role: "user" | "assistant";
  text: string;
}
