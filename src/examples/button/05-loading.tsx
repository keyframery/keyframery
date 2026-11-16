// Loading
// Return a promise from `onClick` and the button shows a spinner until it settles. Screen readers hear `pendingAnnouncement`.
import { Button } from "@/components/ui/button"

const save = () => new Promise((resolve) => setTimeout(resolve, 1600))

export default function ButtonLoading() {
  return (
    <Button variant="primary" onClick={save} pendingAnnouncement="Saving">
      Save changes
    </Button>
  )
}
