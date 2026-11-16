"use client"

/* Styled file input: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  FileInput as FileInputRoot,
  FileInputDropzone as FileInputDropzonePart,
  FileInputItem as FileInputItemPart,
  FileInputItemRemove as FileInputItemRemovePart,
  FileInputList as FileInputListPart,
  FileInputTrigger as FileInputTriggerPart,
  createFileInputController,
  formatFileSize,
  relativePath,
} from "@/components/primitives/file-input"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

function FileInput({ speed, className, ...props }: React.ComponentProps<typeof FileInputRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <FileInputRoot className={cn("flex min-w-0 flex-col gap-3", className)} {...props} />
    </Speed>
  )
}

/* A dashed hairline at rest. While files are over it the line turns solid and the zone
   tints: ring colour when they would be taken, destructive when they would not. */
function FileInputDropzone({
  className,
  ...props
}: React.ComponentProps<typeof FileInputDropzonePart>) {
  return (
    <FileInputDropzonePart
      className={cn(
        "group/drop relative flex flex-col items-center justify-center gap-1 rounded-[14px] border border-dashed border-foreground/15 px-6 py-7 text-center text-[13px] outline-none",
        "hover:border-foreground/25",
        "data-dragging:shadow-[0_10px_28px_-12px_rgb(0_0_0/0.25)] dark:data-dragging:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.8)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-dragging:border-solid",
        "data-drag-accept:border-ring data-drag-accept:bg-ring/[0.07] data-drag-accept:ring-[3px] data-drag-accept:ring-ring/15",
        "data-drag-reject:border-destructive data-drag-reject:bg-destructive/[0.05] data-drag-reject:ring-[3px] data-drag-reject:ring-destructive/15",
        "data-disabled:cursor-not-allowed data-disabled:border-foreground/10 data-disabled:opacity-60",
        "[&>svg]:size-4",
        className,
      )}
      {...props}
    />
  )
}

/* The mark at the top of a drop zone: a small key holding the upload arrow. While files are
   over the zone it rises 8px with a pop, on top of the zone's own lift. Purely visual. */
function FileInputDropzoneIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="file-input-dropzone-icon"
      className={cn(
        "mb-2 grid size-9 place-items-center rounded-[10px] bg-background text-foreground",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        "[transition:translate_calc(480ms*var(--kf-speed,1))_var(--ease-pop),scale_calc(480ms*var(--kf-speed,1))_var(--ease-pop),color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:[transition:none]!",
        "group-data-dragging/drop:-translate-y-2 group-data-dragging/drop:scale-110 group-data-drag-accept/drop:text-ring group-data-drag-reject/drop:text-destructive",
        "[&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 10.5V2.75M4.75 6 8 2.75 11.25 6" />
        <path d="M2.75 10.5v1.25c0 .83.67 1.5 1.5 1.5h7.5c.83 0 1.5-.67 1.5-1.5V10.5" />
      </svg>
    </span>
  )
}

/* A key that opens the system picker. */
function FileInputTrigger({
  className,
  ...props
}: React.ComponentProps<typeof FileInputTriggerPart>) {
  return (
    <FileInputTriggerPart
      className={cn(
        "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium whitespace-nowrap text-foreground outline-none select-none",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        "hover:bg-muted/50 dark:hover:bg-accent/80",
        "active:translate-y-px active:shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_0_1px_rgb(0_0_0/0.08)] dark:active:shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_0_1px_rgb(0_0_0/0.6)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-invalid:ring-[3px] data-invalid:ring-destructive/25 data-invalid:shadow-[0_0_0_1px_var(--destructive)]",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  )
}

/* One Tab stop; arrow keys move between rows. */
function FileInputList({
  className,
  ...props
}: React.ComponentProps<typeof FileInputListPart>) {
  return (
    <FileInputListPart
      className={cn(
        "flex flex-col gap-1.5 rounded-[12px] outline-none empty:hidden",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  )
}

/* A row; the primitive cascades the rows in. */
function FileInputItem({
  className,
  ...props
}: React.ComponentProps<typeof FileInputItemPart>) {
  return (
    <FileInputItemPart
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-[10px] bg-background py-1.5 ps-1.5 pe-2 text-[13px] text-foreground outline-none",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-accent/40 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}

function FileInputItemRemove({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FileInputItemRemovePart>) {
  return (
    <FileInputItemRemovePart
      className={cn(
        "ms-auto grid size-6 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none",
        "hover:bg-foreground/[0.06] hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        "[&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      {children ?? (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m4.5 4.5 7 7m0-7-7 7" />
        </svg>
      )}
    </FileInputItemRemovePart>
  )
}

export {
  FileInput,
  FileInputDropzone,
  FileInputDropzoneIcon,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  createFileInputController,
  formatFileSize,
  relativePath,
}
