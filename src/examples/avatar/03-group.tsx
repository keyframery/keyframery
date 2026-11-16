// Group
// `AvatarGroup` overlaps them, and `AvatarGroupCount` says how many more there are. Hover one to lift it.
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"

const people = [
  { src: "/demo/face-1.jpg", initials: "MC" },
  { src: "/demo/face-2.jpg", initials: "TO" },
  { src: "/demo/face-3.jpg", initials: "ID" },
  { src: "/demo/face-4.jpg", initials: "LB" },
]

export default function AvatarGroupExample() {
  return (
    <AvatarGroup>
      {people.map((person) => (
        <Avatar key={person.initials}>
          <AvatarImage src={person.src} alt="" />
          <AvatarFallback>{person.initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount aria-label="5 more people">+5</AvatarGroupCount>
    </AvatarGroup>
  )
}
