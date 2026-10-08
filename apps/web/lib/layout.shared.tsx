import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

import { GitHubIcon } from "@/components/site/github-icon"
import { LogoMark } from "@/components/site/logo"

import { PRO_ENABLED } from "./pro"
import { gitConfig } from "./shared"

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
      { text: "Docs", url: "/docs" },
      { text: "Cuts", url: "/cuts" },
      { text: "Theme", url: "/theme" },
      ...(PRO_ENABLED ? [{ text: "Pro", url: "/pro" }] : []),
      // Fumadocs' own githubUrl icon is an <svg role="img"> with no title, which fails axe; this one is decorative.
      {
        type: "icon",
        url: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
        text: "GitHub",
        label: "GitHub",
        external: true,
        icon: <GitHubIcon />,
      },
    ],
  }
}
