# Agent preview verification

The reference is Keyframery's existing documentation playground and its own UI SDK controls.
The live component leads the composition. An Agent view switch at the top of the main component
playground starts off. Inline examples below it retain only their Preview/Code and reset controls.
When enabled, a 300px inspector sits beside the component when the container
is at least 720px wide and stacks below it on phones. The inspector shows actual SDK output.
Disabling it unmounts its subscriptions while keeping the component and its state mounted.

Verified with headless Chrome at 1440px and 390px, in light and dark:

- The main documentation playground has its own scoped snapshot; inline examples have no agent controls.
- The main Agent view switch starts off and preserves edited values when switched off and on again.
- A Switch action changes the mounted control and its snapshot; Select choices are real SDK data.
- Snapshot/Actions tabs, argument entry, responses, and mobile stacking work without page errors.
- The lab header and inspector fit the phone viewport; dividers use the shared border token.
- Runtime regression tests cover isolation, stale refs, disposal, overflow, and a stacked inspector
  remaining live while its canvas is above the viewport.

Screenshots and visual verdicts are local artifacts under `shots/agent-preview/` and
`.omx/state/agent-preview/`. Spoken screen-reader output was not tested.

The Agent view switch has its own neutral rounded hairline frame, a faint inset edge and two
small corner accents. The supplied blue selection-rectangle reference informed the emphasis;
its blue handles and text were not copied. Checked the treatment at 1440px and 390px in light
and dark, with no page errors. The main switch remains off by default. Highlight screenshots use
the `highlight-` prefix; its visual verdict is in
`.omx/state/agent-preview-highlight/ralph-progress.json`.
