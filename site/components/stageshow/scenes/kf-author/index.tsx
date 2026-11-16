import { useLayoutEffect, useRef, useState } from 'react'
import { Avatar, Bar, Caret, Chart, Prompt, Stage, Window, type Act } from '../../kit'
import './kf-author.css'

// An author's hero: one command installs a component, then the component
// moves. A terminal straddles the app window's sidebar; the command is
// typed, the files are created, and the cursor crosses into the app to click
// a tab whose key stretches across and settles while its panel slides in
// from that side. The reset has its causes in view: Overview is clicked
// back, then the terminal is cleared with cmd+K.
//
// Real strings: the command, its answer and the three tab labels. All else
// is placeholder.

const CMD = 'npx shadcn@latest add @keyframery/tabs'
const TABS = ['Overview', 'Activity', 'Settings']

type Phase = 'idle' | 'running' | 'done'
type S = { typed: string; phase: Phase; tab: number; cleared: boolean }

const initial: S = { typed: '', phase: 'idle', tab: 0, cleared: false }
const POSTER: S = { typed: CMD, phase: 'done', tab: 1, cleared: false }

const REST = { wide: { x: 196, y: 262 }, compact: { x: 236, y: 296 } }

async function script(a: Act<S>) {
  await a.wait(700)
  a.mark('typing')
  await a.type('typed', CMD, { interval: 42 })
  await a.wait(250)
  await a.key('enter')
  await a.set({ phase: 'running' })
  await a.wait(1000)
  a.mark('created')
  await a.set({ phase: 'done' })
  await a.wait(900)

  // Into the app: the newly added tabs, clicked
  await a.move({ at: 'tab-1', x: 0.82, y: 0.7 })
  await a.wait(250)
  await a.click()
  a.mark('switch')
  await a.set({ tab: 1 })
  await a.move('rest-app', { duration: 700 })
  a.mark('payoff')
  await a.wait(2600)

  // Reset, each change with its cause: Overview clicked back, terminal cleared
  await a.move({ at: 'tab-0', x: 0.82, y: 0.7 })
  await a.wait(200)
  await a.click()
  await a.set({ tab: 0 })
  await a.wait(700)
  await a.move('rest-term', { duration: 800 })
  await a.wait(200)
  a.mark('clear')
  await a.key('cmd+k')
  await a.set({ cleared: true })
  await a.wait(220)
  await a.snap({ typed: '', phase: 'idle' })
  await a.set({ cleared: false })
  await a.wait(400)
}

export default function KfAuthor() {
  return (
    <div className="kfe-scene">
      <Stage
        width={720}
        height={340}
        compact={{ below: 600, width: 358, height: 336 }}
        initial={initial}
        poster={POSTER}
        script={script}
        cursor={{ at: REST }}
        className="kfe-stage"
      >
        {(s, _rect, layout) => {
          const wide = layout === 'wide'
          return (
            <>
              <Window
                className="kfe-app"
                sidebar={wide ? <SidebarFiller /> : undefined}
                sidebarWidth={194}
                lead={wide ? <Bar w={86} h={7} tone={2} /> : undefined}
                toolbar={wide ? <span className="kfe-tools"><Bar w={22} h={22} r={6} tone={1} /><Bar w={22} h={22} r={6} tone={1} /></span> : undefined}
              >
                <div className="kfe-page">
                  {wide && (
                    <div className="kfe-head">
                      <Bar w={148} h={11} r={4} tone={4} />
                      <Bar w={212} h={6} tone={2} />
                    </div>
                  )}
                  <KfeTabs value={s.tab} />
                  <div className="kfe-panels" data-crop>
                    <section className="kfe-panel" data-pos={Math.sign(0 - s.tab)} aria-hidden={s.tab !== 0}>
                      <OverviewPanel wide={wide} />
                    </section>
                    <section className="kfe-panel" data-pos={Math.sign(1 - s.tab)} aria-hidden={s.tab !== 1}>
                      <ActivityPanel />
                    </section>
                  </div>
                </div>
              </Window>

              <Window chrome="terminal" lights="grey" className="kfe-term" body={{ className: 'kfe-term__body' }}>
                <div className="kfe-term__screen" data-target="term" data-cursor="ibeam" data-cleared={s.cleared || undefined}>
                  <Prompt path="~" data-typing>
                    {s.typed}
                    {s.phase === 'idle' && <Caret still={s.typed.length > 0} />}
                  </Prompt>
                  <div className="kfe-term__line kfe-term__result" data-phase={s.phase}>
                    <span className="kfe-term__mark">
                      <span className="kfe-term__spin" aria-hidden />
                      <span className="kfe-term__tick">✔</span>
                    </span>
                    <span className="kfe-term__done">Created 3 files</span>
                  </div>
                  {wide &&
                    [176, 150, 164].map((w, i) => (
                      <div key={i} className="kfe-term__line kfe-term__file" data-show={s.phase === 'done' || undefined} style={{ ['--i' as string]: i }}>
                        <Bar w={w} h={5} r={2.5} className="kfe-term__bar" style={{ background: 'rgba(255, 255, 255, 0.16)' }} />
                      </div>
                    ))}
                  <Prompt path="~" className="kfe-term__next" data-show={s.phase === 'done' || undefined}>
                    <Caret />
                  </Prompt>
                </div>
              </Window>
              <span data-target="rest-app" className="kfe-rest" />
              <span data-target="rest-term" className="kfe-rest" style={{ left: REST[layout].x, top: REST[layout].y }} />
            </>
          )
        }}
      </Stage>
    </div>
  )
}

