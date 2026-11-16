// Pressed with the keyboard
// `listen` sinks the keys while someone presses them for real. Try ⌘K or Ctrl+K.
import { KbdCombo } from "@/components/ui/kbd"

export default function KbdListen() {
  return (
    <span className="flex items-center gap-2 text-[13px]">
      Press <KbdCombo keys={["mod", "k"]} listen />
    </span>
  )
}
