// Your router's link and a custom separator
// `render` puts the link's behaviour and motion on your router's own link. Pass any mark as the separator's children.
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

/* Stands in for your router's Link, such as Next.js's. */
function RouterLink(props: React.ComponentProps<"a">) {
  return <a {...props} />
}

export default function BreadcrumbRouter() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<RouterLink href="/team" />}>Team</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink render={<RouterLink href="/team/members" />}>Members</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Inès Laurent</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
