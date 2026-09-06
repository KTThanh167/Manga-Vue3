const ALLOWED_HOSTS = new Set(['sv1.otruyencdn.com', 'otruyenapi.com'])

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ status: 'error', message: 'Method not allowed' })
  }

  const target = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url

  if (!target) {
    return res.status(400).json({ status: 'error', message: 'Missing chapter url' })
  }

  let chapterUrl
  try {
    chapterUrl = new URL(target)
  } catch {
    return res.status(400).json({ status: 'error', message: 'Invalid chapter url' })
  }

  if (chapterUrl.protocol !== 'https:' || !ALLOWED_HOSTS.has(chapterUrl.hostname)) {
    return res.status(400).json({ status: 'error', message: 'Unsupported chapter host' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)

  try {
    const upstream = await fetch(chapterUrl.toString(), {
      headers: {
        accept: 'application/json',
        'user-agent': 'MangaReal/1.0',
      },
      signal: controller.signal,
    })
    const body = await upstream.text()

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400')
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.status(upstream.status).send(body)
  } catch (error) {
    const message =
      error.name === 'AbortError'
        ? 'OTruyen chapter server timed out'
        : 'Could not load OTruyen chapter'

    return res.status(502).json({ status: 'error', message })
  } finally {
    clearTimeout(timeout)
  }
}
