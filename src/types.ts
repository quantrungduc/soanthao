export interface PlanFile {
  name: string;
  text: string;
  size: number;
}

export interface PlanFormData {
  communeName: string;
  areaUnit: string;
  documentType: string;
  superiorFiles: PlanFile[];
  referenceFiles: PlanFile[];
  templateFiles: PlanFile[];
  documentText: string;
  localNotes: string;
}

export interface LoadingStep {
  id: string;
  label: string;
  status: "idle" | "running" | "success" | "error";
  percentage: number;
}

export interface DraftHistoryItem {
  id: string;
  timestamp: string;
  communeName: string;
  documentTitle: string;
  htmlContent: string;
  localNotes?: string;
}

export interface DocumentSample {
  title: string;
  higherLevelUnit: string;
  notes: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  canvasUpdated?: boolean;
}
