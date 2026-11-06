import type { Metadata } from "next"
import Link from "next/link"

import { PublicEmail } from "@/components/site/public-email"
import { AUTHORS, authorPath } from "@/lib/blog"
import { aboutPageData, JsonLd, pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "About Keyframery, the motion layer for shadcn/ui",
  description: "Who builds Keyframery, why it exists, how every release is tested, and how the blog handles testing, disclosure and AI assistance.",
  path: "/about",
})

const maker = AUTHORS["Briyan Hingrajiya"]

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pt-16 pb-24 md:pt-24">
      <JsonLd data={aboutPageData()} />
      <h1 className="text-[36px] leading-[1.1] font-semibold tracking-[-0.025em] md:text-[44px]">About Keyframery</h1>
      <p className="mt-4 text-[18px] leading-relaxed text-muted-foreground">
        Keyframery is an open-source motion layer for shadcn/ui. One line in your root layout animates the dialogs, sheets, tabs, toasts and menus
        your app already has, without editing them.
      </p>

      <div className="mt-12 grid gap-10 text-[16px] leading-relaxed text-muted-foreground [&_h2]:text-[21px] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground">
        <section className="grid gap-3">
          <h2>Why it exists</h2>
          <p>
            shadcn/ui gives every app the same small fade and zoom. Making an app feel considered meant hand-writing motion for each component, page by
            page, and keeping the timings consistent by memory. Keyframery puts that motion in one layer you install once, with one set of timings, so
            the components and your code stay as they are.
          </p>
        </section>

        <section className="grid gap-3">
          <h2>Who builds it</h2>
          <p>
            Keyframery is built by{" "}
            <Link href={authorPath(maker)} className="text-foreground underline underline-offset-4">
              {maker.name}
            </Link>
            , a software engineer in {maker.homeLocation}. The first release shipped in October 2026, and the project is developed in the open on{" "}
            <a href="https://github.com/keyframery/keyframery" className="text-foreground underline underline-offset-4">
              GitHub
            </a>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2>How it&apos;s tested</h2>
          <p>
            Every release runs its end-to-end tests in Chromium, Firefox and WebKit, on both Base UI and Radix versions of shadcn/ui, and checks that
            the shadcn CLI installs it cleanly into fresh projects. The versions it&apos;s tested with are listed on the{" "}
            <Link href="/docs/compatibility" className="text-foreground underline underline-offset-4">
              compatibility page
            </Link>
            , and every change is in the{" "}
            <Link href="/docs/changelog" className="text-foreground underline underline-offset-4">
              changelog
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-3">
          <h2>Open source and free</h2>
          <p>
            The code is MIT licensed. The shadcn CLI copies it into your project, so you own it the way you own your shadcn/ui components, and it adds
            no npm dependencies. The docs, the theme builder and the agent skill are free and need no account.
          </p>
        </section>

        <section className="grid gap-3" aria-labelledby="editorial">
          <h2 id="editorial">How the blog is written</h2>
          <ul className="grid list-disc gap-2 pl-5">
            <li>Posts report tests we ran ourselves, with the setup, the prompts and the limits stated in the post.</li>
            <li>When a post compares Keyframery with other tools, it says so at the top, and reports where Keyframery comes out worse.</li>
            <li>Drafts are written with AI assistance and checked against the test data before they&apos;re published.</li>
            <li>When a post is corrected or its results change, it gets an &ldquo;Updated&rdquo; date and the change is described in the post.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2>Contact</h2>
          <p>
            Questions, corrections or bug reports: write to <PublicEmail address="briyan@keyframery.com" link className="text-foreground underline underline-offset-4" />, or
            open an issue on{" "}
            <a href="https://github.com/keyframery/keyframery/issues" className="text-foreground underline underline-offset-4">
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
