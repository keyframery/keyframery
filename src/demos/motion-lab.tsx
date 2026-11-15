import * as React from "react"

/* A lab, not a component: proves the CSS recipes the motion pass relies on. */
export const meta = { name: "Motion lab", group: "Study" }

const rows = ["Play next", "Add to queue", "Add to playlist", "Share song", "Remove"]

function Roll({ value }: { value: number }) {
  const chars = String(value).padStart(3, " ").split("")
  return (
    <span data-test="roll" className="inline-flex h-[1em] overflow-hidden text-[28px] leading-none font-semibold tabular-nums">
      {chars.map((c, i) =>
        c === " " ? (
          <span key={i} className="w-[0.6em]" />
        ) : (
          <span
            key={i}
            style={{ "--d": Number(c) } as React.CSSProperties}
            className="flex flex-col transition-[translate] duration-500 ease-spring [translate:0_calc(var(--d)*-1em)]"
          >
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="h-[1em]">
                {d}
              </span>
            ))}
          </span>
        ),
      )}
    </span>
  )
}

export default function MotionLab() {
  const [open, setOpen] = React.useState(false)
  const [n, setN] = React.useState(128)
  const [on, setOn] = React.useState(false)
  return (
    <div className="flex items-start gap-12 text-[13px]">
      {/* 1. One highlight that glides between rows, positioned by CSS anchors. */}
      <div
        data-test="glide"
        className="relative isolate w-48 rounded-[14px] bg-popover p-1.5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_12px_32px_-8px_rgb(0_0_0/0.18)] [anchor-scope:--hl] before:pointer-events-none before:absolute before:-z-10 before:rounded-[8px] before:bg-accent before:opacity-0 before:[position-anchor:--hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)] before:transition-[top,bottom,opacity] before:duration-300 before:ease-spring has-[[data-row]:hover]:before:opacity-100"
      >
        {rows.map((r) => (
          <div key={r} data-row className="flex h-8 cursor-default items-center rounded-[8px] px-2.5 font-medium hover:[anchor-name:--hl]">
            {r}
          </div>
        ))}
      </div>

      {/* 2. Rows that cascade in, each one a little later than the one before. */}
      <div className="w-40">
        <button type="button" data-test="toggle" onClick={() => setOpen((o) => !o)} className="h-8 rounded-[9px] bg-primary px-3 font-medium text-primary-foreground">
          Cascade
        </button>
        <div data-test="cascade" data-open={open || undefined} className="group mt-3 space-y-1">
          {rows.slice(0, 4).map((r) => (
            <div
              key={r}
              className="translate-y-2 opacity-0 blur-[4px] transition-[opacity,translate,filter] duration-[420ms] ease-spring [transition-delay:calc((sibling-index()-1)*45ms)] group-data-open:translate-y-0 group-data-open:opacity-100 group-data-open:blur-none"
            >
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Numbers that roll. */}
      <div className="flex flex-col items-start gap-3">
        <Roll value={n} />
        <button type="button" data-test="bump" onClick={() => setN((v) => v + 37)} className="h-8 rounded-[9px] bg-primary px-3 font-medium text-primary-foreground">
          Add 37
        </button>
      </div>

      {/* 4. A thumb that stretches toward where it is going. */}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        data-test="switch"
        data-checked={on || undefined}
        onClick={() => setOn((v) => !v)}
        className="group relative h-7 w-12 rounded-full bg-muted transition-colors duration-300 data-checked:bg-primary"
      >
        <span className="absolute top-1 bottom-1 left-1 right-[24px] rounded-full bg-background shadow-[0_1px_2px_rgb(0_0_0/0.3)] [transition:left_460ms_var(--ease-spring),right_220ms_var(--ease-spring)] group-data-checked:right-1 group-data-checked:left-[24px] group-not-data-checked:[transition:left_220ms_var(--ease-spring),right_460ms_var(--ease-spring)]" />
      </button>
    </div>
  )
}
