import { Kbd, KbdCombo } from "@/components/ui/kbd"

export default function Usage() {
  return (
    <>
      <Kbd>Esc</Kbd>
      <KbdCombo keys={["mod", "k"]} />
    </>
  )
}
