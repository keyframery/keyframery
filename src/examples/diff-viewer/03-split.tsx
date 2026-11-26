// Side by side
// Start in the split view with `defaultView="split"`. Below `splitMinWidth` (640px by default) it shows as unified, so it still reads on a phone.
import { DiffViewer } from "@/components/ui/diff-viewer"

const before = `{
  "name": "orders-api",
  "version": "1.4.0",
  "dependencies": {
    "zod": "^3.22.0"
  }
}
`

const after = `{
  "name": "orders-api",
  "version": "1.5.0",
  "dependencies": {
    "zod": "^3.23.8",
    "pino": "^9.4.0"
  }
}
`

export default function DiffViewerSplit() {
  return <DiffViewer filename="package.json" before={before} after={after} defaultView="split" lineNumbers={false} />
}
