// Errors from your server
// Return `{ errors: { name: message } }` from `submit` and each message shows on its field, in
// the same place and the same way as the browser's own validation. Editing the field clears it.
import { Form, FormDescription, FormItem, FormLabel, FormMessage, FormStatus, FormSubmit } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

async function claim(data: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 900))
  const handle = String(data.get("handle")).toLowerCase()
  if (["ana", "studio", "admin"].includes(handle)) return { errors: { handle: `@${handle} is taken. Try @${handle}-makes.` } }
  return { message: `@${handle} is yours.` }
}

export default function FormServerErrors() {
  return (
    <Form submit={claim} className="w-full max-w-[340px]">
      <FormItem name="handle">
        <FormLabel>Shop handle</FormLabel>
        <Input required pattern="[a-z0-9-]+" defaultValue="studio" />
        <FormDescription>Lower case letters, numbers and dashes.</FormDescription>
        <FormMessage match="patternMismatch">Use lower case letters, numbers and dashes.</FormMessage>
        <FormMessage match="customError" />
      </FormItem>
      <FormSubmit pendingLabel="Checking" successLabel="Claimed">
        Claim handle
      </FormSubmit>
      <FormStatus />
    </Form>
  )
}
