/* The approval's primitive layer for Vue (src/components/primitives/approval.tsx): the root that makes the
   instance and shares it with the controls the renderer composes, and the other parts. Motion classes
   live in the SFCs. */
import type { ChangeDetails } from "@ui-sdk/core"
import { createParts, usePart, usePrimitive, type PrimitiveHandle } from "@ui-sdk/vue/primitive"
import { defineComponent, inject, provide, type InjectionKey, type PropType } from "vue"

import { approval, type ApprovalRisk, type ApprovalStatus } from "@/components/keyframery/core/approval-core"

export const approvalKey: InjectionKey<PrimitiveHandle<typeof approval>> = Symbol("kf-approval")

/** The approval around this part: its `state` and `api` (`approve`, `deny`, `pressDeny`, `back`,
    `setAlways`, `setReason`). */
export function useApproval() {
  const handle = inject(approvalKey, null)
  if (!handle) throw new Error("Approval parts must be inside <Approval>.")
  return handle
}

/* The root: makes the instance, shares it, renders the card's element. Callbacks are events. */
export const ApprovalRoot = defineComponent({
  name: "ApprovalRoot",
  inheritAttrs: false,
  props: {
    status: String as PropType<ApprovalStatus>,
    defaultStatus: String as PropType<ApprovalStatus>,
    risk: String as PropType<ApprovalRisk>,
    askReason: { type: Boolean, default: undefined },
    resolvedAt: Number,
  },
  emits: ["status-change", "update:status", "approve", "deny"],
  setup(props, { emit }) {
    const handle = usePrimitive(approval, () => ({
      status: props.status,
      defaultStatus: props.defaultStatus,
      risk: props.risk,
      askReason: props.askReason,
      resolvedAt: props.resolvedAt,
      onStatusChange(status: ApprovalStatus, details: ChangeDetails<string>) {
        emit("status-change", status, details)
        if (!details.canceled) emit("update:status", status)
      },
      onApprove: (details: { always: boolean }) => emit("approve", details),
      onDeny: (reason: string | undefined) => emit("deny", reason),
    }))
    provide(approvalKey, handle)
    return usePart(handle, "root", undefined, undefined, "div")
  },
})

/* The other parts, found from the root above them. */
export const parts = createParts(approval, {
  icon: "span",
  title: "div",
  description: "p",
  target: "div",
  risk: "span",
  details: "div",
  body: "div",
  actions: "div",
  summary: "div",
})
