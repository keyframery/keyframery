"use server"

import { createHash } from "node:crypto"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { adminPassword, clearFailures, createSession, lockedOut, noteFailure, passwordMatches, SESSION_COOKIE } from "@site/lib/admin/session"

export type SignInState = { error: string | null }

/** Who is guessing, as a hash of their network address; the address itself is never kept. */
async function guesser(): Promise<string> {
  const h = await headers()
  const ip = h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  return createHash("sha256").update(`kf-admin-guess:${ip}`).digest("hex").slice(0, 16)
}

export async function signIn(_previous: SignInState, form: FormData): Promise<SignInState> {
  const password = adminPassword()
  if (!password) return { error: "The admin isn't set up: KEYFRAMERY_ADMIN_PASSWORD is missing or shorter than 24 characters." }
  const key = await guesser()
  if (lockedOut(key)) return { error: "Too many wrong passwords. Try again in 15 minutes." }
  const input = String(form.get("password") ?? "")
  if (!passwordMatches(input, password)) {
    noteFailure(key)
    // A pause per wrong guess, so guessing is slow as well as hopeless.
    await new Promise((resolve) => setTimeout(resolve, 900))
    return { error: "That password isn't right." }
  }
  clearFailures(key)
  const session = createSession(password)
  ;(await cookies()).set(SESSION_COOKIE, session.value, {
    httpOnly: true,
    // Hosted builds are always HTTPS; `next dev` is plain http://localhost, where Safari drops Secure cookies.
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    expires: session.expires,
  })
  redirect("/admin")
}

export async function signOut() {
  ;(await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" })
  redirect("/admin/sign-in")
}
