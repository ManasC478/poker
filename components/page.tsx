import React from "react"

interface PageProps {
  children: React.ReactNode
}

export default function Page({ children }: PageProps) {
  return (
    <div className="min-h-dvh mx-auto max-w-4xl px-8 py-8 md:px-10 lg:py-12">{children}</div>
  )
}
