import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"

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

export default function AccordionDemo() {
  return (
    <div className="h-[392px] w-[440px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">Lisbon to Tokyo</h3>
        <p className="text-[12px] text-muted-foreground tabular-nums">Booking K7M2QX</p>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">Thu 14 May · 2 travellers · Economy Flex</p>
      <div className="mt-4 rounded-[14px] bg-card px-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <Accordion defaultValue={["baggage"]}>
          {questions.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionHeader>
                <AccordionTrigger>{item.question}</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>
                <p>{item.answer}</p>
                <p className="mt-2 text-[12px] text-muted-foreground/80">{item.note}</p>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
