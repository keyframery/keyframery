"use client"

/* One small live demo per component page (docs/components/*). Each shows the change Keyframery animates,
   with a control to trigger it where the change needs one. The Preview around it switches to stock. */

import { Bell, Calendar as CalendarIcon, FileText, Home, Inbox, Settings, Trash2, X } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { ListCutDemo, LoadCutDemo, MatchCutDemo, StateCutDemo, ValueCutDemo } from "./helpers"

const FRAMEWORKS = ["Next.js", "Remix", "Astro", "Vite", "React Router"]
const AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#2447f5"/><circle cx="20" cy="16" r="7" fill="#fff"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#fff"/></svg>')

function AccordionDemo() {
  return (
    <Accordion className="w-full max-w-sm">
      <AccordionItem value="a">
        <AccordionTrigger>What changes?</AccordionTrigger>
        <AccordionContent>The height eases open, and the chevron turns instead of being swapped.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Do I edit the component?</AccordionTrigger>
        <AccordionContent>No. It&apos;s shadcn&apos;s own accordion.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function AlertDemo() {
  const [shown, setShown] = React.useState(false)
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Button variant="outline" className="w-fit" onClick={() => setShown((s) => !s)}>{shown ? "Hide the alert" : "Show an alert"}</Button>
      {shown && (
        <Alert>
          <AlertTitle>Your changes are saved</AlertTitle>
          <AlertDescription>The team can see them now.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function AttachmentDemo() {
  const [state, setState] = React.useState<"uploading" | "done" | "error">("done")
  const run = (end: "done" | "error") => {
    setState("uploading")
    setTimeout(() => setState(end), 700)
  }
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Attachment state={state} className="w-full">
        <AttachmentMedia>
          <FileText />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>release-notes.pdf</AttachmentTitle>
          <AttachmentDescription>{state === "uploading" ? "Uploading…" : state === "error" ? "Upload failed" : "PDF · 1.2 MB"}</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove release-notes.pdf">
            <X />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => run("done")}>Upload</Button>
        <Button size="sm" variant="outline" onClick={() => run("error")}>Upload and fail</Button>
      </div>
    </div>
  )
}

function AvatarDemo() {
  const [n, setN] = React.useState(0)
  return (
    <div className="flex items-center gap-4">
      <Avatar key={n} className="size-12">
        <AvatarImage src={AVATAR} alt="" />
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>
      <Button size="sm" variant="outline" onClick={() => setN((v) => v + 1)}>Reload the photo</Button>
    </div>
  )
}

function ButtonDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button>Save</Button>
      <Button variant="outline">
        <Settings />
        Settings
      </Button>
      <Button variant="outline">
        <Bell />
        Notify
      </Button>
      <Button variant="ghost" size="icon" aria-label="Delete">
        <Trash2 />
      </Button>
    </div>
  )
}

function ButtonGroupDemo() {
  return (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup>
  )
}

function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 12))
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-lg border" />
}

