import { Sparkline } from "@/components/ui/sparkline"

export default function Usage() {
  return <Sparkline data={[12, 14, 13, 18, 21, 19, 24]} label="Revenue" period="last 7 days" />
}
