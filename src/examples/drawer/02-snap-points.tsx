// Snap points
// `snapPoints` lets it rest part way up, like a map's place list. Drag between them.
import { Drawer, DrawerBackdrop, DrawerContent, DrawerGrip, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

export default function DrawerSnapPoints() {
  return (
    <Drawer snapPoints={["40%", "90%"]}>
      <DrawerTrigger>Nearby places</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerGrip />
        <DrawerHeader>
          <DrawerTitle>Nearby</DrawerTitle>
        </DrawerHeader>
        <ul className="px-5 pb-6 text-[14px]">
          {["Bakery", "Pharmacy", "Café", "Bookshop", "Park", "Market", "Cinema", "Library"].map((place) => (
            <li key={place} className="border-b border-border py-3 last:border-0">
              {place}
            </li>
          ))}
        </ul>
      </DrawerContent>
    </Drawer>
  )
}
