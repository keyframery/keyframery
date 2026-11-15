import { ArrowRight, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { AgentPromptButton } from "@site/components/agent-prompt-button"
import { INSTALL_ONE, PLUGIN } from "@site/lib/agent"
import { entries, groups } from "@site/lib/catalog"
import { WORKS_WITH } from "@site/lib/logos"
import { faqData, JsonLd } from "@site/lib/seo"

import horizon from "../../assets/horizon.jpg"
import { HeroTitle } from "./hero-title"
import { KeyframeArc } from "./keyframe-arc"
import { ComponentExplorer, HeroBoard, SameClick, Scene, StylePicker } from "./scenes"
import { CopyLines, SkillTerminal } from "./skill-terminal"

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
        <Image src={horizon} alt="" fill priority sizes="(max-width: 640px) 300vw, 100vw" placeholder="blur" className="object-cover object-[50%_0%]" />
        <div className="lp-photo-fade absolute inset-0" />
      </div>

      <div className={cn(wrap, "flex flex-col items-center pt-32 text-center text-white md:pt-40")}>
        <Link prefetch={false} href="/docs/components" className="lp-tag group outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60">
          <span className="rounded-full bg-white px-1.5 py-px text-[10.5px] font-semibold text-black">New</span>
          Keyframery for UI SDK: {entries.length} animated components
          <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <HeroTitle className="lp-display lp-hero-title relative mt-7 text-[42px] leading-[1.06] text-balance sm:text-[60px] md:text-[76px]" />
        <p className="lp-hero-title mt-6 max-w-[58ch] text-[16px] leading-relaxed text-pretty text-white/80 sm:text-[18px]">
          Keyframery is a free set of {entries.length} components for UI SDK with the motion already done, in plain CSS. Same parts, same props:
          change one import, or let your coding agent do it with our skill.
        </p>
        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <AgentPromptButton label="Copy prompt for your agent" className="lp-btn lp-btn-primary h-[2.875rem] w-full border-0 sm:w-auto" />
          <Link prefetch={false} href="/docs/components" className="lp-btn lp-btn-glass w-full sm:w-auto">
            Browse components <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul aria-label="Facts" className="lp-hero-title mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px] font-medium text-white [text-shadow:0_1px_10px_rgb(0_0_0/0.55)]">
          <li>Free and open source</li>
          <li>MIT licensed</li>
          <li>No animation library</li>
        </ul>
      </div>

      <div className={cn(wrap, "lp-rise mt-20 md:mt-28")}>
        <HeroBoard />
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
      <Heading id="see-title" eyebrow="What it is" title="UI SDK gives you the behaviour. Keyframery makes it move.">
        It isn&apos;t a different component library. Underneath, every component is UI SDK&apos;s own. Here is the same click on the same tabs,
        twice.
      </Heading>
      <div className="mt-14">
        <SameClick />
      </div>
      <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-[var(--lp-line)] md:grid-cols-3">
        {[
          { n: "1", t: "Build with UI SDK as usual", b: "The same parts, the same props and the same accessibility you get today." },
          { n: "2", t: "Swap the import", b: "One line per component. Or ask your coding agent, and the skill does it." },
          { n: "3", t: "Everything that changes, moves", b: "Tabs, menus, dialogs, checks and numbers, all in one motion language." },
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

/* ---------------------------------------------------------------- The nine moves: one live scene per card */

const MOVES = [
  { slug: "segmented-control", move: "Stretch", title: "Markers stretch to where they're going", body: "The leading edge leaves first and the trailing edge follows, on tabs, switches and segmented controls." },
  { slug: "radio", move: "Glide", title: "One highlight glides between options", body: "A single ring or highlight travels, in menus, lists, radios and calendars, so your eye can follow it." },
  { slug: "tooltip", move: "Unfold", title: "Popups unfold from their button", body: "Tooltips, menus, popovers and dialogs grow out of what opened them, from a blur into focus." },
  { slug: "timeline", move: "Cascade", title: "Rows arrive one after another", body: "Menu items, dialog sections and timeline events land a few milliseconds apart." },
  { slug: "number-input", move: "Roll", title: "Numbers roll to the new value", body: "Counts, totals, percentages and prices change in place, so you see what changed." },
  { slug: "checkbox", move: "Draw", title: "Checks draw themselves", body: "Ticks, dashes and lines are drawn stroke by stroke, just after the box pops." },
  { slug: "button", move: "Press", title: "Everything you press springs back", body: "Buttons, toggles and keys sink a little and release with a small pop." },
  { slug: "carousel", move: "Direction", title: "Content comes from where you went", body: "Panels, months and slides enter from the side you moved toward." },
  { slug: "accordion", move: "Height", title: "Panels open to their real height", body: "Accordions, trees and error messages take exactly the room they need." },
]

export function Moves() {
  return (
    <section id="moves" aria-labelledby="moves-title" className={cn(wrap, "scroll-mt-20 pb-24 md:pb-32")}>
      <Heading id="moves-title" eyebrow="The motion" title="Nine moves. One language.">
        Each component uses the few moves that fit it, which is why {entries.length} components feel like one product. Every card below is the real
        component, playing by itself.
      </Heading>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOVES.map(({ slug, move, title, body }) => (
          <article key={move} className="lp-card flex min-w-0 flex-col overflow-hidden rounded-2xl">
            <div className="lp-stage border-b border-[var(--lp-line)]">
              <Scene slug={slug} className="h-[300px]" pad={20} />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[16.5px] font-semibold tracking-tight">{title}</h3>
                <span className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10.5px] text-[#a5b4ff] ring-1 ring-[#8098ff]/30">{move}</span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed lp-muted">{body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {[
          { href: "/docs/moves", title: "The nine moves, explained", body: "What each move is for, and which components use it." },
          { href: "/docs/components", title: `All ${entries.length} components`, body: "From Accordion to Waterfall, each with a live demo and its source." },
        ].map((card) => (
          <Link key={card.href} prefetch={false} href={card.href} className="lp-card group flex items-center justify-between gap-6 rounded-2xl p-6 outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <span>
              <span className="block text-[16px] font-semibold tracking-tight">{card.title}</span>
              <span className="mt-1 block text-[14px] lp-muted">{card.body}</span>
            </span>
            <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 lp-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Motion styles */

export function Styles() {
  return (
    <section id="styles" aria-labelledby="styles-title" className="scroll-mt-20 px-3 sm:px-4">
      <div className="lp-card relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[28px] py-20 md:rounded-[36px] md:py-28">
        <div aria-hidden="true" className="lp-orb -bottom-56 left-[-12rem] -z-10 size-[38rem] [--lp-orb-a:#2f6bff] [--lp-orb-b:#6d5cf6] [--lp-orb-c:#19b8a6]" />
        <div className={cn(wrap, "grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16")}>
          <div className="min-w-0">
            <p className="lp-tag">Motion styles</p>
            <h2 id="styles-title" className="lp-display mt-5 text-[36px] leading-[1.05] text-balance md:text-[52px]">
              Four ways to move. One setting.
            </h2>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-pretty lp-muted">
              Pick how your whole app feels. Every component, popups included, follows one attribute on <code className={code}>{"<html>"}</code>.
              Choose one now: this whole page changes with you.
            </p>
            <div className="mt-8">
              <StylePicker />
            </div>
            <CopyLines lines={['<html data-motion="calm">']} label="the motion style attribute" prompt="" className="mt-5" />
          </div>
          <div className="grid min-w-0 gap-4">
            <div className="overflow-hidden rounded-2xl bg-[#0a0b0f] ring-1 ring-white/[0.08]">
              <Scene slug="slider" className="h-[290px]" pad={20} />
            </div>
            <div className="overflow-hidden rounded-2xl bg-[#0a0b0f] ring-1 ring-white/[0.08]">
              <Scene slug="switch" className="h-[290px]" pad={20} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- The skill */

export function Skill() {
  return (
    <section id="skill" aria-labelledby="skill-title" className="scroll-mt-20 px-3 pt-6 sm:px-4">
      <div className="lp-card relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[28px] py-20 md:rounded-[36px] md:py-28">
        <div aria-hidden="true" className="lp-orb -top-48 right-[-10rem] -z-10 size-[38rem]" />
        <div className={cn(wrap, "grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16")}>
          <div className="min-w-0">
            <p className="lp-tag">The fastest way in</p>
            <h2 id="skill-title" className="lp-display mt-5 text-[36px] leading-[1.05] text-balance md:text-[52px]">
              Install the skill. Ask for motion. Review the diff.
            </h2>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-pretty lp-muted">
              The Keyframery skill teaches Claude Code how Keyframery works. Say &ldquo;animate my UI SDK components&rdquo; and it checks your
              project, installs what you use, and swaps the imports.
            </p>
            <ul className="mt-7 grid gap-3 text-[15px]">
              {["Installs only the components you use", "Keeps your markup, props and class names", "Tells you what it changed and where"].map((t) => (
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
  { n: "01", title: "Install", body: "The shadcn CLI copies the component and its primitive into your project, and installs UI SDK.", code: INSTALL_ONE },
  { n: "02", title: "Import it", body: "Use the finished component, or the primitive if you already have your own styling.", code: '"@/components/keyframery/tabs"' },
  { n: "03", title: "Set the feel", body: "One attribute picks the motion style for the whole app. Leave it off for Springy.", code: '<html data-motion="calm">' },
]

export function ByHand() {
  return (
    <section id="install" aria-labelledby="hand-title" className={cn(wrap, "scroll-mt-20 py-24 md:py-32")}>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
        <h2 id="hand-title" className="lp-display text-[36px] leading-[1.05] text-balance md:text-[52px]">
          Rather do it yourself? It&apos;s one command.
        </h2>
        <div className="flex items-end gap-5 md:justify-end">
          <p className="lp-display text-[72px] leading-none md:text-[96px]">0 KB</p>
          <p className="max-w-[18ch] pb-2 text-[14px] leading-snug lp-muted">of animation library. The motion is plain CSS.</p>
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
        Reduced motion is respected: nothing moves when someone asks for that.{" "}
        <Link prefetch={false} href="/docs/installation" className="font-medium text-[var(--lp-ink)] underline underline-offset-4">
          Read the installation guide
        </Link>
      </p>
    </section>
  )
}

/* ---------------------------------------------------------------- Every component, live */

export function Wall() {
  const explorer = groups.map(({ group, items }) => ({
    group,
    items: items.map((e) => ({ slug: e.slug, name: e.name, description: e.description, moves: [...new Set(e.moves.map(([m]) => m))] })),
  }))
  return (
    <section id="components" aria-labelledby="wall-title" className={cn(wrap, "scroll-mt-20 pb-24 md:pb-32")}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="lp-tag">The set</p>
          <h2 id="wall-title" className="lp-display mt-5 text-[36px] leading-[1.05] md:text-[52px]">
            All {entries.length} components, live
          </h2>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed lp-muted">Pick one and it plays. Every component, from Accordion to Waterfall.</p>
        </div>
        <Link prefetch={false} href="/docs/components" className="lp-btn lp-btn-glass">
          Browse the docs <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <div className="mt-12">
        <ComponentExplorer groups={explorer} />
      </div>
      {/* Every component as a plain link too, for search engines and anyone who prefers a list. */}
      <nav aria-label="All components" className="sr-only">
        <ul>
          {entries.map((e) => (
            <li key={e.slug}>
              <Link href={`/docs/components/${e.slug}`}>{e.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}

/* ---------------------------------------------------------------- FAQ */

const QUESTIONS = [
  {
    q: "What is Keyframery, in one sentence?",
    a: `A free, open-source set of ${entries.length} React components built on UI SDK, with the motion already done in plain CSS.`,
  },
  {
    q: "Is it a replacement for UI SDK?",
    a: "No. Every Keyframery component renders the UI SDK component underneath. UI SDK does the behaviour; Keyframery adds the motion and, if you want it, a finished look.",
  },
  {
    q: "What does \"swap the import\" mean?",
    a: "Each component ships a primitive with the same parts and props as its UI SDK component. Change the import line from @ui-sdk/react/tabs to @/components/keyframery/primitives/tabs and your tabs animate. Your markup and styles stay.",
  },
  { q: "Do I need Motion or Framer Motion?", a: "No. Springs are written as CSS easings, so there is no animation library to install, and the motion works in server-rendered pages." },
  {
    q: "Does it work with shadcn/ui?",
    a: "Yes. It installs with the shadcn CLI into components/keyframery, next to your components/ui, and the finished components use the shadcn/ui colour tokens, so they take your theme.",
  },
  {
    q: "What does the skill do that the docs don't?",
    a: "It saves you the reading. The skill tells Claude Code how Keyframery is installed and used, so you can say \"animate my UI SDK components\" and review a diff instead of wiring it yourself.",
  },
  { q: "What about people who turn animations off?", a: "When the system asks for reduced motion, nothing moves. State changes happen at once or with a short fade. Loading spinners keep turning." },
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
        <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed lp-muted">This list is Keyframery&apos;s own Accordion. Open one and watch it take its real height.</p>
      </div>
      <Accordion className="border-t border-[var(--lp-line)]">
        {QUESTIONS.map(({ q, a }) => (
          <AccordionItem key={q} value={q} className="border-[var(--lp-line)]">
            <AccordionHeader>
              <AccordionTrigger className="py-5 text-[16px] font-medium">{q}</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>
              <p className="max-w-[62ch] pb-5 text-[15px] leading-relaxed lp-muted">{a}</p>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

/* ---------------------------------------------------------------- Closing: the playhead crosses the keyframes */

export function Closing() {
  return (
    <section aria-labelledby="close-title" className="px-3 pb-6 sm:px-4">
      <div className="relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-[#050608] px-5 pt-20 pb-56 text-center ring-1 ring-[var(--lp-line)] md:rounded-[36px] md:pt-28 md:pb-72">
        <KeyframeArc />
        <h2 id="close-title" className="lp-display lp-hero-title mx-auto max-w-[17ch] text-[40px] leading-[1.03] text-balance text-white md:text-[64px]">
          Give your UI SDK app the motion it&apos;s missing.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[17px] leading-relaxed text-white/75">Install the skill and ask for it, or add your first component yourself.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <AgentPromptButton label="Copy prompt for your agent" className="lp-btn lp-btn-primary h-[2.875rem] w-full border-0 sm:w-auto" />
          <Link prefetch={false} href="/docs/installation" className="lp-btn lp-btn-glass w-full sm:w-auto">
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  )
}
