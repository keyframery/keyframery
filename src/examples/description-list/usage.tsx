import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListValue,
} from "@/components/ui/description-list"

export default function Usage() {
  return (
    <DescriptionList aria-label="Order">
      <DescriptionListItem>
        <DescriptionListTerm>Order</DescriptionListTerm>
        <DescriptionListDetails>
          <DescriptionListValue>#1048</DescriptionListValue>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  )
}
