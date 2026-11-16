// Stacked, and nested
// `orientation="vertical"` stacks panels. A Resizable inside a panel splits it again.
import { Resizable, ResizableHandle, ResizablePanel } from "@/components/ui/resizable"

export default function ResizableVertical() {
  return (
    <Resizable className="h-[260px] w-full max-w-[480px] rounded-[14px] border">
      <ResizablePanel defaultSize={40}>
        <div className="grid h-full place-items-center text-[13px] text-muted-foreground">Files</div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60}>
        <Resizable orientation="vertical">
          <ResizablePanel defaultSize={65}>
            <div className="grid h-full place-items-center text-[13px] text-muted-foreground">Editor</div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={35} minSize={15}>
            <div className="grid h-full place-items-center text-[13px] text-muted-foreground">Terminal</div>
          </ResizablePanel>
        </Resizable>
      </ResizablePanel>
    </Resizable>
  )
}
