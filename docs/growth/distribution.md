# Three example distribution packages

Prepared 19 October 2026. Status: drafts for review; no publishing, outreach, recordings or rendered videos performed. Each package points to the existing indexable docs and their complete examples. Use the docs as the source of truth when recording or adapting a tutorial so duplicated snippets cannot drift.

Shared description: **Keyframery is an open-source motion layer for existing shadcn/ui apps. Render one root `<Cuts />`, then add focused helpers for custom lists, values, loading, shared elements and state changes.** Install commands copy source into the project. Helpers require the root component; they are not a no-setup replacement for React or shadcn.

Start with one substantive example every two weeks. The sequence is dialog → list → loading. Publication timing starts after the corresponding docs/example is deployed and checked. Publish the detailed tutorial and smaller excerpts from the same work; retain one principal site URL for each intent. Adapt community drafts to a relevant community's current rules and disclose authorship. No duplicate posts or manufactured customer stories.

## 1. A shadcn dialog that opens from its trigger

**Destination:** https://keyframery.com/docs/components/dialog  
**Search intent:** shadcn dialog animation; animate dialog open and close  
**Tutorial title:** Animate a shadcn dialog from the button that opened it  
**Reader outcome:** install the motion layer, keep the project's Dialog component and verify trigger-origin opening/closing, keyboard use and reduced motion.

### Substantive tutorial outline

