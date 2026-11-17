// Floating copy button
// Put `CodeBlockActions` straight inside `CodeBlock` and the copy key floats over the corner, showing on hover or focus.
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton } from "@/components/ui/code-block"

export default function CodeBlockFloatingCopy() {
  return (
    <CodeBlock code={`git switch -c fix/receipt-totals`} language="bash" size="sm" className="max-w-[420px]">
      <CodeBlockActions>
        <CodeBlockCopyButton />
      </CodeBlockActions>
      <CodeBlockContent className="pe-12" />
    </CodeBlock>
  )
}
