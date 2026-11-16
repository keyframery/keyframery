// Several values
// `multiple` keeps the list open and shows each pick as a chip. Backspace removes the last one.
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItems,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox"

const skills = ["React", "TypeScript", "CSS", "Node.js", "Design systems", "Accessibility", "Testing"]

export default function ComboboxMultiple() {
  return (
    <div className="w-full max-w-[340px]">
      <Combobox items={skills} multiple defaultValue={["React", "CSS"]}>
        <ComboboxControl>
          <ComboboxChips>
            <ComboboxValue>
              {(state) =>
                (state.value as string[]).map((skill) => (
                  <ComboboxChip key={skill} value={skill}>
                    {skill}
                    <ComboboxChipRemove aria-label={`Remove ${skill}`} />
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxInput aria-label="Skills" placeholder="Add a skill" />
          </ComboboxChips>
        </ComboboxControl>
        <ComboboxContent>
          <ComboboxList>{(state) => <ComboboxItems items={state.items} />}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
