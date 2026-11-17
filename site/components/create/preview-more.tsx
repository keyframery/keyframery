"use client"

/* The rest of the /create preview, loaded after the first cards so the page stays quick: more of the
   same Lisbon trip, one card per job, each built from Keyframery components that read the preset. */

import { BedDouble, CloudRain, Hotel, ImagePlus, Plane, Search, TramFront, Utensils } from "lucide-react"
import * as React from "react"

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfig } from "@/components/ui/chart"
import { Command, CommandGroup, CommandGroupLabel, CommandInput, CommandItem, CommandItemIcon, CommandItemText, CommandList, CommandSearch, CommandShortcut } from "@/components/ui/command"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Kbd, KbdCombo } from "@/components/ui/kbd"
import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/ui/meter"
import { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement } from "@/components/ui/number-input"
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@/components/ui/otp-input"
import { Pagination, PaginationList } from "@/components/ui/pagination"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { Rating } from "@/components/ui/rating"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Timeline, TimelineConnector, TimelineDescription, TimelineItem, TimelineMarker, TimelineTime, TimelineTitle } from "@/components/ui/timeline"
import { Toggle, ToggleGroup } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { PreviewCard } from "@site/components/create/preview"

/* ---------- Spend: a bar chart by day and a donut by kind ---------- */

const days = [
  { day: "Thu 14", food: 64, transport: 38 },
  { day: "Fri 15", food: 92, transport: 12 },
  { day: "Sat 16", food: 118, transport: 26 },
  { day: "Sun 17", food: 76, transport: 18 },
  { day: "Mon 18", food: 41, transport: 44 },
]
const daysConfig = { food: { label: "Food" }, transport: { label: "Getting around" } } satisfies ChartConfig

function SpendByDay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend by day</CardTitle>
        <CardDescription>Food and getting around, per day</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart aria-label="Spend by day" className="[--chart-height:11rem]" data={days} config={daysConfig} categoryKey="day" formatValue={(v: number) => `€${v}`} />
      </CardContent>
    </Card>
  )
}

const kinds = [
  { kind: "stay", amount: 880 },
  { kind: "flights", amount: 620 },
  { kind: "food", amount: 210 },
  { kind: "transport", amount: 80 },
  { kind: "museums", amount: 50 },
]
const kindsConfig = {
  amount: { label: "Spent" },
  stay: { label: "Stay" },
  flights: { label: "Flights" },
  food: { label: "Food" },
  transport: { label: "Trams and taxis" },
  museums: { label: "Museums" },
} satisfies ChartConfig

function SpendByKind() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Where the money went</CardTitle>
        <CardDescription>Stay, flights and everything else</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart aria-label="Spend by kind" type="donut" className="mx-auto max-w-[280px] [--chart-height:13rem]" data={kinds} config={kindsConfig} categoryKey="kind" formatValue={(v: number) => `€${v.toLocaleString("en-GB")}`} />
      </CardContent>
    </Card>
  )
}

/* ---------- Dates ---------- */

function Dates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dates</CardTitle>
        <CardDescription>Four nights, Thursday to Monday</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar mode="range" aria-label="Trip dates" defaultMonth="2026-05-01" defaultValue={["2026-05-14", "2026-05-18"]} />
      </CardContent>
    </Card>
  )
}

/* ---------- Search the trip ---------- */

function TripSearch() {
  return (
    <Card className="[--card-padding:0.75rem]">
      <Command aria-label="Search the trip" className="h-[244px] w-full">
        <CommandSearch>
          <Search aria-hidden className="size-4 text-muted-foreground" />
          <CommandInput aria-label="Search the trip" placeholder="Search bookings, places, people…" />
        </CommandSearch>
        <CommandList>
          <CommandGroup>
            <CommandGroupLabel>Bookings</CommandGroupLabel>
            <CommandItem value="flight" label="TAP 1351 to Lisbon" shortcut="mod+1">
              <CommandItemIcon><Plane /></CommandItemIcon>
              <CommandItemText>TAP 1351 to Lisbon</CommandItemText>
              <CommandShortcut />
            </CommandItem>
            <CommandItem value="casa" label="Casa do Largo" shortcut="mod+2">
              <CommandItemIcon><Hotel /></CommandItemIcon>
              <CommandItemText>Casa do Largo</CommandItemText>
              <CommandShortcut />
            </CommandItem>
          </CommandGroup>
          <CommandGroup>
            <CommandGroupLabel>Places</CommandGroupLabel>
            <CommandItem value="market" label="Time Out Market">
              <CommandItemIcon><Utensils /></CommandItemIcon>
              <CommandItemText>Time Out Market</CommandItemText>
            </CommandItem>
            <CommandItem value="tram" label="Tram 28 from Martim Moniz">
              <CommandItemIcon><TramFront /></CommandItemIcon>
              <CommandItemText>Tram 28 from Martim Moniz</CommandItemText>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </Card>
  )
}

