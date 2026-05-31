export function resolveAssetUrl(url) {
  if (!url) return null
  if (url.startsWith('/uploads/')) return url

  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }

    if (parsed.host === 'localhost:5000' || parsed.host === '127.0.0.1:5000') {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }

    return url
  } catch {
    return url
  }
}
