import { toast, ToastRegion } from "@/components/ui/toast"

// Once, near the root of your app:
export function App() {
  return <ToastRegion />
}

// Anywhere:
export default function Usage() {
  return <button onClick={() => toast("Saved")}>Save</button>
}
