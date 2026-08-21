export function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function isSameLocalDay(a: number, b: number): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

export function timeLabel(ts: number): string {
  const d = new Date(ts)
  let h = d.getHours()
  const m = d.getMinutes()
  const suffix = h >= 12 ? 'p' : 'a'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${m.toString().padStart(2, '0')}${suffix}`
}

export function relativeDayLabel(ts: number, now = Date.now()): string {
  if (isSameLocalDay(ts, now)) return `Today, ${timeLabel(ts)}`
  const oneDay = 24 * 60 * 60 * 1000
  if (isSameLocalDay(ts, now - oneDay)) return `Yesterday, ${timeLabel(ts)}`
  const d = new Date(ts)
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${timeLabel(ts)}`
}
