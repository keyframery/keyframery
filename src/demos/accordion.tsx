import * as React from "react"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const controls = {
  multiple: { type: "switch", label: "Multiple", default: false, group: "Behaviour" },
  collapsible: { type: "switch", label: "Collapsible", default: true, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep mounted", default: false, group: "Behaviour" },
  hiddenUntilFound: { type: "switch", label: "Hidden until found", default: false, group: "Behaviour" },
  items: { type: "slider", label: "Items", default: 4, min: 1, max: 4, step: 1 },
  title: { type: "text", label: "Title", default: "Glasgow to Rome" },
  booking: { type: "text", label: "Booking", default: "Booking K7M2QX" },
  subtitle: { type: "text", label: "Subtitle", default: "Thursday 14 May, 2 adults" },
  question: { type: "text", label: "Question", default: "How much baggage can I bring?" },
  answer: { type: "text", label: "Answer", default: "Each traveller can bring one cabin bag up to 8 kg and one checked bag up to 23 kg. A second checked bag costs €60 if you add it before check-in opens." },
  notes: { type: "switch", label: "Notes", default: true, group: "Behaviour" },
  width: { type: "slider", label: "Width", default: 440, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 8, min: 0, max: 20, step: 1, unit: "px", group: "Layout" },
  padding: { type: "slider", label: "Padding", default: 14, min: 4, max: 24, step: 1, unit: "px", group: "Layout" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  muted: { type: "color", label: "Muted", default: "", group: "Colours" },
  border: { type: "color", label: "Border", default: "", group: "Colours" },
} as const

export const meta = { name: "Accordion", group: "Disclosure" }

/* Opens rows far apart, so the height, the cascade and the chevron all show. */
export const play = [
  { click: '[data-slot="accordion-item"]:nth-child(3) button', wait: 1600 },
  { click: '[data-slot="accordion-item"]:nth-child(4) button', wait: 1600 },
  { click: '[data-slot="accordion-item"]:nth-child(1) button', wait: 1600 },
  { click: '[data-slot="accordion-item"]:nth-child(3) button', wait: 1200 },
  { click: '[data-slot="accordion-item"]:nth-child(4) button', wait: 1200 },
]

const questions = [
  {
    value: "baggage",
    note: "Sports gear and instruments count as checked bags.",
    question: "How much baggage can I bring?",
    answer:
      "Each traveller can bring one cabin bag up to 8 kg and one checked bag up to 23 kg. A second checked bag costs €60 if you add it before check-in opens.",
  },
  {
    value: "changes",
    note: "Manage it under Trips, or call us any time.",
    question: "Can I change my flight?",
    answer:
      "Yes, up to 2 hours before departure. Changes are free on this fare, and you pay only the difference if the new flight costs more.",
  },
  {
    value: "refunds",
    note: "Taxes are refunded even on saver fares.",
    question: "How do refunds work?",
    answer:
      "Cancel at least 24 hours before departure for a full refund to the card you paid with. It usually arrives within 5 to 7 working days.",
  },
  {
    value: "check-in",
    note: "Bag drop closes 40 minutes before departure.",
    question: "When does check-in open?",
    answer:
      "Online check-in opens 48 hours before departure and closes 60 minutes before. Your boarding passes are saved to this booking.",
  },
]

export default function AccordionDemo({
  multiple = false,
  collapsible = true,
  disabled = false,
  keepMounted = false,
  hiddenUntilFound = false,
  items = 4,
  title = "Glasgow to Rome",
  booking = "Booking K7M2QX",
  subtitle = "Thursday 14 May, 2 adults",
  question = "How much baggage can I bring?",
  answer = "Each traveller can bring one cabin bag up to 8 kg and one checked bag up to 23 kg. A second checked bag costs €60 if you add it before check-in opens.",
  notes = true,
  width = 440,
  radius = 8,
  padding = 14,
  ink = "",
  muted = "",
  border = "",
}: {
  multiple?: boolean
  collapsible?: boolean
  disabled?: boolean
  keepMounted?: boolean
  hiddenUntilFound?: boolean
  items?: number
  title?: string
  booking?: string
  subtitle?: string
  question?: string
  answer?: string
  notes?: boolean
  width?: number
  radius?: number
  padding?: number
  ink?: string
  muted?: string
  border?: string
}) {
  const theme = {
    "--accordion-radius": `${radius}px`,
    "--accordion-padding": `${padding}px`,
    ...(ink ? { "--accordion-ink": ink } : null),
    ...(muted ? { "--accordion-muted": muted } : null),
    ...(border ? { "--accordion-border": border } : null),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="h-[392px] w-full">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="text-[12px] text-muted-foreground tabular-nums">{booking}</p>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
      <div className="mt-4 rounded-[14px] bg-card px-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <Accordion defaultValue={["baggage"]} multiple={multiple} collapsible={collapsible} disabled={disabled} keepMounted={keepMounted} hiddenUntilFound={hiddenUntilFound}>
          {questions.slice(0, items).map((item, index) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionHeader>
                <AccordionTrigger>{index === 0 ? question : item.question}</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>
                <p>{index === 0 ? answer : item.answer}</p>
                {notes && <p className="mt-2 text-[12px] text-muted-foreground/80">{item.note}</p>}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
