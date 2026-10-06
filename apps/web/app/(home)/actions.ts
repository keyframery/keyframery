"use server"

import { EMAIL, saveSignup } from "@/lib/waitlist"

export type WaitlistState = { status: "idle" | "ok" | "error"; message: string }

export async function joinWaitlist(_prev: WaitlistState, form: FormData): Promise<WaitlistState> {
  const ok: WaitlistState = { status: "ok", message: "You're on the waitlist. We'll email you once, when Pro opens." }
  if (form.get("company")) return ok // the hidden field: only bots fill it in
  const email = String(form.get("email") ?? "").trim().toLowerCase()
  if (!EMAIL.test(email)) return { status: "error", message: "That email doesn't look complete. Check it and try again." }
  try {
    await saveSignup({ email, source: String(form.get("source") ?? "home").slice(0, 32) })
    return ok
  } catch {
    return { status: "error", message: "The waitlist couldn't be saved just now. Try again in a minute." }
  }
}
