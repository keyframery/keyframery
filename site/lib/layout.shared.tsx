import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

import { CreateNavButton } from "@site/components/create-nav-button"
import { GitHubStars } from "@site/components/github-stars"
import { LogoMark } from "@site/components/logo"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <LogoMark className="size-[18px]" />
          Keyframery
        </span>
      ),
      /* On a phone the header keeps only search and the menu, so the plus sits beside them. */
      children: <CreateNavButton className="absolute top-1/2 right-[88px] -translate-y-1/2 sm:hidden" />,
    },
    links: [
      { text: "Docs", url: "/docs", active: "url" },
      { text: "Components", url: "/docs/components", active: "nested-url" },
      { text: "Templates", url: "/docs/templates", active: "nested-url" },
      { text: "Motion styles", url: "/docs/motion-styles" },
      { text: "AI tools", url: "/docs/ai-tools" },
      { text: "Blog", url: "/blog", active: "nested-url" },
      // The way into /create, a small key on the right beside GitHub and the theme toggle.
      { type: "custom", secondary: true, children: <CreateNavButton /> },
      // GitHub with the star count (Fumadocs' own githubUrl icon is an <svg role="img"> with no title, which fails axe).
      { type: "custom", secondary: true, children: <GitHubStars /> },
    ],
  }
}
