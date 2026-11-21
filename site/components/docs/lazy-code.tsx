"use client"

import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock"
import * as React from "react"

const HighlightedCode = React.lazy(() => import("fumadocs-ui/components/dynamic-codeblock").then(({ DynamicCodeBlock }) => ({ default: DynamicCodeBlock })))

// The same themes the server uses for every other code block (source.config.ts).
const themes = { light: "github-light-high-contrast", dark: "github-dark-high-contrast" }

/* A source file in a part of the page that starts closed (the Manual install tab's accordions).

   The page carries the file as plain text and shows it in the usual code frame at once, so it can be read, copied and
   found with the browser's search before any highlighter has loaded. Colour arrives when the block first scrolls into
   view. See site/lib/rehype-lazy-code.ts for why these blocks are not highlighted on the server. */
export function LazyCode({ code, lang }: { code: string; lang: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [seen, setSeen] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element || seen) return
    // Without the observer there is no cheap way to wait, so highlight straight away.
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true)
      return
    }
    const observer = new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && setSeen(true), { rootMargin: "200px" })
    observer.observe(element)
    return () => observer.disconnect()
  }, [seen])

  const plain = (
    <CodeBlock className="my-0">
      <Pre>
        <code>
          {code.split("\n").map((line, index) => (
            <span key={index} className="line">
              {line}
            </span>
          ))}
        </code>
      </Pre>
    </CodeBlock>
  )

  return (
    <div ref={ref} data-lazy-code={seen ? "highlighted" : "plain"}>
      {seen ? (
        <React.Suspense fallback={plain}>
          <HighlightedCode code={code} lang={lang} options={{ themes }} />
        </React.Suspense>
      ) : (
        plain
      )}
    </div>
  )
}
