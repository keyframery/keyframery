// Settings list
// A switch takes effect at once. For a choice that's saved with a form, a checkbox is clearer.
import { Switch } from "@/components/ui/switch"

const settings = [
  { label: "Replies", hint: "When someone answers you", on: true },
  { label: "Mentions", hint: "When someone tags you", on: true },
  { label: "Newsletter", hint: "Once a month", on: false },
]

export default function SwitchBasic() {
  return (
    <ul className="w-full max-w-[320px] divide-y divide-border">
      {settings.map((s) => (
        <li key={s.label}>
          <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
            <span className="flex flex-col gap-1">
              <span className="text-[13px] leading-none font-medium">{s.label}</span>
              <span className="text-[12px] leading-none text-muted-foreground">{s.hint}</span>
            </span>
            <Switch defaultChecked={s.on} />
          </label>
        </li>
      ))}
    </ul>
  )
}
