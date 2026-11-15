// Captured by capture.mjs as a static social image; never shipped as a page.
import { ForceDark, Scene } from "@site/components/landing/scenes"
import { LogoMark } from "@site/components/logo"

export const metadata = { robots: { index: false } }

const card = "relative overflow-hidden rounded-2xl bg-[#0a0b0f] ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)]"

export default function Page() {
  return (
    <div className="lp dark" style={{ width: 1200, height: 630, overflow: "hidden", position: "relative", background: "#050608" }}>
      <ForceDark />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 90% at 85% 110%, rgb(36 71 245 / 0.35), transparent 60%), radial-gradient(60% 70% at 0% 0%, rgb(109 92 246 / 0.18), transparent 60%)" }} />
      <div style={{ position: "absolute", left: 64, top: 60, width: 470 }} className="flex flex-col text-white">
        <div className="flex items-center gap-2.5 text-[22px] font-semibold tracking-tight">
          <LogoMark className="size-7" /> Keyframery
        </div>
        <h1 className="lp-display mt-[86px] text-[58px] leading-[1.02]">Animated components for UI SDK</h1>
        <p className="mt-5 text-[20px] leading-snug text-white/70">60 components. Plain CSS.<br />Four motion styles. Open source.</p>
        <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 font-mono text-[15px] text-white/85 ring-1 ring-white/12">
          <span className="text-white/40">$</span> npx shadcn add @keyframery/all
        </div>
      </div>
      <div style={{ position: "absolute", left: 580, top: 44, width: 580, height: 542 }} className="grid grid-cols-2 grid-rows-[250px_1fr] gap-4">
        <div className={`${card} col-span-2`} id="c-tabs"><Scene slug="tabs" className="lp-stage h-full" pad={18} /></div>
        <div className={card} id="c-slider"><Scene slug="slider" className="lp-stage h-full" pad={14} /></div>
        <div className={card} id="c-switch"><Scene slug="switch" className="lp-stage h-full" pad={14} /></div>
      </div>
      <div style={{ position: "absolute", left: 64, bottom: 44 }} className="text-[15px] text-white/45">keyframery.com</div>
    </div>
  )
}
