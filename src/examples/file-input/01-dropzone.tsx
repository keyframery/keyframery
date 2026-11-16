// Dropzone and list
// Drop files on the zone or choose them. Each one gets a row with a remove button.
import {
  FileInput,
  FileInputDropzone,
  FileInputDropzoneIcon,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from "@/components/ui/file-input"

export default function FileInputDropzoneExample() {
  return (
    <FileInput name="attachments" multiple maxFiles={5} className="w-full max-w-[360px]">
      <FileInputDropzone>
        {(zone) => (
          <>
            <FileInputDropzoneIcon />
            <p className="font-medium">{zone.dragAccept ? "Release to add" : "Drop files here"}</p>
            <p className="mb-3 text-[12px] text-muted-foreground">Up to 5 files</p>
            <FileInputTrigger>Choose files</FileInputTrigger>
          </>
        )}
      </FileInputDropzone>
      <FileInputList aria-label="Attachments">
        <FileInputItem>
          {({ file }) => (
            <>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{file.name}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">{formatFileSize(file.size)}</span>
              </span>
              <FileInputItemRemove />
            </>
          )}
        </FileInputItem>
      </FileInputList>
    </FileInput>
  )
}