/* ---------- Good to know ---------- */

function GoodToKnow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Good to know</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion defaultValue={["checkin"]}>
          <AccordionItem value="checkin">
            <AccordionHeader>
              <AccordionTrigger data-play="faq-checkin">When can we check in?</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>From 3pm. Leave bags with the host from 11am.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="tram">
            <AccordionHeader>
              <AccordionTrigger data-play="faq-tram">Do we need tram passes?</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>A 24-hour Viva Viagem pass covers trams, the metro and the funiculars.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="tips">
            <AccordionHeader>
              <AccordionTrigger>Is tipping expected?</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Rounding up or 5 to 10% in restaurants is plenty.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

/* ---------- Who paid for what ---------- */

const payments = [
  ["Flights", "Jo", "€620"],
  ["Casa do Largo", "Maya", "€440"],
  ["Lumiares", "Sam", "€440"],
  ["Time Out Market", "Priya", "€96"],
] as const

function Payments() {
  const [page, setPage] = React.useState(1)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Who paid for what</CardTitle>
        <CardDescription>Settle up when you&apos;re home</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>For</TableHead>
              <TableHead>Paid by</TableHead>
              <TableHead className="text-end">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map(([what, who, amount]) => (
              <TableRow key={what}>
                <TableCell className="font-medium">{what}</TableCell>
                <TableCell className="text-muted-foreground">{who}</TableCell>
                <TableCell className="text-end tabular-nums">{amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination aria-label="Payments pages" total={12} pageSize={4} page={page} onPageChange={setPage} className="justify-center">
          <PaginationList />
        </Pagination>
      </CardContent>
    </Card>
  )
}

/* ---------- Room ---------- */

function Room() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your room at Lumiares</CardTitle>
        <CardDescription>Change it until 9 May</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <RadioGroup aria-label="Room" defaultValue="twin" className="grid gap-2.5">
          {[
            ["double", "Double", "€95 a night"],
            ["twin", "Twin", "€110 a night"],
            ["family", "Family suite", "€165 a night"],
          ].map(([value, label, price]) => (
            <label key={value} className="flex items-center gap-2.5 text-[13px]">
              <Radio value={value} data-play={`room-${value}`} />
              <span className="flex-1">{label}</span>
              <span className="text-muted-foreground tabular-nums">{price}</span>
            </label>
          ))}
        </RadioGroup>
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="flex items-center gap-2"><BedDouble aria-hidden className="size-4 text-muted-foreground" /> Guests</span>
          <NumberInput defaultValue={2} min={1} max={4}>
            <NumberInputGroup>
              <NumberInputDecrement aria-label="Fewer guests" />
              <NumberInputControl aria-label="Guests" className="w-10" />
              <NumberInputIncrement aria-label="More guests" />
            </NumberInputGroup>
          </NumberInput>
        </div>
        <Meter value={18} max={23}>
          <MeterLabel>Luggage allowance</MeterLabel>
          <MeterValue>{() => "18 of 23 kg"}</MeterValue>
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </Meter>
      </CardContent>
    </Card>
  )
}

/* ---------- Rate the stay ---------- */

function RateStay() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How was Casa do Largo?</CardTitle>
        <CardDescription>Your review helps the next guests</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Rating aria-label="Rating" defaultValue={4} />
        <ToggleGroup multiple aria-label="What stood out" defaultValue={["view"]} className="flex-wrap">
          <Toggle value="view" size="sm" data-play="tag-view">The view</Toggle>
          <Toggle value="host" size="sm" data-play="tag-host">Friendly host</Toggle>
          <Toggle value="quiet" size="sm">Quiet</Toggle>
        </ToggleGroup>
      </CardContent>
    </Card>
  )
}

/* ---------- Verify the phone ---------- */

