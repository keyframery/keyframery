/* What coding agents are told about Keyframery: the install commands and the prompt behind every
   "Copy for your coding agent" button. No imports, so scripts and tests can load it directly. */

export const INSTALL_ONE = "npx shadcn@latest add @keyframery/tabs"
export const INSTALL_ALL = "npx shadcn@latest add @keyframery/all"

/** The fallback when a CLI answers `Unknown registry "@keyframery"`: registers it in the project's components.json, once. */
export const REGISTER = 'npx shadcn@latest registry add "@keyframery=https://keyframery.com/r/{name}.json"'

/** The two commands that install the skill in Claude Code. */
export const PLUGIN = ["/plugin marketplace add keyframery/keyframery", "/plugin install keyframery@keyframery"]

export function agentPrompt(site = "https://keyframery.com"): string {
  return [
    "Add Keyframery to this project. Keyframery is a set of animated React components built on UI SDK (@ui-sdk/react). The motion is plain CSS, there is no animation library, and the shadcn CLI copies the source into the project.",
    "",
    "1. Check the project: it needs React 19, Tailwind CSS v4 and a components.json (run `npx shadcn@latest init` if it is missing).",
    "",
    "2. Install the components this app needs, by name:",
    "   npx shadcn@latest add @keyframery/tabs @keyframery/dialog @keyframery/menu",
    `   Everything at once: ${INSTALL_ALL}`,
    `   If the CLI answers Unknown registry "@keyframery", run this once, then install again: ${REGISTER}`,
    `   The list of all 62 components: ${site}/docs/components.mdx`,
    "",
    "3. Use them. Each component lands in two files:",
    '   - "@/components/keyframery/<name>": the finished component, styled with the shadcn/ui colour tokens.',
    '   - "@/components/keyframery/primitives/<name>": the same parts and props as "@ui-sdk/react/<name>", with motion added and no styling.',
    "   If the project already imports a component from @ui-sdk/react, swap that import for the primitive and leave the markup and class names alone.",
    "   Do not overwrite files in components/ui.",
    "",
    '4. Pick a motion style for the whole app by setting data-motion on <html>: "calm", "snappy" or "playful". Leave it off for the default, springy.',
    "   To let people choose, install @keyframery/motion-style and render <MotionStyleSwitcher />.",
    "",
    "Rules:",
    "- Do not add Motion, Framer Motion or any other animation library, and do not write new keyframes for something a Keyframery component already animates.",
    "- Do not hand-edit durations. Every duration is calc(Nms * var(--kf-speed, 1)); change --kf-speed or the motion style instead.",
    "- Keep the motion-reduce classes. With reduced motion on, nothing should move.",
    "- In Next.js with cacheComponents, render Calendar, DatePicker and DateInput inside <Suspense> after `await connection()`.",
    "",
    "Check your work: the app builds, and a tab, a menu and a dialog animate when used.",
    "",
    `Docs index: ${site}/llms.txt`,
    `All docs as plain text: ${site}/llms-full.txt`,
    `Any docs page as Markdown: add .mdx to its URL, for example ${site}/docs/components/tabs.mdx`,
  ].join("\n")
}
