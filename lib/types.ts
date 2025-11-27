export type NavSection = {
  id: string
  label: string
}

export type Metric = {
  label: string
  value: string
  detail: string
}

export type StudioRitual = {
  focus: string
  headline: string
  copy: string
}

export type TimelineEntry = {
  year: string
  role: string
  summary: string
  locale: string
  tags: string[]
}

export type Project = {
  name: string
  subtitle: string
  description: string
  cycle: string
  accent: string
  tags: string[]
}

export type Experiment = {
  title: string
  descriptor: string
  status: string
  palette: string
}
