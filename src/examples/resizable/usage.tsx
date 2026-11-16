import { Resizable, ResizableHandle, ResizablePanel } from "@/components/ui/resizable"

export default function Usage() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={30}>Sidebar</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70}>Content</ResizablePanel>
    </Resizable>
  )
}
