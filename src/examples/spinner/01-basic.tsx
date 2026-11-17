// Sizes and drawings
// `size` is `sm`, `md` or `lg`; `variant="spokes"` draws eight fading spokes instead of the stretching ring. It takes the text colour.
import { Spinner } from "@/components/ui/spinner"

export default function SpinnerBasic() {
  return (
    <div className="flex items-center gap-5 text-muted-foreground">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <Spinner size="lg" variant="spokes" />
    </div>
  )
}
