// Basic
// A header with a title, a description and an optional `CardAction` in the corner.
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CardBasic() {
  return (
    <Card className="w-full max-w-[340px]">
      <CardHeader>
        <CardTitle>Team plan</CardTitle>
        <CardDescription>Renews on 1 August</CardDescription>
        <CardAction>
          <Button size="sm" variant="ghost">
            Change
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="text-[13px] text-muted-foreground">8 of 10 seats used, 42 GB of 100 GB storage.</CardContent>
      <CardFooter className="justify-end gap-2">
        <Button size="sm">Invoices</Button>
        <Button size="sm" variant="primary">
          Add seats
        </Button>
      </CardFooter>
    </Card>
  )
}
