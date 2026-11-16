import { FileInput, FileInputDropzone, FileInputItem, FileInputList, FileInputTrigger } from "@/components/ui/file-input"

export default function Usage() {
  return (
    <FileInput multiple>
      <FileInputDropzone>
        <FileInputTrigger>Choose files</FileInputTrigger>
      </FileInputDropzone>
      <FileInputList>
        <FileInputItem />
      </FileInputList>
    </FileInput>
  )
}
