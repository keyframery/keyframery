/**
 * The illustrations drawn with the stageshow kit: one per blog post, plus the author page's.
 * Each is a short faux-product-UI loop that shows the post's main finding.
 *
 * `label` is what a screen reader hears in place of the animation, so it describes what happens in it.
 * `wide` and `compact` are the scene's two design sizes (the stage switches to the compact one in a box under 600px);
 * the page uses them to keep the scene's shape free before its code has loaded.
 *
 * Kept apart from `cover.tsx` so server components can ask which covers exist without loading any scene code.
 */
export const COVERS = {
  "ui-sdk-with-shadcn": {
    label:
      "Animation: in an editor, the class data-selected:bg-primary is changed to data-[selected]:bg-primary, and the Account tab in the app fills with colour.",
    wide: [720, 380],
    compact: [358, 360],
  },
  "what-is-vercel-ui-sdk": {
    label:
      "Animation: a cursor presses an Options button and a menu grows out of the button. Duplicate is chosen, the menu shrinks back into the button, and a copy of the row appears.",
    wide: [720, 380],
    compact: [358, 360],
  },
  "shadcn-skill-vs-mcp": {
    label:
      "Animation: a panel titled Idle cost in Claude Code 2.1.322 fills in. The shadcn skill adds 166 tokens and the shadcn MCP server adds 132. Then npx skills add shadcn/ui runs in a terminal and the skill is marked Installed.",
    wide: [720, 380],
    compact: [358, 360],
  },
  "best-claude-code-skills-ui-animation": {
    label:
      "Animation: a results table fills in for five setups and the lines of app code each wrote over three runs: no skill 373, Anthropic frontend-design 387, Emil Kowalski's skills 259, impeccable 469, Keyframery 52 plus a copied library. All 15 runs built.",
    wide: [720, 380],
    compact: [358, 360],
  },
  author: {
    label:
      "Animation: the command npx shadcn@latest add @keyframery/tabs runs in a terminal and creates 3 files. Then, in an app, the selected tab slides from Overview to Activity.",
    wide: [720, 340],
    compact: [358, 336],
  },
} as const satisfies Record<string, { label: string; wide: readonly [number, number]; compact: readonly [number, number] }>

export type CoverName = keyof typeof COVERS

export const hasCover = (name: string): name is CoverName => name in COVERS
