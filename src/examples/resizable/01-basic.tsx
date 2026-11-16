// Two panels
// Drag the handle, or focus it and use the arrow keys. `minSize` and `maxSize` are percentages.
import { Resizable, ResizableHandle, ResizablePanel } from "@/components/ui/resizable"

export default function ResizableBasic() {
  return (
    <Resizable className="h-[200px] w-full max-w-[480px] rounded-[14px] border">
      <ResizablePanel defaultSize={35} minSize={20} maxSize={60}>
        <div className="grid h-full place-items-center text-[13px] text-muted-foreground">Sidebar</div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={65}>
        <div className="grid h-full place-items-center text-[13px] text-muted-foreground">Content</div>
      </ResizablePanel>
    </Resizable>
  )
}
