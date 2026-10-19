import { describe, expect, it } from "vitest"

import { cleanDocMarkdown, renderDocMarkdown, typeTableToMarkdown } from "../../apps/web/lib/doc-markdown"

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

  it("keeps the table a CutCards wraps, and turns a callout's title into a bold line", () => {
    const md = cleanDocMarkdown(
      [
        '<CutCards menu="dialog">',
        "",
        "| Cut | What you see | Code |",
        "|---|---|---|",
        '| Fade | Fades in where it stands. | `<Cuts dialog="fade" />` |',
        "",
        "</CutCards>",
        "",
        '<Callout title="Nothing moves here, on purpose">',
        "There's nothing to set up.",
        "</Callout>",
        "",
        '<Playground slug="dialog" />',
      ].join("\n"),
    )
    expect(md).not.toMatch(/CutCards|Callout|Playground/)
    expect(md).toContain('| Fade | Fades in where it stands. | `<Cuts dialog="fade" />` |')
    expect(md).toContain("**Nothing moves here, on purpose**\n\nThere's nothing to set up.")
  })

  it("turns install tabs into the one npm command they were written as", () => {
    const md = cleanDocMarkdown(
      [
        "Add it:",
        "",
        '<CodeBlockTabs defaultValue="npm">',
        "  <CodeBlockTabsList>",
        '    <CodeBlockTabsTrigger value="npm">',
        "      npm",
        "    </CodeBlockTabsTrigger>",
        "  </CodeBlockTabsList>",
        "",
        '  <CodeBlockTab value="npm">',
        "    ```bash",
        "    npx shadcn add dialog",
        "    ```",
        "  </CodeBlockTab>",
        "",
        '  <CodeBlockTab value="pnpm">',
        "    ```bash",
        "    pnpm dlx shadcn add dialog",
        "    ```",
        "  </CodeBlockTab>",
        "</CodeBlockTabs>",
        "",
        "Done.",
      ].join("\n"),
    )
    expect(md).toBe("Add it:\n\n```bash\nnpx shadcn add dialog\n```\n\nDone.")
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

describe("renderDocMarkdown", () => {
  const description = "Use the existing components with one root motion layer."

  it("includes the visible description before setup code and keeps the FAQ", () => {
    const md = renderDocMarkdown({
      title: "Setup",
      url: "/docs/installation",
      description,
      body: '<Tabs>\n  <Tab value="Vite">\n    ```tsx\n    <Cuts />\n    ```\n  </Tab>\n</Tabs>',
      faq: [{ q: "Can I keep my components?", a: "Yes. Render `<Cuts />` once." }],
    })
    expect(md.startsWith(`# Setup (/docs/installation)\n\n${description}\n\n`)).toBe(true)
    expect(md).toContain("**Vite**\n\n```tsx\n<Cuts />\n```")
    expect(md).toContain("## Questions\n\n### Can I keep my components?\n\nYes. Render `<Cuts />` once.")
    expect(md.split(description)).toHaveLength(2)
  })

  it("does not repeat a description already present in the opening paragraph", () => {
    const md = renderDocMarkdown({ title: "Setup", url: "/docs/installation", description, body: `\n${description}\n\n## Install\n\nRead the setup.` })
    expect(md.split(description)).toHaveLength(2)
    expect(md).toContain("## Install\n\nRead the setup.")
  })

  it("recognizes matching Markdown formatting and whitespace without deleting code", () => {
    const md = renderDocMarkdown({ title: "Setup", url: "/docs/installation", description: "Use Cuts for motion.", body: "Use `Cuts`\nfor **motion**.\n\n```tsx\nconst description = 'Use Cuts for motion.'\n```" })
    expect(md.startsWith("# Setup (/docs/installation)\n\nUse `Cuts`\nfor **motion**.")).toBe(true)
    expect(md).toContain("```tsx\nconst description = 'Use Cuts for motion.'\n```")
  })

  it("allows pages without a description or FAQ", () => {
    expect(renderDocMarkdown({ title: "Reference", url: "/docs/reference", body: "## API\n\n`pace`" })).toBe("# Reference (/docs/reference)\n\n## API\n\n`pace`")
  })
})
