// Images only, with limits
// `accept`, `maxSize` and `maxFiles` turn files away before they're added. `onReject` says why.
import * as React from "react"

import { FileInput, FileInputDropzone, FileInputItem, FileInputList, FileInputTrigger } from "@/components/ui/file-input"

export default function FileInputImages() {
  const [error, setError] = React.useState<string | null>(null)
  return (
    <FileInput
      accept="image/*"
      maxSize={2_000_000}
      maxFiles={3}
      multiple
      onValueChange={() => setError(null)}
      onReject={(rejected) => setError(`${rejected.length} file${rejected.length === 1 ? " was" : "s were"} turned away: images up to 2 MB only.`)}
      className="w-full max-w-[360px]"
    >
      <FileInputDropzone>
        <p className="mb-3 text-[13px] text-muted-foreground">PNG or JPEG, up to 2 MB each</p>
        <FileInputTrigger>Choose images</FileInputTrigger>
      </FileInputDropzone>
      {error && <p className="text-[12px] text-destructive">{error}</p>}
      <FileInputList aria-label="Images">
        <FileInputItem />
      </FileInputList>
    </FileInput>
  )
}
