// Line numbers and highlighted lines
// `lineNumbers` numbers each line; `highlight` takes line numbers, and their bands sweep in from the left.
import { CodeBlock, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/ui/code-block"

const code = `{
  "name": "corner-shop",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`

export default function CodeBlockLineNumbers() {
  return (
    <CodeBlock code={code} language="json" lineNumbers highlight={[5, 6]} className="max-w-[420px]">
      <CodeBlockHeader>
        <CodeBlockTitle>package.json</CodeBlockTitle>
        <CodeBlockCopyButton className="ms-auto" />
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  )
}
