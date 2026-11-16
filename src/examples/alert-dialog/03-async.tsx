// Waiting for the action
// Give a close button an `action` that returns a promise. The dialog stays open, with a spinner, until it settles.
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const cancelPlan = () => new Promise((resolve) => setTimeout(resolve, 1500))

export default function AlertDialogAsync() {
  return (
    <AlertDialog>
      <AlertDialogTrigger variant="destructive">Cancel plan</AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel your plan?</AlertDialogTitle>
          <AlertDialogDescription>You keep Pro until 30 June. After that, projects over the free limit become read only.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose>Keep Pro</AlertDialogClose>
          <AlertDialogClose variant="destructive" action={cancelPlan}>
            Cancel plan
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
