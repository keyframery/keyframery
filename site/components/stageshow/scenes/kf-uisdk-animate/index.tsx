import { Bar, Button, Card, Collapse, Menu, Popover, Row, Stage, Text, Window, type Act } from '../../kit'
import './kfb.css'

// A UI SDK menu animated by a few lines of CSS. UI SDK puts
// data-starting-style on the popup's first frame and data-ending-style while
// it leaves, and exposes --transform-origin, the point on the button it opens
// from. So the menu grows out of Options and shrinks back into it.
//
// Beats: the pointer clicks Options; the menu grows from the button while the
// data-starting-style rule lights in menu.css; the highlight follows the
// pointer to Duplicate; click; the menu shrinks back into the button as the
// data-ending-style rule lights; a copy of the row opens under it and carries
// the rows below. Reset: Cmd+Z folds the copy away.
//
// Real strings: Options, Rename, Duplicate, Archive, Launch plan (and its
// copy), menu.css and its rule.

type Phase = 'start' | 'end' | null
type S = { menu: boolean; active?: number; phase: Phase; copy: boolean; wash: boolean }

const initial: S = { menu: false, phase: null, copy: false, wash: false }
const poster: S = { ...initial, menu: true, active: 1, phase: 'start' }
const REST = { wide: { x: 300, y: 70 }, compact: { x: 220, y: 72 } }
const ITEMS = ['Rename', 'Duplicate', 'Archive']

async function script(a: Act<S>) {
  await a.wait(800)
  a.mark('open')
  await a.move({ at: 'options', x: 0.7, y: 0.65 })
  await a.wait(200)
  await a.click({ at: 'options', x: 0.7, y: 0.65 })
  a.put({ menu: true, phase: 'start' })
  await a.wait(1100)
  a.put({ phase: null })
  await a.move({ at: 'dup', x: 0.8, y: 0.55 })
  a.mark('menu')
  await a.wait(500)
  await a.click({ at: 'dup', x: 0.8, y: 0.55 })
  a.put({ menu: false, phase: 'end' })
  await a.wait(240)
  a.put({ copy: true, wash: true })
  a.mark('copy')
  await a.move(REST[a.layout])
  await a.wait(500)
  a.put({ wash: false, phase: null })
  await a.wait(2200)
  a.mark('reset')
  await a.key('cmd+z')
  a.put({ copy: false })
  await a.wait(700)
}

const CSS_LINES: { text: string; on?: Phase; compact?: boolean }[] = [
  { text: '.menu {' },
  { text: '  transform-origin: var(--transform-origin);' },
  { text: '}' },
  { text: '.menu[data-starting-style],', on: 'start', compact: true },
  { text: '.menu[data-ending-style] {', on: 'end', compact: true },
  { text: '  opacity: 0;', compact: true },
  { text: '  scale: 0.95;', compact: true },
  { text: '}', compact: true },
]

export default function KfUiSdkAnimate() {
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
      className="kfb">
      {(s, rect, layout) => {
        const o = rect('options')
        return (
          <>
            {/* Compact drops the address so the keycaps sit on clear chrome */}
            <Window url={layout === 'wide' ? 'localhost:3000/projects' : undefined} className="kfb-app">
              <div className="kfb-page">
                <div className="kfb-head">
                  <Bar w={104} h={9} tone={4} />
                  <Button className="kfb-options" data-target="options" data-open={s.menu || undefined}>Options</Button>
                </div>
                <div className="kfb-list">
                  <Row className="kfb-row" selected lead={<span className="kfb-tile" />} title={<Text>Launch plan</Text>} meta={<Bar w={36} h={6} tone={2} />} />
                  <Collapse open={s.copy}>
                    <Row className="kfb-row" data-wash={s.wash || undefined} lead={<span className="kfb-tile" />} title={<Text>Launch plan copy</Text>} meta={<Bar w={36} h={6} tone={2} />} />
                  </Collapse>
                  {[92, 120, 76, 104, 84].map((w, i) => (
                    <Row key={i} className="kfb-row" lead={<span className="kfb-tile" data-faint />} title={<Bar w={w} h={7} tone={3} />} meta={<Bar w={30} h={6} tone={2} />} />
                  ))}
                </div>
              </div>
            </Window>

            <Popover show={s.menu} origin="top right" className="kfb-menu" style={{ left: o.x + o.width - 168, top: o.y + o.height + 6 }}>
              <Menu items={ITEMS} value={s.active} targets={['rename', 'dup', 'archive']} />
            </Popover>

            <Card flush pad="small" className="kfb-editor">
              <div className="kfb-file">
                <span className="kfb-name">menu.css</span>
              </div>
              <div className="kfb-code">
                {CSS_LINES.map((l, i) => (
                  <div key={i} className="kfb-ln" data-on={(l.on && s.phase === l.on) || undefined} data-wide-only={!l.compact || undefined}>
                    {l.text}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )
      }}
    </Stage>
  )
}