function SidebarFiller() {
  return (
    <div className="kfe-side">
      {[92, 74, 104, 66].map((w, i) => (
        <div key={i} className="kfe-side__item" data-on={i === 1 || undefined}>
          <Bar w={14} h={14} r={4} tone={i === 1 ? 4 : 3} />
          <Bar w={w} h={7} tone={i === 1 ? 4 : 2} />
        </div>
      ))}
    </div>
  )
}

// The product's tabs: a key that stretches toward the tab it's going to (its
// leading edge first) and settles as the trailing edge catches up.
function KfeTabs({ value }: { value: number }) {
  const row = useRef<HTMLDivElement>(null)
  const last = useRef(value)
  const [key, setKey] = useState({ l: 0, r: 0, dir: 0, ready: false })
  useLayoutEffect(() => {
    const node = row.current
    if (!node) return
    const measure = (dir: number) => {
      const el = node.querySelectorAll<HTMLElement>('.kfe-tab')[value]
      if (!el) return
      const l = el.offsetLeft
      const r = node.clientWidth - l - el.offsetWidth
      setKey((k) => (k.l === l && k.r === r ? k : { l, r, dir, ready: true }))
    }
    const dir = Math.sign(value - last.current)
    last.current = value
    measure(dir)
    const observer = new ResizeObserver(() => measure(0))
    observer.observe(node)
    return () => observer.disconnect()
  }, [value])
  return (
    <div ref={row} className="kfe-tabs" role="tablist">
      <span className="kfe-tabs__key" data-dir={key.dir} data-ready={key.ready || undefined} style={{ left: key.l, right: key.r }} />
      {TABS.map((t, i) => (
        <span key={t} role="tab" aria-selected={i === value} className="kfe-tab" data-on={i === value || undefined} data-target={`tab-${i}`}>
          {t}
        </span>
      ))}
    </div>
  )
}

function OverviewPanel({ wide }: { wide: boolean }) {
  return (
    <div className="kfe-overview">
      <div className="kfe-card">
        <Bar w={58} h={6} tone={2} />
        <Bar w={84} h={12} r={4} tone={4} />
        <Chart className="kfe-chart" data={[6, 9, 7, 12, 10, 15, 13, 18]} width={wide ? 300 : 254} height={64} dot={false} />
      </div>
      <div className="kfe-card kfe-card--row">
        <Bar w={46} h={6} tone={2} />
        <Bar w={110} h={6} tone={3} />
      </div>
    </div>
  )
}

function ActivityPanel() {
  return (
    <div className="kfe-activity">
      {[
        [96, 150],
        [80, 124],
        [104, 138],
        [72, 112],
      ].map(([t, sub], i) => (
        <div key={i} className="kfe-act" style={{ ['--i' as string]: i }}>
          <Avatar plain size={26} className="kfe-act__av" />
          <div className="kfe-act__text">
            <Bar w={t as number} h={7} tone={4} />
            <Bar w={sub as number} h={6} tone={2} />
          </div>
          <Bar w={28} h={6} tone={2} className="kfe-act__meta" />
        </div>
      ))}
    </div>
  )
}
