/* shadcn's names for the field parts: FormItem and FormField are Keyframery's Field (a field takes the
   `name` its control submits under, and wires its label, description and errors itself). */
export { default as Form } from "./Form.vue"
export { default as FormStatus } from "./FormStatus.vue"
export { default as FormSubmit } from "./FormSubmit.vue"
export {
  FieldControl as FormControl,
  FieldDescription as FormDescription,
  Field as FormField,
  Field as FormItem,
  FieldLabel as FormLabel,
  FieldError as FormMessage,
  useFieldControl,
} from "@/components/keyframery/field"
export { form, type FormOptions, type FormResult, type FormStatus as FormStatusValue } from "@/components/keyframery/core/form-core"
