const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Resolves a relative file URL (e.g. /uploads/cars/...) to a full URL
 * that works regardless of whether frontend and backend are on the same domain.
 */
export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return ''
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // Relative URL — prepend API base
  return `${API_URL}${url}`
}
