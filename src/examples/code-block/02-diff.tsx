// A diff
// Mark lines with `added` and `removed`. Each gets a tint and a + or − in the gutter, so the change never rests on colour alone.
import { CodeBlock, CodeBlockContent, CodeBlockHeader, CodeBlockTitle } from "@/components/ui/code-block"

const code = `.price {
  font-weight: 500;
  color: #6b6b6b;
  color: var(--muted-foreground);
  font-variant-numeric: tabular-nums;
}`

export default function CodeBlockDiff() {
  return (
    <CodeBlock code={code} language="css" removed={[3]} added={[4, 5]} className="max-w-[420px]">
      <CodeBlockHeader>
        <CodeBlockTitle>styles/cart.css</CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  )
}