function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-48">
      <CarouselContent>
        {[1, 2, 3, 4].map((n) => (
          <CarouselItem key={n}>
            <div className="grid aspect-square place-items-center rounded-lg border bg-background text-3xl font-semibold">{n}</div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

function CheckboxDemo() {
  return (
    <div className="grid gap-3">
      {["Email me about replies", "Send a weekly summary", "Remind me of due dates"].map((label, i) => (
        <Label key={label} className="flex items-center gap-2 font-normal">
          <Checkbox defaultChecked={i === 0} />
          {label}
        </Label>
      ))}
    </div>
  )
}

function CollapsibleDemo() {
  return (
    <Collapsible className="w-full max-w-xs rounded-lg border bg-background p-3">
      <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>Show three more files</CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-2 grid gap-1 px-2 text-sm text-muted-foreground">
          <li>roadmap.md</li>
          <li>pricing.csv</li>
          <li>launch-plan.pdf</li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ComboboxDemo() {
  return (
    <Combobox items={FRAMEWORKS}>
      <ComboboxInput placeholder="Pick a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function ContextMenuDemo() {
  const [pinned, setPinned] = React.useState(false)
  return (
    <ContextMenu>
      <ContextMenuTrigger className="grid h-28 w-64 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">Right-click here</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>Pin to top</ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function DropdownMenuDemo() {
  const [bar, setBar] = React.useState(true)
  const [panel, setPanel] = React.useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>View</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={bar} onCheckedChange={setBar}>Status bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={panel} onCheckedChange={setPanel}>Panel</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuItem>Reset layout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FieldDemo() {
  const [error, setError] = React.useState("")
  return (
    <form
      className="grid w-full max-w-xs gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        const value = new FormData(e.currentTarget).get("email")
        setError(String(value).includes("@") ? "" : "Enter an email address, like ana@acme.com.")
      }}
    >
      <Field data-invalid={!!error || undefined}>
        <FieldLabel htmlFor="field-demo-email">Email</FieldLabel>
        <Input id="field-demo-email" name="email" placeholder="ana@acme.com" aria-invalid={!!error || undefined} />
        {error && <FieldError>{error}</FieldError>}
      </Field>
      <Button type="submit" className="w-fit">Subscribe</Button>
    </form>
  )
}

function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="link" />}>@keyframery</HoverCardTrigger>
      <HoverCardContent className="w-64 text-sm">Motion for shadcn/ui. It opens from its trigger at your theme&apos;s pace.</HoverCardContent>
    </HoverCard>
  )
}

/** A field that turns invalid when submitted empty; the control comes from the page. */
function InvalidOnSubmit({ children }: { children: (invalid: boolean) => React.ReactNode }) {
  const [invalid, setInvalid] = React.useState(false)
  return (
    <form
      className="grid w-full max-w-xs gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        const empty = [...new FormData(e.currentTarget).values()].every((v) => !String(v).trim())
        setInvalid(empty)
      }}
    >
      {children(invalid)}
      <Button type="submit" className="w-fit">Submit empty to see the error</Button>
    </form>
  )
}

function InputDemo() {
  return <InvalidOnSubmit>{(invalid) => <Input name="name" placeholder="Your name" aria-invalid={invalid || undefined} />}</InvalidOnSubmit>
}

function TextareaDemo() {
  return <InvalidOnSubmit>{(invalid) => <Textarea name="note" placeholder="Leave a note" aria-invalid={invalid || undefined} />}</InvalidOnSubmit>
}

function NativeSelectDemo() {
  return (
    <InvalidOnSubmit>
      {(invalid) => (
        <NativeSelect name="plan" aria-invalid={invalid || undefined} defaultValue="">
          <NativeSelectOption value="">Choose a plan</NativeSelectOption>
          <NativeSelectOption value="free">Free</NativeSelectOption>
          <NativeSelectOption value="team">Team</NativeSelectOption>
        </NativeSelect>
      )}
    </InvalidOnSubmit>
  )
}

function InputGroupDemo() {
  return (
    <InvalidOnSubmit>
      {(invalid) => (
        <InputGroup>
          <InputGroupInput name="search" placeholder="Search the docs" aria-invalid={invalid || undefined} />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Go</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      )}
    </InvalidOnSubmit>
  )
}

function InputOtpDemo() {
  const [value, setValue] = React.useState("")
  const [invalid, setInvalid] = React.useState(false)
  return (
    <div className="grid justify-items-center gap-3">
      <InputOTP maxLength={4} value={value} onChange={setValue} aria-invalid={invalid || undefined}>
        <InputOTPGroup>
          {[0, 1, 2, 3].map((i) => (
            <InputOTPSlot key={i} index={i} aria-invalid={invalid || undefined} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <Button size="sm" variant="outline" onClick={() => setInvalid(value !== "1234")}>Check the code (it&apos;s 1234)</Button>
    </div>
  )
}

function MenubarDemo() {
  const [ruler, setRuler] = React.useState(false)
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New tab</MenubarItem>
          <MenubarItem>Open…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={ruler} onCheckedChange={setRuler}>Show ruler</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1 p-1 text-sm">
              <li><NavigationMenuLink href="/docs">Docs</NavigationMenuLink></li>
              <li><NavigationMenuLink href="/cuts">Cuts</NavigationMenuLink></li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1 p-1 text-sm">
              <li><NavigationMenuLink href="/theme">Theme builder</NavigationMenuLink></li>
              <li><NavigationMenuLink href="/docs/changelog">Changelog</NavigationMenuLink></li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function PaginationDemo() {
  const [page, setPage] = React.useState(2)
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }} />
        </PaginationItem>
        {[1, 2, 3, 4].map((n) => (
          <PaginationItem key={n}>
            <PaginationLink href="#" isActive={page === n} onClick={(e: React.MouseEvent) => { e.preventDefault(); setPage(n) }}>
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={(e: React.MouseEvent) => { e.preventDefault(); setPage((p) => Math.min(4, p + 1)) }} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Share</PopoverTrigger>
      <PopoverContent className="w-60 text-sm">It grows from the button you pressed and goes back into it.</PopoverContent>
    </Popover>
  )
}

function ProgressDemo() {
  const [value, setValue] = React.useState(30)
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Progress value={value} />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(0, v - 25))}>Less</Button>
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.min(100, v + 25))}>More</Button>
      </div>
    </div>
  )
}

const STEPS = [
  { name: "goal", required: true, choices: [{ value: "launch" }, { value: "grow" }] },
  { name: "size", required: true, choices: [{ value: "solo" }, { value: "team" }] },
] as const

function QuestionnaireDemo() {
  return (
    <Questionnaire className="w-full max-w-sm" defaultItem="goal" items={STEPS} onSubmit={(e: React.FormEvent) => { e.preventDefault(); toast("Thanks, answers saved") }}>
      <QuestionnaireItem name="goal" required>
        <QuestionnaireTitle>What are you working on?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="launch">Launching a product</QuestionnaireChoice>
          <QuestionnaireChoice value="grow">Growing one</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="size" required>
        <QuestionnaireTitle>Who&apos;s building it?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="solo">Just me</QuestionnaireChoice>
          <QuestionnaireChoice value="team">A team</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions className="w-full">
        <QuestionnairePrevious />
        <QuestionnaireNext>Next</QuestionnaireNext>
        <QuestionnaireSubmit>Save</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  )
}

function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable" className="gap-3">
      {["default", "comfortable", "compact"].map((v) => (
        <Label key={v} className="flex items-center gap-2 font-normal capitalize">
          <RadioGroupItem value={v} />
          {v}
        </Label>
      ))}
    </RadioGroup>
  )
}

