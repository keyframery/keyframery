// Code and tables
// Fenced code is Keyframery's code block, with its language and a copy button. Tables scroll sideways on a narrow screen and take their column alignment from the divider row.
import { Markdown } from "@/components/ui/markdown"

const text = `| Stop | Arrives | Platform |
| :-- | --: | :-: |
| Coimbra-B | 10:42 | 2 |
| Porto Campanhã | 11:58 | 5 |

\`\`\`bash
curl https://api.example.com/trains?from=lisbon
\`\`\``

export default function MarkdownCodeAndTables() {
  return <Markdown className="w-full max-w-[420px]">{text}</Markdown>
}
