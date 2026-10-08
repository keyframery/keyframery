import Link from "next/link"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PRO_ENABLED } from "@/lib/pro"
import { faqData, JsonLd } from "@/lib/seo"

const code = "font-mono text-[13px] text-foreground"

/** `text` is the plain answer for the FAQ structured data; a string answer is its own text. */
const QUESTIONS: ({ q: string; a: string } | { q: string; a: React.ReactNode; text: string })[] = [
  {
    q: "Does it change my components?",
    a: (
      <>
        No. <code className={code}>{"<Cuts />"}</code> finds shadcn&apos;s own parts by their <code className={code}>data-slot</code> names and adds the motion
        with CSS. Nothing in components/ui is edited. Remove the line and you have stock shadcn again.
      </>
    ),
    text: "No. <Cuts /> finds shadcn's own parts by their data-slot names and adds the motion with CSS. Nothing in components/ui is edited. Remove the line and you have stock shadcn again.",
  },
  {
    q: "Does shadcn/ui use Framer Motion?",
    a: "No. shadcn/ui animates with CSS classes from tw-animate-css (tailwindcss-animate in older projects) on its Radix or Base UI parts. Keyframery keeps that approach: it adds its motion with CSS and the Web Animations API, so it doesn't need Motion (formerly Framer Motion) or any other dependency.",
  },
  {
    q: "Does it work with Base UI and Radix?",
    a: "Yes, both. Keyframery reads the open and closed states each library sets, and every cut is tested with each of them in Chromium, Firefox and WebKit.",
  },
  {
    q: "Which frameworks does it support?",
    a: "Any React app with shadcn/ui set up. Next.js, Vite and React Router are tested. It is safe with server rendering: on the server it renders nothing, and the page looks like stock shadcn until it mounts.",
  },
  {
    q: "What about people who turn animations off?",
    a: "When the system asks for reduced motion, every cut becomes a short fade of about 120 to 160 ms: nothing moves, scales or blurs.",
  },
  {
    q: "How big is it?",
    a: (
      <>
        About 7 KB gzipped for <code className={code}>{"<Cuts />"}</code> and its stylesheet, with no extra dependencies. Each of the four helpers adds 1.5 to
        2.6 KB.
      </>
    ),
    text: "About 7 KB gzipped for <Cuts /> and its stylesheet, with no extra dependencies. Each of the four helpers adds 1.5 to 2.6 KB.",
  },
  {
    q: "Does it work with my own components?",
    a: (
      <>
        Anything that uses shadcn&apos;s <code className={code}>data-slot</code> names gets its cuts automatically. For changes shadcn has no component for, wrap
        your markup in one of the four helpers:{" "}
        <Link href="/docs/helpers/match-cut" className="text-foreground underline underline-offset-4">
          MatchCut
        </Link>
        ,{" "}
        <Link href="/docs/helpers/list-cut" className="text-foreground underline underline-offset-4">
          ListCut
        </Link>
        ,{" "}
        <Link href="/docs/helpers/value-cut" className="text-foreground underline underline-offset-4">
          ValueCut
        </Link>{" "}
        or{" "}
        <Link href="/docs/helpers/load-cut" className="text-foreground underline underline-offset-4">
          LoadCut
        </Link>
        .
      </>
    ),
    text: "Anything that uses shadcn's data-slot names gets its cuts automatically. For changes shadcn has no component for, wrap your markup in one of the four helpers: MatchCut, ListCut, ValueCut or LoadCut.",
  },
  {
    q: "Does it work with AI coding agents?",
    a: (
      <>
        Yes. Claude Code gets a plugin: it teaches Claude which cut fits each change. Run{" "}
        <code className={code}>/plugin marketplace add keyframery/keyframery</code>, then <code className={code}>/plugin install keyframery@keyframery</code>.
        Codex, Cursor, VS Code, Gemini CLI and any other MCP client can use our MCP server at keyframery.com/mcp.{" "}
        <Link href="/docs/ai-tools" className="text-foreground underline underline-offset-4">
          More on AI tools
        </Link>
        .
      </>
    ),
    text: "Yes. Claude Code gets a plugin: it teaches Claude which cut fits each change. Run /plugin marketplace add keyframery/keyframery, then /plugin install keyframery@keyframery. Codex, Cursor, VS Code, Gemini CLI and any other MCP client can use the MCP server at keyframery.com/mcp.",
  },
  {
    q: "Is it free?",
    a: `Yes. It is MIT licensed, and the CLI copies the code into your project, so it is yours to change.${PRO_ENABLED ? " Pro, a set of ready-made app screens built on every cut, comes later." : ""}`,
  },
  {
    q: "Why is it called a cut?",
    a: (
      <>
        In film, a cut is how one shot becomes the next. A jump cut, where the subject suddenly jumps to a new place, is jarring, and most interface changes are
        jump cuts. Keyframery uses the cuts an editor would choose instead: match cuts, J-cuts, rack focus.{" "}
        <Link href="/cuts" className="text-foreground underline underline-offset-4">
          See each one
        </Link>
        .
      </>
    ),
    text: "In film, a cut is how one shot becomes the next. A jump cut, where the subject suddenly jumps to a new place, is jarring, and most interface changes are jump cuts. Keyframery uses the cuts an editor would choose instead: match cuts, J-cuts, rack focus.",
  },
]

export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 pt-24 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:pt-36">
      <h2 id="faq-title" className="text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] md:text-[38px]">
        Questions
      </h2>
      <JsonLd data={faqData(QUESTIONS.map((item) => ({ q: item.q, text: "text" in item ? item.text : item.a })))} />
      {/* hiddenUntilFound keeps closed answers in the HTML, so crawlers and find-in-page can read them. */}
      <Accordion className="border-t" hiddenUntilFound>
        {QUESTIONS.map(({ q, a }) => (
          <AccordionItem key={q} value={q}>
            <AccordionTrigger className="py-4 text-[16px]">{q}</AccordionTrigger>
            <AccordionContent>
              <p className="max-w-[62ch] pb-2 text-[15px] leading-relaxed text-muted-foreground">{a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
