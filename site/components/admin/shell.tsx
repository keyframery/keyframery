"use client"

import { Bot, Download, ExternalLink, Globe, LayoutDashboard, LogOut, ScrollText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { LogoMark } from "@site/components/logo"

import { icon } from "./kit"

const NAV = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/installs", label: "Installs", Icon: Download },
  { href: "/admin/traffic", label: "Traffic", Icon: Globe },
  { href: "/admin/agents", label: "AI agents", Icon: Bot },
  { href: "/admin/events", label: "Event log", Icon: ScrollText },
]

const active = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`))

/** The admin's frame: a sidebar of pages (a sheet on phones), a slim header, the page. */
export function AdminShell({ children, signOut }: { children: React.ReactNode; signOut: () => Promise<void> }) {
  const path = usePathname()
  const title = NAV.find((item) => active(path, item.href))?.label ?? "Admin"
  return (
    <SidebarProvider
      mobileBreakpoint={768}
      className="group/shell min-h-svh w-full bg-[color-mix(in_oklab,var(--muted)_55%,var(--background))] text-foreground dark:bg-card"
      style={{ "--sidebar-width": "15rem", "--sidebar-width-mobile": "18rem", "--stat-padding": "1.25rem", "--card-padding": "1.25rem" } as React.CSSProperties}
    >
      <Sidebar aria-label="Admin pages" className="sticky top-0 h-svh bg-transparent data-mobile:fixed data-mobile:h-svh data-mobile:bg-background">
        <SidebarHeader className="h-auto px-3 pt-4 pb-2">
          <Link href="/admin" className="flex items-center gap-2.5 rounded-[9px] px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <LogoMark className="size-6" />
            <span className="grid leading-tight">
              <span className="text-[14px] font-semibold tracking-tight">Keyframery</span>
              <span className="text-[12px] text-muted-foreground">Admin</span>
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="pt-2">
          <SidebarGroup>
            <SidebarGroupLabel>Analytics</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ href, label, Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton isActive={active(path, href)} render={<Link href={href} />}>
                      <Icon {...icon} />
                      <SidebarLabel>{label}</SidebarLabel>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Site</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<a href="/" target="_blank" rel="noreferrer" />}>
                    <ExternalLink {...icon} />
                    <SidebarLabel>keyframery.com</SidebarLabel>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <form action={signOut}>
            <Button type="submit" variant="ghost" className="w-full justify-start gap-2.5 text-muted-foreground">
              <LogOut {...icon} />
              Sign out
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset
        render={<div />}
        className="flex min-h-svh flex-col bg-background md:my-2 md:me-2 md:min-h-[calc(100svh-1rem)] md:rounded-[14px] md:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:md:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
      >
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 px-4 md:px-6">
          <SidebarTrigger aria-label="Show or hide the sidebar" />
          <span className="text-[13.5px] font-medium">{title}</span>
        </header>
        <main id="content" className="mx-auto w-full max-w-[1280px] flex-1 px-4 pt-6 pb-16 md:px-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
