import { ArrowRight, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { WORKS_WITH } from "@/components/home/logos"
import { AgentPromptButton } from "@/components/site/agent-prompt-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { INSTALL } from "@/lib/kinds"
import { faqData, JsonLd } from "@/lib/seo"
import { cn } from "@/lib/utils"

import horizon from "../../public/landing/horizon.jpg"
import { DialogScene, ListScene, LoadScene, MatchScene, NumberScene, SameClick, TabsScene } from "./demos"
import { HeroApp } from "./hero-app"
import { HeroTitle } from "./hero-title"
import { KeyframeArc } from "./keyframe-arc"
import { CopyLines, SkillTerminal } from "./skill-terminal"

export const PLUGIN = ["/plugin marketplace add keyframery/keyframery", "/plugin install keyframery@keyframery"]
const wrap = "mx-auto w-full max-w-[1200px] px-4 sm:px-6"
const code = "font-mono text-[0.9em] text-[var(--lp-ink)]"

function Heading({ id, eyebrow, title, children, className }: { id: string; eyebrow?: string; title: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {eyebrow && <p className="lp-tag">{eyebrow}</p>}
      <h2 id={id} className="lp-display mt-5 max-w-[20ch] text-[36px] leading-[1.05] text-balance md:text-[54px]">
        {title}
      </h2>
      {children && <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-pretty lp-muted">{children}</p>}
    </div>
  )
}

/* ---------------------------------------------------------------- Hero: the orbital sunrise */

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate -mt-14 overflow-hidden">
      {/* Sky above the photo, then the photo itself (NASA, public domain), fading into the page. */}
      <div aria-hidden="true" className="lp-hero-sky absolute inset-x-0 top-0 -z-20 h-[760px]" />
      <div aria-hidden="true" className="lp-photo absolute inset-x-0 top-[470px] -z-20 h-[640px] sm:top-[420px] sm:h-auto sm:aspect-[4928/2768]">
        <Image src={horizon} alt="" fill priority sizes="100vw" placeholder="blur" className="object-cover object-[50%_0%]" />
        <div className="lp-photo-fade absolute inset-0" />
      </div>

      <div className={cn(wrap, "flex flex-col items-center pt-32 text-center text-white md:pt-40")}>
        <Link href="/ui" className="lp-tag group outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60">
          <span className="rounded-full bg-white px-1.5 py-px text-[10.5px] font-semibold text-black">New</span>
          Keyframery UI: components with the motion built in
          <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <HeroTitle className="lp-display lp-hero-title relative mt-7 text-[42px] leading-[1.06] text-balance sm:text-[60px] md:text-[76px]" />
        <p className="lp-hero-title mt-6 max-w-[56ch] text-[16px] leading-relaxed text-pretty text-white/80 sm:text-[18px]">
          Keyframery is a free motion layer for shadcn/ui. Add it once, or let your coding agent add it with our skill, and the dialogs, tabs, lists,
          numbers and loading states you already have start moving like a well-made app. Nothing to rebuild.
        </p>
        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <AgentPromptButton label="Copy prompt for your agent" className="lp-btn lp-btn-primary h-[2.875rem] w-full border-0 sm:w-auto" />
          <Link href="/docs" className="lp-btn lp-btn-glass w-full sm:w-auto">
            Read the docs <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul aria-label="Facts" className="lp-hero-title mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px] font-medium text-white/90">
          <li>Free and open source</li>
          <li>MIT licensed</li>
          <li>About 12 KB, no animation libraries</li>
        </ul>
      </div>

      <div className={cn(wrap, "lp-rise mt-24 md:mt-36")}>
        <HeroApp />
      </div>

      <div className={cn(wrap, "mt-16 flex flex-col items-center gap-5 pb-8")}>
        <p className="text-[13px] lp-muted">Works with the stack you already have</p>
        <ul aria-label="Works with" className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[15px] font-medium text-white/70">
          {WORKS_WITH.map((tool) => (
            <li key={tool.name} className="inline-flex items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
                <path d={tool.path} />
              </svg>
              {tool.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- What it is, in one look */

export function WhatItIs() {
  return (
    <section id="see" aria-labelledby="see-title" className={cn(wrap, "scroll-mt-20 py-24 md:py-32")}>
      <Heading id="see-title" eyebrow="What it is" title="shadcn/ui gives you the parts. Keyframery makes them move.">
        It isn&apos;t a new component library. You keep the components you have, and Keyframery animates them. Here is the same click on the same
        screen, twice.
      </Heading>
      <div className="mt-14">
        <SameClick />
      </div>
      <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-[var(--lp-line)] md:grid-cols-3">
        {[
          { n: "1", t: "Build with shadcn/ui as usual", b: "Same components, same imports, same code you write today." },
          {
            n: "2",
            t: (
              <>
                Add <code className={code}>{"<Cuts />"}</code> once
              </>
            ),
            b: "One line in your root layout. Or ask your coding agent and the skill does it.",
          },
          { n: "3", t: "Everything that changes, moves", b: "Dialogs, sheets, tabs, toasts, lists, numbers and loading states, all on one pace." },
        ].map((s) => (
          <li key={s.n} className="bg-[var(--lp-bg)] p-6 md:p-7">
            <span className="grid size-7 place-items-center rounded-full text-[12px] font-medium ring-1 ring-[var(--lp-line)]">{s.n}</span>
            <p className="mt-5 text-[17px] font-semibold tracking-tight">{s.t}</p>
            <p className="mt-2 text-[14.5px] leading-relaxed lp-muted">{s.b}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------------------------------------------------------------- Features: one live scene per card */

const FEATURES = [
  { Scene: DialogScene, title: "Dialogs grow from the button", body: "Press Share and the dialog comes out of Share. Close it and it goes back.", how: "Automatic" },
  { Scene: ListScene, title: "Lists make room", body: "New messages slide in at the top. Old rows fold away instead of vanishing.", how: "ListCut" },
  { Scene: NumberScene, title: "Numbers roll to the new value", body: "Totals, prices and order statuses change in place, so you see what changed.", how: "ValueCut" },
  { Scene: LoadScene, title: "Loading dissolves into content", body: "Quick answers skip the skeleton. Slow ones fade from skeleton to the real thing.", how: "LoadCut" },
  { Scene: TabsScene, title: "Tabs slide the way you go", body: "Content moves toward the tab you picked, so you keep your place.", how: "Automatic" },
  { Scene: MatchScene, title: "Cards open into their page", body: "An order card grows into its detail view, on the same page or a new route.", how: "MatchCut" },
]

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className={cn(wrap, "scroll-mt-20 pb-24 md:pb-32")}>
      <Heading id="features-title" eyebrow="What moves" title="Every change gets the right animation.">
        Half of it is automatic with <code className={code}>{"<Cuts />"}</code>. The rest is one small wrapper around markup you already have.
      </Heading>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ Scene, title, body, how }) => (
          <article key={title} className="lp-card flex min-w-0 flex-col overflow-hidden rounded-2xl">
            <div className="lp-stage border-b border-[var(--lp-line)]">
              <Scene />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[16.5px] font-semibold tracking-tight">{title}</h3>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[10.5px] ring-1", how === "Automatic" ? "text-[#a5b4ff] ring-[#8098ff]/30" : "text-white/70 ring-white/15")}>{how}</span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed lp-muted">{body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Link href="/theme" className="lp-card group flex items-center justify-between gap-6 rounded-2xl p-6 outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          <span>
            <span className="block text-[16px] font-semibold tracking-tight">Pick a feel: Quiet, Crisp or Expressive</span>
            <span className="mt-1 block text-[14px] lp-muted">Tune pace and easing for the whole app, then share it as a theme.</span>
          </span>
          <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 lp-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
        <Link href="/ui" className="lp-card group flex items-center justify-between gap-6 rounded-2xl p-6 outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          <span>
            <span className="block text-[16px] font-semibold tracking-tight">Keyframery UI</span>
            <span className="mt-1 block text-[14px] lp-muted">New components where the motion is the point: OTP, pagination, uploads, bento.</span>
          </span>
          <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 lp-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- The skill */

export function Skill() {
  return (
    <section id="skill" aria-labelledby="skill-title" className="scroll-mt-20 px-3 sm:px-4">
      <div className="lp-card relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[28px] py-20 md:rounded-[36px] md:py-28">
        <div aria-hidden="true" className="lp-orb -top-48 right-[-10rem] -z-10 size-[38rem]" />
        <div className={cn(wrap, "grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16")}>
          <div className="min-w-0">
            <p className="lp-tag">The fastest way in</p>
            <h2 id="skill-title" className="lp-display mt-5 text-[36px] leading-[1.05] text-balance md:text-[52px]">
              Install the skill. Ask for animations. Review the diff.
            </h2>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-pretty lp-muted">
              The Keyframery skill teaches Claude Code how Keyframery works. Say &ldquo;add animations to my app&rdquo; and it checks your shadcn setup,
              installs <code className={code}>{"<Cuts />"}</code>, and finds the lists, totals, loading states and cards that need a helper.
            </p>
            <ul className="mt-7 grid gap-3 text-[15px]">
              {["Picks the animation by the kind of change", "Never edits your components/ui files", "Tells you what it changed and where"].map((t) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[#8098ff]" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-9 text-[13px] font-medium">Run these two commands in Claude Code</p>
            <CopyLines lines={PLUGIN} label="the plugin install commands" className="mt-3" />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <AgentPromptButton className="lp-btn lp-btn-glass h-11 border-0" />
              <p className="text-[13px] lp-muted">Using Codex or Cursor? Copy a prompt that does the same.</p>
            </div>
          </div>
          <div className="min-w-0">
            <SkillTerminal />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- By hand */

const STEPS = [
  { n: "01", title: "Install", body: "The shadcn CLI copies <Cuts />, its stylesheet and a small engine into your project. No npm packages.", code: INSTALL },
  { n: "02", title: "Render it once", body: "Put it in your root layout, next to {children}. Next.js, Vite and React Router work the same way.", code: "<Cuts />" },
  { n: "03", title: "Open a dialog", body: "It grows from the button you pressed. Add a helper wherever a list, number or skeleton changes.", code: "<ListCut> <ValueCut> <LoadCut>" },
]

export function ByHand() {
  return (
    <section id="install" aria-labelledby="hand-title" className={cn(wrap, "scroll-mt-20 py-24 md:py-32")}>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
        <h2 id="hand-title" className="lp-display text-[36px] leading-[1.05] text-balance md:text-[52px]">
          Rather do it yourself? It&apos;s one line of code.
        </h2>
        <div className="flex items-end gap-5 md:justify-end">
          <p className="lp-display text-[72px] leading-none md:text-[96px]">12 KB</p>
          <p className="max-w-[18ch] pb-2 text-[14px] leading-snug lp-muted">gzipped, with no animation library underneath</p>
        </div>
      </div>
      <ol className="lp-card mt-14 grid overflow-hidden rounded-2xl md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.n} className={cn("flex min-w-0 flex-col p-7", i > 0 && "border-t border-[var(--lp-line)] md:border-t-0 md:border-l")}>
            <span className="font-mono text-[13px] lp-muted">{s.n}</span>
            <h3 className="mt-8 text-[20px] font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed lp-muted">{s.body}</p>
            <p className="mt-6 truncate rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-[12.5px] ring-1 ring-[var(--lp-line)]">{s.code}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-center text-[14px] lp-muted">
        Reduced motion is respected: every cut becomes a short fade.{" "}
        <Link href="/docs/installation" className="font-medium text-[var(--lp-ink)] underline underline-offset-4">
          Read the quick start
        </Link>
      </p>
    </section>
  )
}

/* ---------------------------------------------------------------- FAQ */

const QUESTIONS = [
  {
    q: "What is Keyframery, in one sentence?",
    a: "A free, open-source layer that animates the shadcn/ui components you already use: add <Cuts /> once and dialogs, sheets, tabs, toasts and menus move; five small helpers cover lists, numbers, loading, cards and whole-content states.",
  },
  {
    q: "Is it a component library?",
    a: "No. You keep your shadcn/ui components and your code. Keyframery adds motion to them. (Keyframery UI, at /ui, is a separate set of new components, if you want those too.)",
  },
  {
    q: "What does the skill do that the docs don't?",
    a: "It saves you the reading. The skill tells Claude Code which animation fits each kind of change and how to install it, so you can say \"add animations to my app\" and review a diff instead of wiring it yourself.",
  },
  {
    q: "Does it change my components?",
    a: "No. <Cuts /> finds shadcn's parts by their data-slot names and adds motion with CSS and the Web Animations API. Remove the line and you have stock shadcn again.",
  },
  { q: "Do I need Framer Motion?", a: "No. Keyframery uses CSS and the Web Animations API, about 12 KB gzipped, with no animation dependencies." },
  { q: "Base UI or Radix? Next.js or Vite?", a: "Both bases, and Next.js, Vite and React Router are all tested. It is safe with server rendering." },
  { q: "What about people who turn animations off?", a: "When the system asks for reduced motion, every cut becomes a short fade of about 120 to 160 ms. Nothing moves, scales or blurs." },
  { q: "Is it free?", a: "Yes. MIT licensed, and the CLI copies the code into your project, so it is yours to change." },
]

export function Faq() {
  return (
    <section aria-labelledby="faq-title" className={cn(wrap, "grid gap-10 pb-24 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:pb-32")}>
      <JsonLd data={faqData(QUESTIONS.map((x) => ({ q: x.q, text: x.a })))} />
      <div>
        <p className="lp-tag">Questions</p>
        <h2 id="faq-title" className="lp-display mt-5 text-[36px] leading-[1.05] md:text-[52px]">
          Before you install
        </h2>
      </div>
      <Accordion className="border-t border-[var(--lp-line)]" hiddenUntilFound>
        {QUESTIONS.map(({ q, a }) => (
          <AccordionItem key={q} value={q} className="border-[var(--lp-line)]">
            <AccordionTrigger className="py-5 text-[16px] font-medium">{q}</AccordionTrigger>
            <AccordionContent>
              <p className="max-w-[62ch] pb-3 text-[15px] leading-relaxed lp-muted">{a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

/* ---------------------------------------------------------------- Closing: the sun comes up */

export function Closing() {
  return (
    <section aria-labelledby="close-title" className="px-3 pb-6 sm:px-4">
      <div className="relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-[#050608] px-5 pt-20 pb-56 text-center ring-1 ring-[var(--lp-line)] md:rounded-[36px] md:pt-28 md:pb-72">
        <KeyframeArc />
        <h2 id="close-title" className="lp-display lp-hero-title mx-auto max-w-[16ch] text-[40px] leading-[1.03] text-balance text-white md:text-[64px]">
          Give your app the cuts an editor would choose.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[17px] leading-relaxed text-white/75">Install the skill and ask for animations, or add the one line yourself.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <AgentPromptButton label="Copy prompt for your agent" className="lp-btn lp-btn-primary h-[2.875rem] w-full border-0 sm:w-auto" />
          <Link href="/docs/installation" className="lp-btn lp-btn-glass w-full sm:w-auto">
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  )
}
