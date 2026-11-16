import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Usage() {
  return (
    <Avatar>
      <AvatarImage src="/avatars/ruth.jpg" alt="Ruth Ellis" />
      <AvatarFallback>RE</AvatarFallback>
    </Avatar>
  )
}
