import { describe, expect, it } from "vitest"

import { cleanDocMarkdown, typeTableToMarkdown } from "../../apps/web/lib/doc-markdown"

const SAMPLE = [
  "# ListCut (/docs/helpers/list-cut)",
  "",
  "<Preview>",
  "  <ListCutDemo />",
  "</Preview>",
  "",
  "<DialogDemo />",
  "<StateCutDemo />",
  "",
  "<Steps>",
  "  <Step>",
  "    ### Install the layer [#install-the-layer]",
  "",
  "    ```bash",
  "    npx shadcn add @keyframery/cuts",
  "    ```",
  "  </Step>",
  "</Steps>",
  "",
  '<Tabs items="[&#x22;Next.js&#x22;, &#x22;Vite&#x22;]">',
  '  <Tab value="Next.js">',
  "    ```tsx",
  "    <Tabs>",
  "      <Cuts />",
  "    </Tabs>",
  "    ```",
  "  </Tab>",
  "</Tabs>",
].join("\n")

describe("cleanDocMarkdown", () => {
  const out = cleanDocMarkdown(SAMPLE)

  it("drops live demos", () => {
    expect(out).not.toContain("Preview")
    expect(out).not.toContain("Demo")
  })

  it("flattens Steps and Tabs and dedents what was inside, so headings stay headings", () => {
    expect(out).not.toMatch(/<\/?Steps?>/)
    expect(out).toContain("\n### Install the layer [#install-the-layer]\n")
    expect(out).toContain("\n```bash\nnpx shadcn add @keyframery/cuts\n```\n")
    expect(out).toContain("**Next.js**")
  })

  it("leaves code blocks alone, even when they contain tags the cleaner removes elsewhere", () => {
    expect(out).toContain("```tsx\n<Tabs>\n  <Cuts />\n</Tabs>\n```")
  })
})

describe("typeTableToMarkdown", () => {
  const attr = [
    "{",
    "  id: { description: &#x22;The item's stable id.&#x22;, type: &#x22;string | number&#x22;, required: true },",
    "  as: { description: &#x22;The item element.&#x22;, type: &#x22;React.ElementType&#x22;, default: '&#x22;div&#x22;' },",
    "  'data-cut=\"none\"': { description: &#x22;Stock timing (aria-live=\\&#x22;polite\\&#x22;).&#x22;, type: '&#x22;none&#x22;' },",
    "}",
  ].join("\n")
  const table = typeTableToMarkdown(attr)

  it("renders one row per prop, with escaped pipes and the required/default column", () => {
    expect(table.split("\n")[0]).toBe("| Prop | Type | Default | Description |")
    expect(table).toContain("| `id` | `string \\| number` | required | The item's stable id. |")
    expect(table).toContain('| `as` | `React.ElementType` | `"div"` | The item element. |')
    expect(table).toContain('| `data-cut="none"` | `"none"` |  | Stock timing (aria-live="polite"). |')
  })
})
