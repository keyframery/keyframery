import { Chat } from "./screens/chat"
import { Dashboard } from "./screens/dashboard"
import { Inbox } from "./screens/inbox"
import { Payments } from "./screens/payments"
import { Playlist } from "./screens/playlist"
import { Settings } from "./screens/settings"

/** Six real screens, sized like apps on a desk rather than tiles in a grid. */
export function Wall() {
  return (
    <div data-testid="wall" className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 px-4 pb-10 md:grid-cols-12">
      <Dashboard className="md:col-span-7" />
      <Chat className="md:col-span-5 md:row-span-2" />
      <Inbox className="md:col-span-4" />
      <Settings className="md:col-span-3" />
      <Playlist className="md:col-span-5" />
      <Payments className="md:col-span-7" />
    </div>
  )
}
