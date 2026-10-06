import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

import { gitConfig } from "./shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <span className="text-[15px] font-semibold tracking-tight">Keyframery</span>,
    },
    links: [
      { text: "Docs", url: "/docs" },
      { text: "Cuts", url: "/cuts" },
      { text: "Pro", url: "/pro" },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