1. Open with the exact task: a dialog can visually connect to the action that opened it. Show the same Release review dialog before and after adding the layer, with the same viewport and clicks. Label the UI base and versions actually recorded.
2. State prerequisites: an existing React/shadcn project, current supported Dialog markup, and the [installation guide](https://keyframery.com/docs/installation). Show `npx shadcn add @keyframery/cuts`; explain the registry fallback only if the CLI cannot resolve the namespace.
3. Show `<Cuts />` mounted once in the root and the complete working Dialog example from the destination page. Keep Base UI and Radix trigger syntax separate; preserve title/description and normal dialog semantics.
4. Open from Review release, close with Escape, and open/close again. Explain the default rack-focus cut. Show `dialog="fade"` as a deliberate alternative and `data-cut-origin="center"` when center-origin behavior is desired.
5. Open programmatically without a recent trigger to demonstrate the documented center-origin fallback. Avoid implying every dialog always has a trigger to return to.
6. Enable the operating system's reduced-motion preference and repeat. Explain that `data-cut="none"` opts out of the enhancement and can leave shadcn's own animation classes active; it is not a blanket promise of zero motion.
7. Finish with the completed source and a link to [animation troubleshooting](https://keyframery.com/docs/guides/animations-not-working). Ask for concrete reproduction details when a supported dialog does not move.

### Community draft

**Title:** A complete shadcn dialog example with trigger-origin motion

I maintain Keyframery, an open-source motion layer for existing shadcn/ui apps. I put together a complete Release review dialog example that opens from its trigger and closes back toward it with the default rack-focus cut.

The setup adds one root `<Cuts />`; the dialog stays the project's shadcn component. The guide covers Base UI and Radix trigger syntax, a centered fallback for programmatic opens, per-dialog overrides and reduced motion. It also links the checks for older markup that is missing `data-slot` attributes.

Try the example and copy the source: https://keyframery.com/docs/components/dialog

If you try it, useful feedback is the UI base, browser, component markup and the action that opened the dialog. That makes a motion bug reproducible.

### Short social draft

Make a shadcn dialog open from its trigger with Keyframery. One root `<Cuts />`; keep your Dialog component. Complete Base UI/Radix examples, fallback behavior and reduced-motion notes: https://keyframery.com/docs/components/dialog

### Captioned-demo shot list — proposed 24 seconds

| Time | Capture | On-screen caption |
|---|---|---|
| 0–4 s | Same Release review flow, stock and enhanced side by side; real-time playback | Same dialog. Same click. |
| 4–8 s | Show the install command and single root `<Cuts />` line | Add the motion layer once. |
| 8–14 s | Click Review release; pause briefly on open dialog; close back toward the button | Opens from the trigger. Closes toward it. |
| 14–19 s | Keyboard open/close, then the reduced-motion version clearly labeled | Keep keyboard behavior. Respect reduced motion. |
| 19–24 s | Complete example URL and a still of its source | Full example: keyframery.com/docs/components/dialog |

**Caption/alt description:** A Release review dialog is opened and closed in matching stock and Keyframery examples. The enhanced version grows toward the dialog from the pressed button. The sequence shows the setup line, keyboard interaction and a separately labeled reduced-motion run.

**Recording check:** use real supported components; do not hide setup or use altered playback speed to imply faster app performance. If a slow-motion replay is useful, label it explicitly. Verify focus return and the reduced-motion run before publishing.

## 2. A React list with add, remove and reorder motion

**Destination:** https://keyframery.com/docs/helpers/list-cut  
**Search intent:** React list animations; animate list add remove reorder  
**Tutorial title:** Animate React list additions, removals and reorders with stable IDs  
**Reader outcome:** build the documented task/member list and explain why each item's React key and ListCut ID must stay stable.

### Substantive tutorial outline

1. Start with three real state updates in one list: add a task, remove the middle task, reverse/reorder the remaining tasks. Keep the same data operations for the before/after comparison.
2. Establish the [root setup](https://keyframery.com/docs/installation), then install `npx shadcn add @keyframery/list-cut`. Link the complete source at the destination rather than publishing an incomplete mapping fragment as a complete app.
3. Explain `<ListCut as="ul">` and `<ListCut.Item as="li">`. Point out the persistent data ID used for both `key` and `id`. Use immutable state updates; do not generate IDs during render or use array indexes for changing lists.
4. Walk through the full example's add, remove and reorder handlers. Show the normal button-triggered arrival and explain that server-originated updates without a button use a different arrival.
5. State limits: initial render does not animate; ListCut animates reordered data but does not provide drag-and-drop controls. Preserve semantic list/table elements and accessible names for controls.
6. Repeat with reduced motion and the documented `cut="none"` option. Keep full functionality available when animation is disabled.
7. End with the existing [ListCut docs](https://keyframery.com/docs/helpers/list-cut) and [ValueCut](https://keyframery.com/docs/helpers/value-cut) for a separately changing count. Keep the count helper optional.

### Community draft

**Title:** A React list example covering add, remove and reorder with stable IDs

I maintain Keyframery. This example uses its ListCut helper for the three list changes that often get demonstrated separately: adding a row, removing one and moving existing rows into a new order.

Each row keeps the same data ID for its React `key` and `ListCut.Item` `id`. That lets the helper distinguish an arrival from a move. The guide includes the complete state updates, semantic list markup, root setup and reduced-motion notes. ListCut animates a reorder you perform in state; it does not add drag-and-drop controls.

Working example and source: https://keyframery.com/docs/helpers/list-cut

I would be interested in reproducible cases involving rapid updates or reordered server data; include the ID strategy and update sequence.

### Short social draft

Add, remove, reorder: one React list example with Keyframery's ListCut. Stable IDs keep moves distinct from new rows. Includes complete state updates and reduced-motion notes: https://keyframery.com/docs/helpers/list-cut

### Captioned-demo shot list — proposed 26 seconds

| Time | Capture | On-screen caption |
|---|---|---|
| 0–4 s | Three labeled rows; add a fourth with the real button | New row: an arrival. |
| 4–9 s | Remove a middle row; let the remaining rows settle | Removed row leaves. Others follow. |
| 9–14 s | Reorder existing rows using the example's control | Same IDs. New positions. |
| 14–19 s | Show the `key={item.id}` and `id={item.id}` lines | Keep IDs stable across renders. |
| 19–22 s | Repeat one update with reduced motion, clearly labeled | List actions still work with reduced motion. |
| 22–26 s | Destination URL with final list | Full example: keyframery.com/docs/helpers/list-cut |

**Caption/alt description:** A four-row list gains a row, loses a middle row and changes order. A source excerpt highlights the matching stable key and item ID. A separate reduced-motion run shows the same data update without the full movement.

**Recording check:** retain actual add/remove/reorder handlers and stable IDs. Do not introduce a drag cursor when the example uses buttons. Keep labels readable so viewers can track the same rows.

## 3. A skeleton that becomes content

**Destination:** https://keyframery.com/docs/helpers/load-cut  
**Search intent:** skeleton to content transition React; prevent skeleton flashing  
**Tutorial title:** Handle fast and slow loading states without a flashing React skeleton  
**Reader outcome:** use one controlled example to compare fast completion, a visible skeleton and the transition into real content.

### Substantive tutorial outline

1. Lead with two different jobs: delaying a skeleton for fast data and avoiding an abrupt swap after slow data. Clearly label any simulated request timing; the helper does not make the network request faster.
2. Link the [root installation](https://keyframery.com/docs/installation), install `npx shadcn add @keyframery/load-cut`, and show the complete loading example from the destination. Explain the `loading`, `skeleton` and content inputs.
3. Run the fast path below the configured hold: no visible skeleton should appear, and the invoice revision changes. Explain that this refresh example retains the prior content during the hold; on an initial load, reserved space can be empty.
4. Run the slow path: show the skeleton, then resolve the request and watch content replace it. Explain `hold` and `minShow`; they manage presentation timing rather than server work.
5. Give the skeleton and content realistic dimensions. Explain that layout stability still depends on the surrounding layout and assets; an animation is not proof that field CLS is zero.
6. Show the loading busy state, reduced motion and `cut="none"`. Treat empty/error/success state transitions as a separate use case for [StateCut](https://keyframery.com/docs/helpers/state-cut).
7. Finish with the full source and a small verification checklist: fast response, slow response, another refresh after completion, keyboard interaction and reduced motion. The example disables refresh controls while loading and clears its timer on unmount. Link measured performance evidence only if it exists.

### Community draft

**Title:** A React loading example for both fast and slow responses

I maintain Keyframery. I made a complete LoadCut example that shows why skeleton timing and the skeleton-to-content transition are separate concerns.

The helper delays showing the skeleton for a fast response. Once a skeleton appears, a minimum display time avoids a brief flash, then content replaces it with a dissolve. The example includes the root setup, controls for both timing paths and reduced-motion notes.

This manages presentation timing; it does not speed up the request. Matching the placeholder and content dimensions still matters for the surrounding layout.

Example and source: https://keyframery.com/docs/helpers/load-cut

### Short social draft

Fast load: skip the skeleton. Slow load: show it, then dissolve into content. A complete React example with Keyframery's LoadCut, timing controls and reduced-motion notes: https://keyframery.com/docs/helpers/load-cut

### Captioned-demo shot list — proposed 28 seconds

| Time | Capture | On-screen caption |
|---|---|---|
| 0–5 s | Click Load fast (150 ms); label timing as simulated; previous invoices stay visible | Fast response: no skeleton flash. |
| 5–12 s | After completion, click Load slowly (1,200 ms) and let the skeleton display | Slow response: show the placeholder. |
| 12–17 s | Resolve and show content replacing the skeleton | Then dissolve into content. |
| 17–22 s | Show the loading flag and the `hold`/`minShow` options table beside the example | Presentation timing. Simulated response. |
| 22–25 s | Separately labeled reduced-motion run | Reduced motion stays usable. |
| 25–28 s | Destination URL and settled content | Full example: keyframery.com/docs/helpers/load-cut |

**Caption/alt description:** A controlled invoice list refreshes twice with simulated delays. The fast refresh updates its revision without a skeleton. The slower run shows a skeleton before updated invoices replace it. Source highlights the loading flag and timing options; a separate reduced-motion run follows.

**Recording check:** disclose simulated timing, use actual completion state, confirm refresh controls stay disabled during loading, and reserve appropriate layout space. Do not claim a universal zero-layout-shift result or faster data fetching.

## Publication record

For each released asset, record the example ID, actual URL, date/time, channel, destination URL, deployed commit, review notes and observed referrals in private reporting. Only append placements to the scorecard after publication. If campaign parameters are useful, use consistent lowercase values such as `utm_source=devto&utm_medium=community&utm_campaign=dialog_example`; confirm the existing analytics can report them before claiming attribution.

Every recording needs accurate captions and readable source at the final viewing size. The shot lists above are production briefs; no caption file or video is claimed as delivered.
