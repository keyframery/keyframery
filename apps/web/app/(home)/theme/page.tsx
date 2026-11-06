import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { ThemeBuilder } from "@/components/theme/theme-builder"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Motion theme builder for shadcn/ui",
  description: "Build a motion theme for shadcn/ui: start from Quiet, Crisp or Expressive, tune pace, easing and cuts on a live app, then save it or copy the code.",
  path: "/theme",
  markdown: "/theme.md",
})

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16">
      <h1 className="text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">Motion theme builder</h1>
      <p className="mt-4 max-w-[60ch] text-lg text-muted-foreground">Start with a profile, try a real workflow, then make it yours. Everything on this page, including the dialogs, uses your settings. Save the theme or copy its code into your app.</p>
      {/* The search-param builder hydrates inside Suspense; reserve its space so the footer cannot jump out of view. */}
      <div className="mt-10 min-h-screen">
        <Suspense>
          <ThemeBuilder />
        </Suspense>
      </div>
      {/* The builder renders in the browser; this part is in the page's HTML, so search engines and agents can read what it does. */}
      <section aria-labelledby="about-themes" className="mt-20 grid max-w-[68ch] gap-4 text-[16px] leading-relaxed text-muted-foreground">
        <h2 id="about-themes" className="text-[22px] font-semibold tracking-tight text-foreground">
          What a motion theme controls
        </h2>
        <p>
          A motion theme is one configuration for all the animation in a shadcn/ui app. Quiet, Crisp and Expressive are starting points: pick one,
          then change only what matters to you.
        </p>
        <ul className="grid list-disc gap-2 pl-5">
          <li>
            <span className="text-foreground">Pace</span> multiplies every duration, so a larger number makes all motion slower.
          </li>
          <li>
            <span className="text-foreground">Entrance and exit easing</span> set the curves that dialogs, lists, numbers and loading states share.
          </li>
          <li>
            <span className="text-foreground">Cuts</span> choose how dialogs, sheets, drawers, tabs and toasts arrive and leave, for example a rack
            focus from the button you pressed.
          </li>
          <li>
            <span className="text-foreground">Skeleton delay</span> decides how long LoadCut waits before it shows a placeholder.
          </li>
        </ul>
        <p>
          The preview above is a working app: create a record, save it and open it, and every step uses your settings. When it feels right, copy the{" "}
          <code>&lt;Cuts /&gt;</code> props and CSS variables into your project, share the theme as a link, save it in this browser, or copy a prompt
          that lets your coding agent apply the same theme. It&apos;s free and needs no account. The{" "}
          <Link href="/docs/motion-themes" className="text-foreground underline underline-offset-4">
            motion themes guide
          </Link>{" "}
          and the{" "}
          <Link href="/docs/customize" className="text-foreground underline underline-offset-4">
            settings reference
          </Link>{" "}
          explain each setting in detail.
        </p>
      </section>
    </div>
  )
}
