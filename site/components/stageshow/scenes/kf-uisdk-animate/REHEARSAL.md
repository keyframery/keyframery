# Rehearsal: kf-uisdk-animate
Gold: hero-demo (pressed trigger, a surface opening from it, satellite card), choreography (a dependent change after its cause), kit Popover + Menu for the menu, Collapse for the new row.
Beats: 1 click Options; the menu grows from the button's corner (Popover origin top right) while `.menu[data-starting-style]` lights in menu.css … 2 the highlight follows the pointer to Duplicate … 3 click; the menu shrinks back into the button while `.menu[data-ending-style]` lights … 4 "Launch plan copy" opens under the original with one wash and carries the rows below; holds about 2.5s … reset: Cmd+Z folds the copy away. Loop about 10.5s.
Captured: widths 760 and 390; light and dark (`kf-uisdk-animate-dark`); reduced-motion poster (menu open, Duplicate highlighted, starting-style rule lit) at both widths and themes.
Gate: `rehearsal passed` at 760 and 390, light and dark.
Film: `layout: kfb-page/kfb-row leaves -Npx` = the list running off the window's bled bottom (intended). `hard edge` at 390 = filler rows moving past the window's bottom edge, which sits under the card. `steps in its box: ss-menu__item Duplicate` (dark 760 once) = kit Menu/Popover internals; not changed.
Review: no separate fresh-eye reviewer was run (no sub-agents allowed).
Assumptions: the kit Popover scales from 0.96, not the 0.95 the CSS card shows; visually the same. The card shows the selector form `.menu[data-starting-style], .menu[data-ending-style]` (the post uses `&:is(...)` nesting); same rule.
Unresolved: none known.
Not checked: Safari/Firefox, live rAF pacing, offscreen pause/resume in the real page, the host's own typecheck.

Polish round: compact is 358x360; compact window has no URL (keycaps on clear chrome), top 18, runs off the bottom behind the card (no edge strip); card drops its menu.css bar in compact so it clears the open menu. Gate at 390 light and dark: rehearsal passed.