function Verify() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm your phone</CardTitle>
        <CardDescription>We texted a code to +44 7700 900 412</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <OTPInput maxLength={4} aria-label="Code" defaultValue="48">
          <OTPInputGroup>
            {[0, 1, 2, 3].map((i) => <OTPInputSlot key={i} index={i} />)}
          </OTPInputGroup>
        </OTPInput>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Spinner className="size-3.5" />
          Waiting for the last two digits
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------- A heads-up ---------- */

function HeadsUp() {
  return (
    <Card>
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#trips">Trips</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#lisbon">Lisbon in May</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Friday</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Alert>
          <CloudRain />
          <AlertTitle>Rain on Friday afternoon</AlertTitle>
          <AlertDescription>We moved the Belém walk to Saturday morning.</AlertDescription>
        </Alert>
        <p className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          Undo with <KbdCombo keys={["mod", "z"]} /> or press <Kbd>Esc</Kbd> to keep it.
        </p>
      </CardContent>
    </Card>
  )
}

/* ---------- The group chat ---------- */

function Chat() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Group chat</CardTitle>
        <CardAction>
          <Tooltip>
            <TooltipTrigger render={<span className="flex gap-1" />}>
              {["MA", "JO", "PK"].map((initials) => (
                <Avatar key={initials} className="size-7 ring-2 ring-card">
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
              ))}
            </TooltipTrigger>
            <TooltipContent>Maya, Jo and Priya are here</TooltipContent>
          </Tooltip>
        </CardAction>
      </CardHeader>
      <CardContent>
        <BubbleGroup>
          <Bubble>
            <BubbleContent>Table for four at Taberna da Rua das Flores, 8pm?</BubbleContent>
          </Bubble>
          <Bubble align="end">
            <BubbleContent>Yes please. I&apos;ll book the tuk-tuk back.</BubbleContent>
          </Bubble>
        </BubbleGroup>
        <p className="mt-3 text-[12px] text-muted-foreground">
          Booked by{" "}
          <HoverCard>
            <HoverCardTrigger href="#jo" className="font-medium text-foreground">Jo</HoverCardTrigger>
            <HoverCardContent>Jo Okafor pays for the flights and the dinners.</HoverCardContent>
          </HoverCard>
        </p>
      </CardContent>
    </Card>
  )
}

/* ---------- Itinerary ---------- */

function Itinerary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thursday</CardTitle>
        <CardDescription>Arrival day</CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline aria-label="Thursday">
          {[
            ["complete", "Land at Lisbon", "10:40", "Terminal 1, bags on belt 6"],
            ["complete", "Check in at Casa do Largo", "15:00", "Alfama, keys from Rita"],
            ["current", "Sunset at Miradouro da Graça", "19:30", "A ten-minute walk uphill"],
            ["upcoming", "Dinner in Bairro Alto", "21:00", "Table for four"],
          ].map(([status, title, time, note]) => (
            <TimelineItem key={title} status={status as "complete" | "current" | "upcoming"}>
              <TimelineMarker />
              <TimelineConnector />
              <TimelineTitle>{title}</TimelineTitle>
              <TimelineTime>{time}</TimelineTime>
              <TimelineDescription>{note}</TimelineDescription>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}

/* ---------- Photos: empty, with the weather still loading ---------- */

function Photos() {
  return (
    <Card>
      <CardContent className="pt-[var(--card-padding,1.25rem)]">
        <Empty className="py-4">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImagePlus />
            </EmptyMedia>
            <EmptyTitle>No photos yet</EmptyTitle>
            <EmptyDescription>Everyone&apos;s photos from the trip land here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Add photos</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
      <CardFooter className="grid gap-2 border-t">
        <span className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground"><Spinner className="size-3" /> Loading the forecast</span>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 flex-1 rounded-[8px]" />)}
        </div>
      </CardFooter>
    </Card>
  )
}

export const moreCards: PreviewCard[] = [
  { key: "spend-day", node: <SpendByDay /> },
  { key: "dates", node: <Dates /> },
  { key: "faq", node: <GoodToKnow /> },
  { key: "room", node: <Room /> },
  { key: "search", node: <TripSearch />, phone: false },
  { key: "spend-kind", node: <SpendByKind /> },
  { key: "chat", node: <Chat /> },
  { key: "payments", node: <Payments />, phone: false },
  { key: "rate", node: <RateStay /> },
  { key: "itinerary", node: <Itinerary />, phone: false },
  { key: "heads-up", node: <HeadsUp /> },
  { key: "verify", node: <Verify />, phone: false },
  { key: "photos", node: <Photos />, phone: false },
]
