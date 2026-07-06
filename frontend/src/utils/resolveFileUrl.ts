const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Resolves a relative file URL to a full URL.
 * Converts /uploads/cars/{id}/photo.jpg → /api/v1/cars/{id}/photo
 * This uses the backend endpoint which serves files directly.
 */
export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  // Convert /uploads/cars/{id}/photo.{ext} to /api/v1/cars/{id}/photo
  const carPhotoMatch = url.match(/^\/uploads\/cars\/([^/]+)\/photo\.\w+$/)
  if (carPhotoMatch) {
    return `${API_URL}/api/v1/cars/${carPhotoMatch[1]}/photo`
  }

  // Other uploads - use the backend static files
  return `${API_URL}${url}`
}
