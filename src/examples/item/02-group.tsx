// A list of links
// Inside `ItemGroup`, rows rendered as links share one highlight that glides to the row under the
// pointer or the keyboard focus. Rows arrive one after another when the list mounts.
import { ChevronRight } from "lucide-react"
import * as React from "react"

import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item"

const settings = [
  { href: "#profile", title: "Profile", description: "Name, photo and the email we write to" },
  { href: "#billing", title: "Billing", description: "Visa ending 4242, renews 3 December" },
  { href: "#sessions", title: "Signed-in devices", description: "This MacBook and an iPhone" },
]

export default function ItemGroupExample() {
  return (
    <ItemGroup aria-label="Account" className="w-full max-w-[400px]">
      {settings.map((s, i) => (
        <React.Fragment key={s.href}>
          {i > 0 && <ItemSeparator />}
          <Item size="sm" render={<a href={s.href} />}>
            <ItemContent>
              <ItemTitle>{s.title}</ItemTitle>
              <ItemDescription>{s.description}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight />
            </ItemActions>
          </Item>
        </React.Fragment>
      ))}
    </ItemGroup>
  )
}
