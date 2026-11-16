import { Badge, Bar, Caret, Count, Meter, Prompt, Roll, Stage, Window, type Act } from '../../kit'
import './skill-vs-mcp.css'

// shadcn skill vs MCP server, the cover of the post. A system story, no
// cursor. A coding agent's idle-context panel measures what each one adds:
// the skill's row resolves to 166 tokens, the MCP server's to 132 a beat
// later. The skill row is marked "Install first" (the post's advice), the
// install command is typed in the terminal in front, it runs, and the badge
// turns to Installed on itself. The payoff holds, then the run undoes in a
// quick reverse stagger back to the measuring skeleton.
//
// Built from the gold `loading` (a skeleton at the content's own geometry,
// rows resolving in place) with the terminal satellite of `hero-demo` and the
// rolling figure of `table-edit`.
//
// Real strings (every number from content/blog/shadcn-skill-vs-mcp.mdx):
// the panel title, "shadcn skill", "shadcn MCP server", 166 and 132 tokens,
// "Install first" / "Installed", and the command `npx skills add shadcn/ui`.
// The rows above and below are filler bars.
//
// Theme: tokens only, from the page. Light by default; `.dark` on any
// ancestor switches every token in skill-vs-mcp.css. No JS theme prop.

type Ready = [boolean, boolean]
type S = {
  ready: Ready // a row's words shown over its skeleton
  val: [number, number] // the figures; snapped to 0 only while hidden
  badge: 'off' | 'first' | 'done'
  label: 'first' | 'done'
  cmd: string
  ran: boolean
  clear: boolean // the terminal's lines fading out for the reset
}

const COMMAND = 'npx skills add shadcn/ui'
const ROWS = [
  { name: 'shadcn skill', tokens: 166 },
  { name: 'shadcn MCP server', tokens: 132 },
] as const
const MAX = 166
// Filler rows: [name bar, meter fill 0..1, figure bar]
const BELOW = [
  [70, 0.34, 22],
  [104, 0.58, 26],
  [82, 0.46, 24],
  [96, 0.26, 20],
] as const

const initial: S = { ready: [false, false], val: [0, 0], badge: 'off', label: 'first', cmd: '', ran: false, clear: false }
const poster: S = { ready: [true, true], val: [166, 132], badge: 'done', label: 'done', cmd: COMMAND, ran: true, clear: false }

async function script(a: Act<S>) {
  await a.wait(220)
  a.mark('resolve')
  await a.set({ ready: [true, false], val: [166, 0] })
  await a.wait(180)
  await a.set({ ready: [true, true], val: [166, 132] })
  await a.wait(1500)
  a.mark('advice')
  await a.set({ badge: 'first' })
  await a.wait(1100)
  a.mark('type')
  await a.type('cmd', COMMAND, { interval: 42 })
  await a.wait(380)
  a.mark('run')
  await a.set({ ran: true })
  await a.wait(520)
  a.mark('payoff')
  await a.set({ badge: 'done', label: 'done' })
  await a.wait(3400)
  // Undo in place, the last change first
  a.mark('reset')
  await a.set({ badge: 'off' })
  await a.wait(70)
  await a.set({ clear: true })
  await a.wait(70)
  await a.set({ ready: [false, true] })
  await a.wait(70)
  await a.set({ ready: [false, false] })
  await a.wait(180)
  await a.snap({ val: [0, 0], cmd: '', ran: false, label: 'first' })
  await a.set({ clear: false })
}

function Filler({ row }: { row: readonly [number, number, number] }) {
  return (
    <div className="kfc-row kfc-row--fill">
      <span className="kfc-name">
        <Bar w={row[0]} h={7} r={3.5} tone={2} />
      </span>
      <Meter className="kfc-meter" value={row[1]} tone="ink" />
      <span className="kfc-fig">
        <Bar w={row[2]} h={7} r={3.5} tone={2} />
      </span>
    </div>
  )
}

export default function SkillVsMcp() {
  return (
    <Stage<S>
      width={720}
      height={380}
      compact={{ below: 600, width: 358, height: 360 }}
      initial={initial}
      poster={poster}
      script={script}
      className="kfc"
    >
      {(s) => {
        return (
          <>
            <Window className="kfc-win" body={{ className: 'kfc-body' }}>
              <div className="kfc-title">Idle cost in Claude Code 2.1.322</div>
              <div className="kfc-list">
                {ROWS.map((r, i) => (
                  <div key={r.name} className="kfc-row" data-ready={s.ready[i] || undefined} style={{ ['--kfc-i' as string]: i }}>
                    <span className="kfc-name">
                      <span className="kfc-slot">
                        <Bar w={i === 0 ? 78 : 118} h={7} r={3.5} tone={2} className="kfc-sk" />
                        <span className="kfc-real kfc-label">{r.name}</span>
                      </span>
                      {i === 0 && (
                        <span className="kfc-badge" data-show={s.badge !== 'off' || undefined}>
                          <Badge tone={s.badge === 'done' ? 'success' : 'accent'}>
                            <Roll variant="fade">{s.label === 'done' ? 'Installed' : 'Install first'}</Roll>
                          </Badge>
                        </span>
                      )}
                    </span>
                    <span className="kfc-slot kfc-meter-slot">
                      <Bar w="100%" h={6} r={3} tone={2} className="kfc-sk" />
                      <Meter className="kfc-real kfc-meter" value={s.val[i] / MAX} />
                    </span>
                    <span className="kfc-slot kfc-fig">
                      <Bar w={58} h={7} r={3.5} tone={2} className="kfc-sk" />
                      <span className="kfc-real kfc-figure">
                        <Count value={s.val[i]} duration={700} format={(n) => `${n} tokens`} />
                      </span>
                    </span>
                  </div>
                ))}
                {BELOW.map((r, i) => <Filler key={`b${i}`} row={r} />)}
              </div>
            </Window>
            <Window chrome="terminal" lights="grey" className="kfc-term">
              <div className="ss-term kfc-term-body" data-clear={s.clear || undefined}>
                <Prompt path="~/app">
                  <span data-typing>{s.cmd}</span>
                  {!s.ran && (
                    // Steps one cell per typed key, as a terminal's does
                    <span data-snap>
                      <Caret still={s.cmd.length > 0 && s.cmd.length < COMMAND.length} />
                    </span>
                  )}
                </Prompt>
                <Prompt path="~/app" className="kfc-next" data-show={s.ran || undefined}>
                  <Caret />
                </Prompt>
              </div>
            </Window>
          </>
        )
      }}
    </Stage>
  )
}
