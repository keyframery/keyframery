import { cn } from "@/lib/utils"

/** How every home section opens: the heading, and one or two sentences under it. */
export function SectionHeading({ id, title, children, className }: { id: string; title: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-[60ch]", className)}>
      <h2 id={id} className="text-[32px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance md:text-[44px]">
        {title}
      </h2>
      {children && <div className="mt-4 text-[17px] leading-relaxed text-pretty text-muted-foreground">{children}</div>}
    </div>
  )
}
