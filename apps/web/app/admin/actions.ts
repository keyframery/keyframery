"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { adminPassword, createSession, passwordMatches, SESSION_COOKIE } from "@/lib/admin/session"

export type LoginState = { error: string }

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const password = adminPassword()
  if (!password) return { error: "Admin isn't set up: KEYFRAMERY_ADMIN_PASSWORD is missing or shorter than 24 characters." }
  const input = String(form.get("password") ?? "")
  if (!passwordMatches(input, password)) {
    // A pause per wrong guess; the password's length does the real work against guessing.
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { error: "That password isn't right." }
  }
  const session = createSession(password)
  ;(await cookies()).set(SESSION_COOKIE, session.value, {
    httpOnly: true,
    // Vercel is always HTTPS; locally `next start` is plain http://localhost, where Safari drops Secure cookies.
    secure: process.env.VERCEL === "1",
    sameSite: "strict",
    path: "/admin",
    expires: session.expires,
  })
  redirect("/admin")
}

export async function logout() {
  ;(await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" })
  redirect("/admin")
}
