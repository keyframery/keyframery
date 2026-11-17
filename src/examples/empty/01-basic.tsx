// Basic
// The parts arrive in turn: the icon tile pops and its strokes draw, then the title, the description and each action rise in.
import { FolderOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function EmptyBasic() {
  return (
    <Empty className="max-w-[420px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
        <EmptyTitle>No invoices yet</EmptyTitle>
        <EmptyDescription>Invoices you send to clients will be listed here, newest first.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="primary">New invoice</Button>
        <Button size="sm">Import from CSV</Button>
      </EmptyContent>
    </Empty>
  )
}
