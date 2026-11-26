import { DiffViewer } from "@/components/ui/diff-viewer"

export default function Usage() {
  return (
    <DiffViewer
      filename="src/config.ts"
      before={`export const config = {\n  retries: 2,\n  timeout: 5000,\n}\n`}
      after={`export const config = {\n  retries: 3,\n  timeout: 8000,\n}\n`}
    />
  )
}
