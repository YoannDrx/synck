export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateUniqueSlug(base: string, existing: string[]): string {
  let slug = slugify(base)
  let counter = 1

  while (existing.includes(slug)) {
    slug = `${slugify(base)}-${String(counter)}`
    counter++
  }

  return slug
}
