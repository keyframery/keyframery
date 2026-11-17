import { entry } from "@site/lib/catalog"

/** Compact facts under the description; the live example remains the main visual object. */
export function PageChips({ slug }: { slug: string }) {
  const component = entry(slug)
  if (!component) return null
  const moves = [...new Set(component.moves.map(([move]) => move))].slice(0, 4)
  const sdk = component.sdk
    ? { text: `UI SDK ${component.sdk}`, href: `https://ui-sdk.dev/docs/components/${component.sdk}` }
    : component.core
      ? { text: "UI SDK core", href: "https://ui-sdk.dev/docs/core" }
      : null
  const facts = [
    ...(sdk ? [sdk] : []),
    ...(moves.length ? [{ text: moves.join(" · "), href: "#motion" }] : []),
    { text: "Plain CSS", href: "/docs/motion-styles#how-it-works" },
  ]
  return (
    <ul aria-label="At a glance" className="not-prose flex flex-wrap gap-x-4 gap-y-1 text-[11px] leading-5 text-muted-foreground">
      {facts.map(({ text, href }) => (
        <li key={text}>
          <a href={href} className="rounded-sm outline-none hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">
            {text}
          </a>
        </li>
      ))}
    </ul>
  )
}
