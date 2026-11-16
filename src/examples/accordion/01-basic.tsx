// Basic
// One item open at a time. Opening another closes the first.
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  { value: "shipping", q: "How long does shipping take?", a: "Two to four working days in the UK, a week to the rest of Europe." },
  { value: "returns", q: "Can I return it?", a: "Yes, within 30 days of delivery. Returns are free." },
  { value: "warranty", q: "Is there a warranty?", a: "Two years on everything, covering parts and labour." },
]

export default function AccordionBasic() {
  return (
    <Accordion className="max-w-[420px]">
      {faqs.map((faq) => (
        <AccordionItem key={faq.value} value={faq.value}>
          <AccordionHeader>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{faq.a}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
