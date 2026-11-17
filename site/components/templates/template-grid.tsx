import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { templates } from "@site/lib/templates"

/** Every template as a card: a picture of its first screen, what it is, and the way in. */
export function TemplateGrid() {
  return (
    <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
      {templates.map((item) => (
        <Link
          key={item.slug}
          href={`/docs/templates/${item.slug}`}
          className="group flex flex-col overflow-hidden rounded-xl border bg-card outline-none hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="block aspect-[16/10] overflow-hidden border-b bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/templates/${item.slug}.jpg`} alt={`The first screen of the ${item.name} template`} width={1440} height={900} loading="lazy" className="size-full object-cover object-top" />
          </span>
          <span className="flex flex-1 flex-col gap-1.5 p-4">
            <span className="flex items-center gap-2">
              <span className="text-[15px] font-semibold tracking-tight">{item.name}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] leading-4 font-medium text-muted-foreground">{item.price}</span>
              <span className="ms-auto text-[12px] text-muted-foreground">{item.kind}</span>
            </span>
            <span className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">{item.description}</span>
            <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium">
              Open the template
              <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}
