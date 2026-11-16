// Keys and combinations
// `KbdCombo` takes key names: `mod` shows ⌘ on a Mac and Ctrl elsewhere.
import { Kbd, KbdCombo } from "@/components/ui/kbd"

export default function KbdBasic() {
  return (
    <div className="flex flex-col items-start gap-3 text-[13px]">
      <span className="flex items-center gap-2">
        Close <Kbd>Esc</Kbd>
      </span>
      <span className="flex items-center gap-2">
        Search <KbdCombo keys={["mod", "k"]} />
      </span>
      <span className="flex items-center gap-2">
        Command palette <KbdCombo keys={["mod", "shift", "p"]} />
      </span>
    </div>
  )
}
