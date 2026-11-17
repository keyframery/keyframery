// Stacked areas
// `type="area"` with `stacked` piles each series on the one below. The fill fades down from the line in the series' colour.
import { Chart, type ChartConfig } from "@/components/ui/chart"

const data = [
  { day: "Mon", organic: 420, paid: 180, referral: 90 },
  { day: "Tue", organic: 480, paid: 210, referral: 110 },
  { day: "Wed", organic: 455, paid: 260, referral: 95 },
  { day: "Thu", organic: 530, paid: 240, referral: 130 },
  { day: "Fri", organic: 610, paid: 300, referral: 150 },
  { day: "Sat", organic: 390, paid: 160, referral: 120 },
  { day: "Sun", organic: 350, paid: 140, referral: 105 },
]

const config = {
  organic: { label: "Organic" },
  paid: { label: "Paid" },
  referral: { label: "Referral" },
} satisfies ChartConfig

export default function ChartArea() {
  return <Chart aria-label="Visits by source this week" className="max-w-[520px]" type="area" stacked data={data} config={config} categoryKey="day" />
}
