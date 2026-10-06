import { notFound } from "next/navigation"

import { TooltipProvider } from "@/components/ui/tooltip"

import { EXAMPLES } from "../examples"

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(EXAMPLES).map((name) => ({ name }))
}

export default async function SinkPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const load = EXAMPLES[name]
  if (!load) notFound()
  const { default: Example } = await load()
  return (
    <main data-testid="sink" className="min-h-dvh bg-background p-6">
      {/* shadcn's own site wraps its examples in this provider; Radix tooltips need it. */}
      <TooltipProvider>
        <Example />
      </TooltipProvider>
    </main>
  )
}
