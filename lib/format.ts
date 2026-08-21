export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  const intervals: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.35, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ]
  let value = seconds
  let unit = "s"
  let divisor = 1
  for (let i = 0; i < intervals.length; i++) {
    const [step, label] = intervals[i]
    if (value < step) {
      unit = i === 0 ? "s" : intervals[i - 1][1]
      break
    }
    divisor *= step
    value = seconds / divisor
    unit = label
  }
  const rounded = Math.max(1, Math.floor(value))
  return `${rounded}${unit}`
}

export function compactNumber(n: number) {
  if (Math.abs(n) < 1000) return String(n)
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n)
}

export const LANGUAGES = [
  { value: "html", label: "HTML/CSS/JS", runnable: true },
  { value: "javascript", label: "JavaScript", runnable: false },
  { value: "typescript", label: "TypeScript", runnable: false },
  { value: "python", label: "Python", runnable: false },
  { value: "jsx", label: "React / JSX", runnable: false },
  { value: "css", label: "CSS", runnable: false },
  { value: "json", label: "JSON", runnable: false },
  { value: "bash", label: "Shell", runnable: false },
  { value: "sql", label: "SQL", runnable: false },
  { value: "go", label: "Go", runnable: false },
  { value: "rust", label: "Rust", runnable: false },
  { value: "other", label: "Other", runnable: false },
] as const

export function languageLabel(value: string) {
  return LANGUAGES.find((l) => l.value === value)?.label ?? value
}

export function isRunnable(value: string) {
  return LANGUAGES.find((l) => l.value === value)?.runnable ?? false
}
