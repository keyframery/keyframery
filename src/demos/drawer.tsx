import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerGrip,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export const meta = { name: "Drawer", group: "Overlays" }

/* The demo plays itself: the order rises on the drawer's own spring with its sections cascading
   in, then Keep browsing lets it fall away. */
export const play = [
  { click: "[data-slot=drawer-trigger]", wait: 2600 },
  { click: '[data-slot=drawer-close][data-variant="default"]', wait: 1600 },
]

const items = [
  { qty: 2, name: "Flat white", note: "Oat milk", price: 7.6 },
  { qty: 1, name: "Pastel de nata", note: "Warm", price: 2.2 },
  { qty: 1, name: "Sourdough loaf", note: "Sliced", price: 6.5 },
  { qty: 1, name: "Granola bowl", note: "Greek yoghurt, berries", price: 9.4 },
]

const euro = (n: number) => `€${n.toFixed(2)}`
const subtotal = items.reduce((sum, i) => sum + i.price, 0)
const service = 1.2
const total = subtotal + service

export default function DrawerDemo() {
  return (
    <div className="flex w-[340px] items-center gap-3 rounded-[14px] bg-muted/60 p-3 pl-4">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold tracking-tight">Café Lumen</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">5 items · {euro(total)}</div>
      </div>
      <Drawer>
        <DrawerTrigger>View order</DrawerTrigger>
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerGrip />
          <DrawerHeader>
            <DrawerTitle>Your order</DrawerTitle>
            <DrawerDescription>Pickup at Rua Augusta 24, ready in about 15 minutes.</DrawerDescription>
          </DrawerHeader>
          <ul className="mt-4 px-5">
            {items.map((item) => (
              <li key={item.name} className="flex items-baseline gap-3 py-2 text-[13px]">
                <span className="w-5 shrink-0 text-muted-foreground tabular-nums">{item.qty}×</span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="block text-[12px] text-muted-foreground">{item.note}</span>
                </span>
                <span className="tabular-nums">{euro(item.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mx-5 mt-2 space-y-1.5 border-t border-border pt-3 text-[13px] tabular-nums">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd>{euro(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Service</dt>
              <dd>{euro(service)}</dd>
            </div>
            <div className="flex justify-between pt-1 text-[15px] font-semibold tracking-tight">
              <dt>Total</dt>
              <dd>{euro(total)}</dd>
            </div>
          </dl>
          <DrawerFooter>
            <DrawerClose variant="primary" value="pay">
              Pay {euro(total)}
            </DrawerClose>
            <DrawerClose>Keep browsing</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
