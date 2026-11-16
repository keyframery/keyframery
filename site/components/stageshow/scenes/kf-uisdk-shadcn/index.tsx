import { Bar, Card, Segmented, Stage, Window, type Act } from '../../kit'
import './kfa.css'

// UI SDK tabs in a shadcn project. The selected tab carries
// `data-selected:bg-primary` and stays unstyled, because shadcn's
// `data-selected` variant only matches `data-selected="true"` and UI SDK
// writes the bare attribute. The bracket form `data-[selected]:` matches it.
//
// Beats: the selected Account tab sits unstyled under its open panel; the
// pointer double-clicks the class in tabs.tsx, types the bracket form over
// it; Cmd+S saves; a beat later the Account tab fills with the primary
// colour and holds. Reset: Cmd+Z, Cmd+S, the tab goes back to unstyled.
//
// Real strings: Account, Billing, tabs.tsx and the two classes.

type S = { cls: string; sel: boolean; editing: boolean; dirty: boolean; styled: boolean }

const BEFORE = 'data-selected:bg-primary'
const AFTER = 'data-[selected]:bg-primary'

const REST = { wide: { x: 330, y: 104 }, compact: { x: 290, y: 96 } }

const initial: S = { cls: BEFORE, sel: false, editing: false, dirty: false, styled: false }
const poster: S = { ...initial, cls: AFTER, styled: true }

async function script(a: Act<S>) {
  await a.wait(1200)
  a.mark('open')
  await a.move({ at: 'cls', x: 0.55, y: 0.5 })
  await a.wait(250)
  await a.click({ at: 'cls', x: 0.55, y: 0.5 }, { double: true })
  a.put({ sel: true, editing: true })
  // Off the words while typing, as a hand does once it goes to the keys
  await a.move({ at: 'cls', x: 0.55, y: 2.6 }, { duration: 450 })
  await a.wait(250)
  a.mark('type')
  a.put({ sel: false, cls: '', dirty: true })
  await a.type('cls', AFTER, { interval: 62 })
  await a.wait(450)
  a.mark('save')
  await a.key('cmd+s')
  a.put({ dirty: false, editing: false })
  // The preview reloads a beat after the save
  await a.wait(380)
  a.put({ styled: true })
  a.mark('payoff')
  await a.wait(2600)
  // Undo, save: the tab goes back as it came, from its own cause
  a.mark('reset')
  await a.key('cmd+z')
  a.put({ cls: BEFORE, dirty: true })
  await a.wait(350)
  await a.key('cmd+s')
  a.put({ dirty: false })
  await a.wait(320)
  a.put({ styled: false })
  await a.wait(300)
  await a.move(REST[a.layout])
  await a.wait(400)
}

function CodeLines({ s }: { s: S }) {
  const fixed = s.cls === AFTER
  const value = fixed ? (
    <>data-<b className="kfa-brk">[</b>selected<b className="kfa-brk">]</b>:bg-primary</>
  ) : (
    s.cls
  )
  return (
    <div className="kfa-code">
      <div className="kfa-ln"><span className="kfa-tag">&lt;TabsTab</span></div>
      <div className="kfa-ln">  <span className="kfa-attr">value</span>=<span className="kfa-str">"account"</span></div>
      <div className="kfa-ln">
        {'  '}<span className="kfa-attr">className</span>=<span className="kfa-str">"</span>
        <span className="kfa-cls" data-target="cls" data-cursor="ibeam" data-typing>
          <span className="kfa-val" data-sel={s.sel || undefined}>{value}</span>
          <span className="kfa-caret" data-show={(s.editing && !s.sel) || undefined} key={s.cls} />
        </span>
        <span className="kfa-str">"</span>
      </div>
      <div className="kfa-ln"><span className="kfa-tag">&gt;</span></div>
      <div className="kfa-ln">  Account</div>
      <div className="kfa-ln"><span className="kfa-tag">&lt;/TabsTab&gt;</span></div>
    </div>
  )
}

export default function KfUiSdkShadcn() {
  return (
    <Stage<S>
      width={720}
      height={380}
      compact={{ below: 600, width: 358, height: 360 }}
      initial={initial}
      poster={poster}
      script={script}
      keys={{ wide: 'bottom-left', compact: 'top' }}
      cursor={{ at: REST }}
      className="kfa">
      {(s, _rect, layout) => (
        <>
          {/* Compact drops the address so the keycaps sit on clear chrome */}
          <Window url={layout === 'wide' ? 'localhost:3000/settings' : undefined} className="kfa-app">
            <div className="kfa-page">
              <div className="kfa-head">
                <Bar w={112} h={9} tone={4} />
                <Bar w={184} h={6} tone={2} />
              </div>
              <Segmented className="kfa-tabs" items={['Account', 'Billing']} value={0} data-styled={s.styled || undefined} />
              <Card className="kfa-panel" gap={14}>
                <div className="kfa-field">
                  <Bar w={44} h={6} tone={3} />
                  <div className="kfa-input"><Bar w={96} h={6} tone={2} /></div>
                </div>
                <div className="kfa-field">
                  <Bar w={60} h={6} tone={3} />
                  <div className="kfa-input"><Bar w={132} h={6} tone={2} /></div>
                </div>
                <div className="kfa-field">
                  <Bar w={38} h={6} tone={3} />
                  <div className="kfa-input"><Bar w={80} h={6} tone={2} /></div>
                </div>
              </Card>
            </div>
          </Window>

          <Card flush pad="small" className="kfa-editor">
            <div className="kfa-file">
              <span className="kfa-name">tabs.tsx</span>
              <span className="kfa-dot" data-show={s.dirty || undefined} />
            </div>
            <CodeLines s={s} />
          </Card>
        </>
      )}
    </Stage>
  )
}
