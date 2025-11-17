export interface NavSection {
  id: string;
  label: string;
}

export interface Metric {
  label: string;
  value: string;
  detail: string;
}

export interface StudioRitual {
  focus: string;
  headline: string;
  copy: string;
}

export interface TimelineEntry {
  year: string;
  role: string;
  summary: string;
  locale: string;
  tags: string[];
}

export interface Project {
  name: string;
  subtitle: string;
  description: string;
  cycle: string;
  accent: string;
  tags: string[];
}

export interface Experiment {
  title: string;
  descriptor: string;
  status: string;
  palette: string;
}
