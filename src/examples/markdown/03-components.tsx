// Your own elements
// `components` swaps any element by its tag name, and `codeBlock` replaces fenced code. Each gets the element's props, including its `data-slot`, so the styles still reach it. Keep the object outside render.
import type * as React from "react"

import { Markdown, type MarkdownComponents } from "@/components/ui/markdown"

const components: MarkdownComponents = {
  a: (props: React.ComponentProps<"a">) => <a {...props} className="font-medium text-primary" />,
}

export default function MarkdownComponentsExample() {
  return (
    <Markdown className="max-w-[380px]" components={components}>
      {"Your refund is on its way. Track it in [your orders](#orders) or reply here with the order number."}
    </Markdown>
  )
}
