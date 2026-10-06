"use client"

import { toast } from "sonner"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"

import { Screen } from "../screen"

export function Settings({ className }: { className?: string }) {
  return (
    <Screen name="settings" title="Settings" className={className}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-muted text-sm font-medium">AK</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Ada Kaur</p>
          <p className="truncate text-sm text-muted-foreground">ada@studio.dev</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" className="justify-start" data-director="edit-profile" />}>Edit profile</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>This is how your teammates see you.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input id="display-name" defaultValue="Ada Kaur" />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <DialogClose render={<Button data-director="save-profile" />}>Save profile</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" className="justify-start" data-director="notifications" />}>Notifications</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>Choose what reaches you.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 px-4">
              {["Mentions", "Replies to my threads", "Weekly summary"].map((n) => (
                <label key={n} className="flex items-center justify-between text-sm">
                  {n}
                  <Switch defaultChecked={n !== "Weekly summary"} />
                </label>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="ghost" className="justify-start text-destructive hover:text-destructive" />}>Delete account</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>Your projects go with it. This can&apos;t be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep my account</AlertDialogCancel>
              <AlertDialogAction>Delete account</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Button className="mt-4 w-fit" data-director="save-settings" onClick={() => toast("Settings saved", { description: "Your teammates see the change now." })}>
        Save changes
      </Button>
    </Screen>
  )
}
