import { CodeBlock, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/ui/code-block"

export default function Usage() {
  return (
    <CodeBlock code={`npm install @ui-sdk/react @ui-sdk/core`} language="bash">
      <CodeBlockHeader>
        <CodeBlockTitle>Terminal</CodeBlockTitle>
        <CodeBlockCopyButton className="ms-auto" />
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  )
}
