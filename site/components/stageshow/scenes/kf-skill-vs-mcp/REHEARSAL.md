# Rehearsal: kf-skill-vs-mcp
Gold: loading (skeleton at the content's geometry, rows resolving in place; kept its slot/skeleton mechanics and timing), plus hero-demo's terminal satellite and table-edit's rolling figure. Changed: no plate (transparent stage, page is the ground), corner bleed off right and bottom, kit terminal satellite straddling the hero's left edge, tokens mapped to the site's light/dark values, no cursor (system story).
Beats: 1 skeleton (0.8s) … 2 rows resolve, 166 then 132 tokens roll in … 3 "Install first" badge on the skill row … 4 `npx skills add shadcn/ui` typed and run in the terminal … payoff: badge turns to "Installed" (poster), holds 3.4s; reset = reverse-stagger undo to the skeleton. Loop ~10.3s.
Captured: widths 760 (wide) and 390 (compact 358x350), light (`?capture=kf-skill-vs-mcp`) and dark (`?capture=kf-skill-vs-mcp-dark`), payoff stills each. Reduced motion not filmed.
Gate: `rehearsal passed` at 760 and 390, light and dark.
Film: near-empty frames ~9.6s for 1.45s → the skeleton between the reset and the next resolve; it is the loading state the story opens on, kept short (0.8s wait + fades). settle snap on the terminal caret → it steps one cell per typed key, marked data-snap on its wrapper only. lands on a transform (badge) → will-change: transform added.
Review: no separate fresh-eye reviewer was run (sub-agents not allowed for this task).
Assumptions: Geist / Geist Mono are loaded by the host; in the playground the fallbacks render (system-ui, SF Mono/Menlo). Mono stack adds "SF Mono", Menlo, Consolas before `monospace` because Chrome does not resolve `ui-monospace`. "~/app" in the prompt and "Installed" are UI filler, not claims from the post.
Unresolved: the dark terminal (#1b1c1f) sits close in tone to the dark hero; separated by its ring and shadow only.
Not checked: reduced-motion poster on a real page, offscreen pause/resume, the real Next.js host page, Safari.

## Polish round
Compact now 358x360, below 600 (window top 18 so the visible window stays at least square; terminal top 217). Wide window moved to left 104 (width 696), list 560 wide, meter column 180; terminal unchanged at left 32, top 223. Reset shortened: opening wait 220ms, post-fade 180ms; near-empty frames now 0.50 to 0.55s. Gates re-run 760/390, light and dark: all `rehearsal passed`.
