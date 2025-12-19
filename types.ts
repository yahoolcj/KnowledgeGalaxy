
export interface GraphNode {
  id: string;
  name: string;
  type: 'concept' | 'entity' | 'person' | 'location' | 'event' | 'document';
  val: number; // Size/Importance
  color?: string;
  description?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
  strength?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ProcessingState {
  status: 'idle' | 'parsing' | 'analyzing' | 'rendering' | 'error';
  progress: number;
  message: string;
}

export type VendorID = 'google' | 'deepseek' | 'alibaba' | 'bytedance';

export interface AppConfig {
  vendor: VendorID;
  apiKey: string;
  model: string;
}

export interface AnalysisLog {
  id: string;
  timestamp: number;
  filename: string;
  vendor: VendorID;
  model: string;
  status: 'success' | 'error';
  errorMessage?: string;
}
