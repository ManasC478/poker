"use client"

import { useEffect, useRef, useState } from "react"
import { formatSigned } from "@/lib/format"

/**
 * A dollar amount that smoothly counts up/down (slot-machine style)
 * whenever `value` changes.
 */
export function AnimatedMoney({
  value,
  duration = 1600,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  const [display, setDisplay] = useState(value)
  const displayRef = useRef(value)
  const rafRef = useRef(0)

  useEffect(() => {
    const from = displayRef.current
    if (from === value) return
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = from + (value - from) * eased
      displayRef.current = v
      setDisplay(v)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  const color =
    display > 0.005
      ? "var(--win)"
      : display < -0.005
        ? "var(--loss)"
        : "var(--muted-foreground)"

  return (
    <span className={className} style={{ color }}>
      {formatSigned(display)}
    </span>
  )
}
