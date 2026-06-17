const TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T
  ts: number
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`NutrIA:${key}`)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.ts > TTL_MS) {
      localStorage.removeItem(`NutrIA:${key}`)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function cacheSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`NutrIA:${key}`, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // storage full, ignore
  }
}

export function cacheInvalidate(prefix: string): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(`NutrIA:${prefix}`))
  keys.forEach(k => localStorage.removeItem(k))
}