import type * as PageTree from "fumadocs-core/page-tree"

import { Tag } from "@/components/ui-library/tag"

import { UI_GROUPS, UI_ORDER } from "./ui-library"

/** The /ui sidebar: getting started, then each group that has a component you can use today. */
export function uiTree(): PageTree.Root {
  return {
    name: "Components",
    children: [
      { type: "separator", name: "Get started" },
      { type: "page", name: "Introduction", url: "/ui" },
      ...UI_GROUPS.flatMap((group): PageTree.Node[] => {
        const items = UI_ORDER.filter((c) => c.group === group)
        if (!items.length) return []
        return [
          { type: "separator", name: group },
          ...items.map(
            (c): PageTree.Item => ({
              type: "page",
              url: `/ui/${c.slug}`,
              name: (
                <span className="flex w-full items-center justify-between gap-2">
                  {c.name}
                  <Tag status={c.status} />
                </span>
              ),
            }),
          ),
        ]
      }),
    ],
  }
}
