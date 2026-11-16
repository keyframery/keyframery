import { Drawer, DrawerBackdrop, DrawerContent, DrawerGrip, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

export default function Usage() {
  return (
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerGrip />
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}
