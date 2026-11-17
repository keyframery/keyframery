// Collapsed with a menu
// Put `BreadcrumbEllipsis` in a menu trigger to list the pages a long trail leaves out. The menu unfolds from it.
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu"

export default function BreadcrumbCollapsed() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Menu>
            <MenuTrigger
              render={<button type="button" aria-label="Show 2 more pages" className="cursor-pointer rounded-[7px] hover:bg-accent" />}
            >
              <BreadcrumbEllipsis />
            </MenuTrigger>
            <MenuContent align="start">
              <MenuItem value="guides" render={<a href="/docs/guides" />}>
                Guides
              </MenuItem>
              <MenuItem value="forms" render={<a href="/docs/guides/forms" />}>
                Forms
              </MenuItem>
            </MenuContent>
          </Menu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Validation</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
