import Link from "next/link"
import type { ComponentProps } from "react"

/** A link in a post or on an author page. Links to other sites open in a new tab, as they do in the docs. */
export function PreviewLink({ href = "#", children, rel, ...props }: ComponentProps<"a">) {
  const external = /^\w+:/.test(href) || href.startsWith("//")
  if (external || href.startsWith("#")) {
    const outward = external ? { target: "_blank", rel: [rel, "noreferrer noopener"].filter(Boolean).join(" ") } : { rel }
    return (
      <a href={href} {...props} {...outward}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} {...props} rel={rel}>
      {children}
    </Link>
  )
}
