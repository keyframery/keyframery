// An order's details, with copy buttons
// A copy button copies the value beside it and confirms on itself with a drawn check. Below 28rem wide the rows stack.
import {
  DescriptionList,
  DescriptionListActions,
  DescriptionListCopy,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListValue,
} from "@/components/ui/description-list"

const rows = [
  { label: "Order", value: "#1048", copy: true },
  { label: "Placed", value: "18 November 2026, 14:02" },
  { label: "Payment", value: "Visa ending 4242" },
  { label: "Tracking", value: "1Z 999 AA1 01 2345 6784", copy: true },
]

export default function DescriptionListRows() {
  return (
    <DescriptionList aria-label="Order details" className="max-w-md">
      {rows.map((row) => (
        <DescriptionListItem key={row.label}>
          <DescriptionListTerm>{row.label}</DescriptionListTerm>
          <DescriptionListDetails>
            <DescriptionListValue>{row.value}</DescriptionListValue>
            {row.copy && (
              <DescriptionListActions>
                <DescriptionListCopy />
              </DescriptionListActions>
            )}
          </DescriptionListDetails>
        </DescriptionListItem>
      ))}
    </DescriptionList>
  )
}
