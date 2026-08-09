export function formatMoney(n: number): string {
  const sign = n < 0 ? "-" : ""
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatSigned(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "-" : ""
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

// Local-safe YYYY-MM-DD (avoids UTC shifting from toISOString).
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function formatLongDate(key: string): string {
  return parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(timeStr?: string | null): string | null {
  if (!timeStr) return null
  const [hStr, mStr] = timeStr.split(":")
  const h = Number.parseInt(hStr, 10)
  const m = Number.parseInt(mStr, 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr
  const period = h >= 12 ? "PM" : "AM"
  const displayHour = h % 12 === 0 ? 12 : h % 12
  const displayMin = String(m).padStart(2, "0")
  return `${displayHour}:${displayMin} ${period}`
}
