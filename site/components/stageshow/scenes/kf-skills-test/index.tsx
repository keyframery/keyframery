import { Badge, Bar, Check, Meter, Stage, Window, type Act } from '../../kit'
import './skills-test.css'

// Best animation skills for Claude Code, the cover of the post. A system
// story, no cursor. A results table loads into its own skeleton: five setups,
// each resolving top to bottom with the lines of app code it wrote (a bar and
// the figure), then every setup's build check ticks down the column, then the
// summary chip "15 of 15 built" arrives in the header. The payoff holds, then
// the table fades back to its skeleton in a quick reverse stagger.
//
// Built from the gold `loading`: the skeleton is the content's own geometry,
// only the data loads (title and column heads are real from the first frame),
// rows resolve whole, top to bottom.
//
// Real strings, all from content/blog/best-claude-code-skills-ui-animation.mdx
// (its results table and method table): the title, the column heads, the five
// setup names, 373 / 387 / 259 / 469 / 52 lines, "+ copied library" on
// Keyframery, and "15 of 15 built".
//
// Theme: tokens only. Light by default; `.dark` on any ancestor switches.

type S = { ready: number; built: number; chip: boolean }

const ROWS = [
  { name: 'No skill', lines: 373 },
  { name: 'Anthropic frontend-design', lines: 387 },
  { name: "Emil Kowalski's skills", lines: 259 },
  { name: 'impeccable', lines: 469 },
  { name: 'Keyframery', lines: 52, note: '+ copied library' },
] as const
const MAX = 469
// Each skeleton bar about its words' width
const NW = [56, 168, 142, 72, 74]

const initial: S = { ready: 0, built: 0, chip: false }
const poster: S = { ready: 5, built: 5, chip: true }

async function script(a: Act<S>) {
  await a.wait(800)
  a.mark('resolve')
  for (let i = 1; i <= 5; i++) {
    await a.set({ ready: i })
    await a.wait(130)
  }
  await a.wait(1000)
  a.mark('built')
  for (let i = 1; i <= 5; i++) {
    await a.set({ built: i })
    await a.wait(110)
  }
  await a.wait(450)
  a.mark('payoff')
  await a.set({ chip: true })
  await a.wait(3800)
  // Undo in place, the last change first
  a.mark('reset')
  await a.set({ chip: false })
  await a.wait(80)
  await a.set({ built: 0 })
  await a.wait(80)
  for (let i = 4; i >= 0; i--) {
    await a.set({ ready: i })
    await a.wait(60)
  }
  await a.wait(500)
}

export default function SkillsTest() {
  return (
    <Stage<S>
      width={720}
      height={380}
      compact={{ below: 600, width: 358, height: 360 }}
      initial={initial}
      poster={poster}
      script={script}
      className="kfd"
    >
      {(s, _rect, layout) => {
        const wide = layout === 'wide'
        return (
          <Window className="kfd-win" body={{ className: 'kfd-body' }}>
            <div className="kfd-head">
              <div className="kfd-title">3 prompts × 5 setups</div>
              <span className="kfd-chip" data-show={s.chip || undefined}>
                <Badge tone="success" icon={<Check on={s.chip} size={12} className="kfd-chip-check" />}>
                  15 of 15 built
                </Badge>
              </span>
            </div>
            <div className="kfd-row kfd-row--cols">
              <span>Setup</span>
              {wide ? (
                <>
                  <span>App code written (3 runs)</span>
                  <span />
                </>
              ) : (
                <span className="kfd-end">Lines</span>
              )}
              <span className="kfd-end">Builds</span>
            </div>
            {ROWS.map((r, i) => {
              const ready = s.ready > i
              const bar = (
                <span className="kfd-slot kfd-bar-slot">
                  <Bar w={Math.round((wide ? 230 : 200) * Math.max(r.lines, 90) / MAX)} h={6} r={3} tone={2} className="kfd-sk" />
                  <span className="kfd-real kfd-bar">
                    <Meter className="kfd-meter" value={ready ? 1 : 0} style={{ width: `${(r.lines / MAX) * 100}%` }} />
                    {wide && 'note' in r && <span className="kfd-note">{r.note}</span>}
                  </span>
                </span>
              )
              return (
                <div key={r.name} className="kfd-row" data-ready={ready || undefined}>
                  <span className="kfd-slot">
                    <Bar w={NW[i]!} h={7} r={3.5} tone={2} className="kfd-sk" />
                    <span className="kfd-real kfd-name">
                      {r.name}
                      {!wide && 'note' in r && <span className="kfd-note"> {r.note}</span>}
                    </span>
                  </span>
                  {wide && bar}
                  <span className="kfd-slot kfd-num">
                    <Bar w={24} h={7} r={3.5} tone={2} className="kfd-sk" />
                    <span className="kfd-real">{r.lines}</span>
                  </span>
                  <span className="kfd-end">
                    <Check on={s.built > i} size={16} />
                  </span>
                  {!wide && bar}
                </div>
              )
            })}
          </Window>
        )
      }}
    </Stage>
  )
}
