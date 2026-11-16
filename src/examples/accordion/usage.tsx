import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion"

export default function Usage() {
  return (
    <Accordion>
      <AccordionItem value="returns">
        <AccordionHeader>
          <AccordionTrigger>Can I return it?</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Yes, within 30 days of delivery.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
