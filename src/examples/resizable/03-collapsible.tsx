// Collapsible, and remembered
// A `collapsible` panel snaps shut when dragged below its `minSize`. `autoSaveId` keeps the layout between visits.
import { Resizable, ResizableHandle, ResizablePanel } from "@/components/ui/resizable"

export default function ResizableCollapsible() {
  return (
    <Resizable autoSaveId="docs-example-layout" className="h-[200px] w-full max-w-[480px] rounded-[14px] border">
      <ResizablePanel defaultSize={30} minSize={20} collapsible>
        <div className="grid h-full place-items-center text-[13px] text-muted-foreground">Drag me shut</div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70}>
        <div className="grid h-full place-items-center text-[13px] text-muted-foreground">Content</div>
      </ResizablePanel>
    </Resizable>
  )
}
