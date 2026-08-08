import { cn } from "@/lib/utils"

export default function NumberInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder,
  wide,
  disabled=false
}: {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  wide?: boolean
  disabled?: boolean
}) {
  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    if (v === "" || /^\d*\.?\d*$/.test(v)) onChange(v)
  }
  return (
    <div className={`relative ${wide ? "w-24" : "w-20"} shrink-0`}>
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        $
      </span>
      <input
        inputMode="decimal"
        value={value}
        onChange={handle}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn("h-10 w-full rounded-lg border border-input pl-5 pr-1.5 text-right text-sm tabular-nums outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring", !disabled && "bg-background")}
        disabled={disabled}
      />
    </div>
  )
}
