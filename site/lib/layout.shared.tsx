import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

import { GitHubIcon } from "@site/components/github-icon"
import { LogoMark } from "@site/components/logo"

import { REPO } from "./shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <LogoMark className="size-[18px]" />
          Keyframery
        </span>
      ),
    },
    links: [
      { text: "Docs", url: "/docs", active: "url" },
      { text: "Components", url: "/docs/components", active: "nested-url" },
      { text: "Templates", url: "/docs/templates", active: "nested-url" },
      { text: "Motion styles", url: "/docs/motion-styles" },
      { text: "AI tools", url: "/docs/ai-tools" },
      { text: "Blog", url: "/blog", active: "nested-url" },
      // Fumadocs' own githubUrl icon is an <svg role="img"> with no title, which fails axe; this one is decorative.
      { type: "icon", url: REPO, text: "GitHub", label: "GitHub", external: true, icon: <GitHubIcon /> },
    ],
  }
}