function ResizableDemo() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="max-w-sm rounded-lg border">
      <ResizablePanel defaultSize="50%">
        <div className="grid h-28 place-items-center text-sm">Files</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="50%">
        <div className="grid h-28 place-items-center text-sm">Preview</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function SelectDemo() {
  const items = [
    { label: "Pick a fruit", value: null },
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Grapes", value: "grapes" },
  ]
  return (
    <Select items={items}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.label} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const NAV = [
  { title: "Home", icon: Home },
  { title: "Inbox", icon: Inbox },
  { title: "Calendar", icon: CalendarIcon },
  { title: "Settings", icon: Settings },
]

function SidebarDemo() {
  const [active, setActive] = React.useState("Home")
  return (
    <SidebarProvider className="min-h-0 w-auto">
      <Sidebar collapsible="none" className="h-auto w-56 rounded-lg border">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {NAV.map(({ title, icon: Icon }) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton isActive={active === title} onClick={() => setActive(title)}>
                    <Icon />
                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

function SliderDemo() {
  return <Slider defaultValue={[40]} max={100} step={1} className="w-full max-w-xs" />
}

function SonnerDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" onClick={() => toast.success("Changes saved")}>Save</Button>
      <Button variant="outline" onClick={() => toast.warning("You're close to your limit")}>Warn</Button>
      <Button variant="outline" onClick={() => toast.error("Couldn't send the invite")}>Fail</Button>
    </div>
  )
}

function SwitchDemo() {
  return (
    <div className="grid gap-3">
      {["Airplane mode", "Do not disturb"].map((label, i) => (
        <Label key={label} className="flex items-center gap-3 font-normal">
          <Switch defaultChecked={i === 1} />
          {label}
        </Label>
      ))}
    </div>
  )
}

function ToggleDemo() {
  return (
    <div className="flex gap-2">
      <Toggle aria-label="Bold">
        <span className="font-bold">B</span>
      </Toggle>
      <Toggle aria-label="Italic">
        <span className="italic">I</span>
      </Toggle>
      <Toggle aria-label="Notifications">
        <Bell />
      </Toggle>
    </div>
  )
}

function ToggleGroupDemo() {
  return (
    <ToggleGroup variant="outline" defaultValue={["week"]}>
      <ToggleGroupItem value="day">Day</ToggleGroupItem>
      <ToggleGroupItem value="week">Week</ToggleGroupItem>
      <ToggleGroupItem value="month">Month</ToggleGroupItem>
    </ToggleGroup>
  )
}

function TooltipDemo() {
  return (
    <div className="flex gap-2">
      {["Bold", "Italic", "Underline"].map((label) => (
        <Tooltip key={label}>
          <TooltipTrigger render={<Button variant="outline" size="sm" />}>{label[0]}</TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

const DEMOS: Record<string, () => React.ReactNode> = {
  accordion: AccordionDemo,
  alert: AlertDemo,
  attachment: AttachmentDemo,
  avatar: AvatarDemo,
  badge: ValueCutDemo,
  bubble: ListCutDemo,
  button: ButtonDemo,
  "button-group": ButtonGroupDemo,
  calendar: CalendarDemo,
  card: MatchCutDemo,
  carousel: CarouselDemo,
  checkbox: CheckboxDemo,
  collapsible: CollapsibleDemo,
  combobox: ComboboxDemo,
  "context-menu": ContextMenuDemo,
  "dropdown-menu": DropdownMenuDemo,
  empty: StateCutDemo,
  field: FieldDemo,
  "hover-card": HoverCardDemo,
  input: InputDemo,
  "input-group": InputGroupDemo,
  "input-otp": InputOtpDemo,
  item: ListCutDemo,
  menubar: MenubarDemo,
  message: ListCutDemo,
  "message-scroller": ListCutDemo,
  "native-select": NativeSelectDemo,
  "navigation-menu": NavigationMenuDemo,
  pagination: PaginationDemo,
  popover: PopoverDemo,
  progress: ProgressDemo,
  questionnaire: QuestionnaireDemo,
  "radio-group": RadioGroupDemo,
  resizable: ResizableDemo,
  select: SelectDemo,
  sidebar: SidebarDemo,
  skeleton: LoadCutDemo,
  slider: SliderDemo,
  sonner: SonnerDemo,
  switch: SwitchDemo,
  table: ListCutDemo,
  textarea: TextareaDemo,
  toggle: ToggleDemo,
  "toggle-group": ToggleGroupDemo,
  tooltip: TooltipDemo,
}

export const DEMO_SLUGS = Object.keys(DEMOS)

export function ComponentDemo({ slug }: { slug: string }) {
  const Demo = DEMOS[slug]
  return Demo ? <Demo /> : null
}
