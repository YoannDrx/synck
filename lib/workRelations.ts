import type { GalleryWork } from './prismaProjetsUtils'

export type SimpleWork = {
  slug: string
  title: string
  subtitle?: string
  category: string
  categorySlug?: string
  coverImage: string
  coverImageAlt: string
  relatedProjectSlugs?: string[]
}

export type WorkRelations = {
  projectToClips: Record<string, SimpleWork[]>
  clipToProjects: Record<string, SimpleWork[]>
}

const manualClipToProjectMap: Record<string, string[]> = {
  ailleurs: ['trap-in-the-cloud'],
  'alien-suites-remixes': ['odissey-suites-remix'],
  'dark-ambient-2-making-of': ['dark-ambient-vol-2'],
  'garden-of-eden': ['the-trip'],
  'hold-me-closer': ['brand-content'],
  'klang-brutt': ['velodrome', 'acid'],
}

export function toSimpleWork(work: GalleryWork): SimpleWork {
  return {
    slug: work.slug,
    title: work.title,
    subtitle: work.subtitle,
    category: work.category,
    categorySlug: work.categorySlug,
    coverImage: work.coverImage,
    coverImageAlt: work.coverImageAlt ?? work.title,
    relatedProjectSlugs:
      (work as unknown as { relatedProjectSlugs?: string[] }).relatedProjectSlugs ?? undefined,
  }
}

export function buildWorkRelations(works: SimpleWork[]): WorkRelations {
  const projectToClips: Record<string, SimpleWork[]> = {}
  const clipToProjects: Record<string, SimpleWork[]> = {}

  const workBySlug = new Map(works.map((w) => [w.slug, w]))
  const isClip = (work: SimpleWork) => {
    const catSlug = (work.categorySlug ?? '').toLowerCase()
    const catName = (work.category ?? '').toLowerCase()
    return (
      catSlug === 'clip' ||
      catSlug === 'music-video' ||
      catName.includes('clip') ||
      catName.includes('music video') ||
      catName.includes('video')
    )
  }

  const clips = works.filter(isClip)

  const addRelation = (projectSlug: string, clip: SimpleWork) => {
    if (!projectToClips[projectSlug]) projectToClips[projectSlug] = []
    if (!projectToClips[projectSlug].some((c) => c.slug === clip.slug)) {
      projectToClips[projectSlug].push(clip)
    }
    if (!clipToProjects[clip.slug]) clipToProjects[clip.slug] = []
    const project = workBySlug.get(projectSlug)
    if (project && !clipToProjects[clip.slug].some((p) => p.slug === projectSlug)) {
      clipToProjects[clip.slug].push(project)
    }
  }

  clips.forEach((clip) => {
    const manualTargets = manualClipToProjectMap[clip.slug]
    if (manualTargets) {
      manualTargets.forEach((projectSlug) => {
        if (workBySlug.has(projectSlug)) {
          addRelation(projectSlug, clip)
        }
      })
    }

    const normalizedBase = clip.slug.replace(/-\d+$/, '').replace(/-clip$/, '')
    const baseMatch = workBySlug.get(normalizedBase)
    if (baseMatch && baseMatch.slug !== clip.slug) {
      addRelation(baseMatch.slug, clip)
    }

    if (Array.isArray(clip.relatedProjectSlugs)) {
      clip.relatedProjectSlugs.forEach((projectSlug) => {
        if (workBySlug.has(projectSlug)) {
          addRelation(projectSlug, clip)
        }
      })
    }
  })

  return { projectToClips, clipToProjects }
}
