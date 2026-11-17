import { Form, FormItem, FormLabel, FormMessage, FormSubmit } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export default function Usage() {
  return (
    <Form submit={async (data) => console.log(data.get("email"))}>
      <FormItem name="email">
        <FormLabel>Email</FormLabel>
        <Input type="email" required />
        <FormMessage />
      </FormItem>
      <FormSubmit>Subscribe</FormSubmit>
    </Form>
  )
}
