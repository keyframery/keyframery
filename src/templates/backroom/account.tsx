"use client"

/* The person and the store: the workspace switcher at the top of the sidebar, the account menu at
   its foot and in the header, the sign-out confirmation, the keyboard shortcuts and the dialog
   that asks the person before an AI agent does something that can't be undone. */

import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import { Bot, ChevronsUpDown, FlaskConical, Keyboard, LogOut, SlidersHorizontal } from "lucide-react"
import * as React from "react"

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { KbdCombo } from "@/components/ui/kbd"
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
} from "@/components/ui/menu"
import { SidebarLabel, SidebarMenuButton } from "@/components/ui/sidebar"

import { currentAsk, subscribeAsk } from "./agent"
import { workspaces } from "./data"
import { initials } from "./format"
import { accountLinks } from "./routes"
import { linkProps, useRouter } from "./router"
import { useShellState } from "./shell-state"
import { me, useStore, workspaceOf } from "./store"

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const

/* Each store's own picture: a crop of one of its prints. The sandbox has none. */
const WORKSPACE_PHOTO: Record<string, string | undefined> = { tideline: "/demo/coast-5.jpg", wholesale: "/demo/canal.jpg" }

function WorkspaceMark({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const photo = WORKSPACE_PHOTO[id]
  const box = size === "sm" ? "size-6 rounded-[7px]" : "size-8 rounded-[9px]"
  return (
    <span aria-hidden className={`relative grid ${box} shrink-0 place-items-center overflow-hidden bg-muted text-muted-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]`}>
      {photo ? <img src={photo} alt="" className="absolute inset-0 size-full object-cover" /> : <FlaskConical size={14} strokeWidth={1.75} />}
    </span>
  )
}

export function WorkspaceSwitcher() {
  const { state, actions } = useStore()
  const current = workspaceOf(state)
  useShortcut("mod+1", () => actions.switchWorkspace(workspaces[0].id))
  useShortcut("mod+2", () => actions.switchWorkspace(workspaces[1].id))
  useShortcut("mod+3", () => actions.switchWorkspace(workspaces[2].id))
  return (
    <Menu>
      <MenuTrigger
        aria-label={`Store: ${current.name}. Switch store`}
        render={<SidebarMenuButton className="h-12 gap-2.5 px-2 data-open:bg-foreground/[0.05] group-data-collapsed/sidebar:px-[3px]" />}
      >
        <WorkspaceMark id={current.id} />
        <SidebarLabel className="flex min-w-0 flex-col gap-1 text-start">
          <span className="truncate text-[13px] leading-none font-semibold text-foreground">{current.name}</span>
          <span className="truncate text-[11.5px] leading-none font-normal text-muted-foreground">{current.plan}</span>
        </SidebarLabel>
        <ChevronsUpDown {...icon} className="ms-auto shrink-0 text-muted-foreground transition-opacity group-data-collapsed/sidebar:opacity-0" />
      </MenuTrigger>
      <MenuContent align="start" className="w-64">
        <MenuGroup>
          <MenuGroupLabel>Stores</MenuGroupLabel>
          <MenuRadioGroup value={current.id} onValueChange={(id) => actions.switchWorkspace(id as string)}>
            {workspaces.map((w) => (
              <MenuRadioItem key={w.id} value={w.id} label={w.name} className="h-11 gap-2.5">
                <WorkspaceMark id={w.id} size="sm" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate leading-none">{w.name}</span>
                  <span className="truncate text-[11.5px] leading-none text-muted-foreground">{w.plan}</span>
                </span>
                <WorkspaceShortcut keys={w.shortcut} />
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuGroup>
      </MenuContent>
    </Menu>
  )
}

function PersonAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const { state } = useStore()
  const person = me(state)
  if (!person) return null
  return (
    <Avatar size={size}>
      {person.avatar && <AvatarImage src={person.avatar} alt="" />}
      <AvatarFallback>{initials(person.name)}</AvatarFallback>
    </Avatar>
  )
}

/** The account menu's rows, the same in the sidebar and the header. */
function AccountMenuContent({ align }: { align: "start" | "end" }) {
  const { state } = useStore()
  const router = useRouter()
  const { setOpen } = useShellState()
  const person = me(state)
  const links = accountLinks.filter((l) => router.exists(l.to))
  return (
    <MenuContent align={align} className="w-64">
      <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-2">
        <PersonAvatar />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[13px] leading-none font-semibold">{person?.name}</span>
          <span className="truncate text-[12px] leading-none text-muted-foreground">{person?.email}</span>
        </div>
      </div>
      <MenuSeparator />
      {links.length > 0 && (
        <>
          <MenuGroup>
            {links.map((l) => (
              <MenuItem key={l.to} render={<a {...linkProps(router, l.to)} />}>
                {l.icon && (
                  <MenuItemIcon>
                    <l.icon {...icon} />
                  </MenuItemIcon>
                )}
                {l.label}
              </MenuItem>
            ))}
          </MenuGroup>
          <MenuSeparator />
        </>
      )}
      <MenuGroup>
        <MenuItem onClick={() => setOpen("appearance", true)}>
          <MenuItemIcon>
            <SlidersHorizontal {...icon} />
          </MenuItemIcon>
          Appearance
        </MenuItem>
        <MenuItem onClick={() => setOpen("shortcuts", true)} shortcut="shift+?">
          <MenuItemIcon>
            <Keyboard {...icon} />
          </MenuItemIcon>
          Keyboard shortcuts
        </MenuItem>
      </MenuGroup>
      <MenuSeparator />
      <MenuItem destructive onClick={() => setOpen("signOut", true)}>
        <MenuItemIcon>
          <LogOut {...icon} className="rtl:-scale-x-100" />
        </MenuItemIcon>
        Sign out
      </MenuItem>
    </MenuContent>
  )
}

/** The person at the foot of the sidebar. */
export function SidebarAccount() {
  const { state } = useStore()
  const person = me(state)
  if (!person) return null
  return (
    <Menu>
      <MenuTrigger
        aria-label={`Account: ${person.name}`}
        render={<SidebarMenuButton className="h-12 gap-2.5 px-2 data-open:bg-foreground/[0.05] group-data-collapsed/sidebar:px-1" />}
      >
        <PersonAvatar />
        <SidebarLabel className="flex min-w-0 flex-col gap-1 text-start">
          <span className="truncate text-[13px] leading-none font-medium text-foreground">{person.name}</span>
          <span className="truncate text-[11.5px] leading-none font-normal text-muted-foreground">{person.email}</span>
        </SidebarLabel>
        <ChevronsUpDown {...icon} className="ms-auto shrink-0 text-muted-foreground transition-opacity group-data-collapsed/sidebar:opacity-0" />
      </MenuTrigger>
      <AccountMenuContent align="start" />
    </Menu>
  )
}

/** The avatar at the end of the header. */
export function HeaderAccount() {
  const { state } = useStore()
  const person = me(state)
  if (!person) return null
  return (
    <Menu>
      <MenuTrigger aria-label={`Account: ${person.name}`} render={<Button variant="ghost" size="icon" className="rounded-full p-0 shadow-none dark:shadow-none" />}>
        <PersonAvatar />
      </MenuTrigger>
      <AccountMenuContent align="end" />
    </Menu>
  )
}

/** Asks before signing out. */
export function SignOutDialog() {
  const { open, setOpen } = useShellState()
  const { state, actions } = useStore()
  const router = useRouter()
  return (
    <AlertDialog open={open.signOut} onOpenChange={(next) => setOpen("signOut", next)}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <LogOut {...icon} className="rtl:-scale-x-100" />
          </AlertDialogMedia>
          <AlertDialogTitle>Sign out of {state.settings.name}?</AlertDialogTitle>
          <AlertDialogDescription>You'll need your email and password to come back in. Nothing you've saved is lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose>Stay signed in</AlertDialogClose>
          <AlertDialogClose
            variant="destructive"
            data-agent-confirm="Signs the person out of the admin"
            onClick={() => {
              actions.signOut()
              if (router.exists("/sign-in")) router.navigate("/sign-in")
            }}
          >
            Sign out
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["mod", "k"], label: "Search and commands" },
  { keys: ["mod", "b"], label: "Show or hide the sidebar" },
  { keys: ["mod", "1"], label: "Switch to Tideline Prints" },
  { keys: ["mod", "2"], label: "Switch to Tideline Wholesale" },
  { keys: ["mod", "3"], label: "Switch to the sandbox" },
  { keys: ["shift", "?"], label: "This list" },
  { keys: ["esc"], label: "Close a menu, dialog or panel" },
]

export function ShortcutsDialog() {
  const { open, setOpen } = useShellState()
  useShortcut("shift+?", () => setOpen("shortcuts", true))
  return (
    <Dialog open={open.shortcuts} onOpenChange={(next) => setOpen("shortcuts", next)}>
      <DialogBackdrop />
      <DialogContent className="[--dialog-width:420px]">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>They work anywhere in Backroom.</DialogDescription>
        </DialogHeader>
        <DialogClose variant="icon" />
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
              <span>{s.label}</span>
              <KbdCombo keys={s.keys} />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

/** When an AI agent asks to use a control marked `data-agent-confirm`, the person decides here. */
export function AgentConfirm() {
  const ask = React.useSyncExternalStore(subscribeAsk, currentAsk, () => null)
  const [shown, setShown] = React.useState(ask)
  React.useEffect(() => {
    if (ask) setShown(ask)
  }, [ask])
  return (
    <AlertDialog open={!!ask} onOpenChange={(next) => !next && ask?.resolve(false)}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Bot {...icon} />
          </AlertDialogMedia>
          <AlertDialogTitle>Allow the assistant to do this?</AlertDialogTitle>
          <AlertDialogDescription>{shown?.text}. It asked to do this for you; nothing happens unless you allow it.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose onClick={() => ask?.resolve(false)}>Don't allow</AlertDialogClose>
          <AlertDialogClose variant="destructive" onClick={() => ask?.resolve(true)}>
            Allow
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** A radio item takes no `shortcut`, so the switcher shows the hint itself (⌘1 on a Mac, Ctrl+1 elsewhere). */
function WorkspaceShortcut({ keys }: { keys: string }) {
  const hint = useShortcutHint(keys)
  return <MenuShortcut aria-hidden>{hint.text}</MenuShortcut>
}
