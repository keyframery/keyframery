import { expect, test } from "./kit"

test("successful install and agent copies each send one aggregate event", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => {} }, configurable: true }))
  const events: unknown[] = []
  await page.route("**/api/events", async (route) => {
    events.push(route.request().postDataJSON())
    await route.fulfill({ status: 204 })
  })
  await page.goto("/?demo=off")
  await page.getByRole("button", { name: "Copy the install command", exact: true }).first().click()
  await expect(page.getByRole("button", { name: "Copied", exact: true }).first()).toBeVisible()
  await expect.poll(() => events).toEqual([{ event: "install_copy", page: "/", component: "install-command" }])
  // The agent button in this section is also available on phones.
  await page.locator('section[aria-labelledby="agents-title"]').getByRole("button", { name: "Copy for your coding agent" }).click()
  await expect.poll(() => events).toEqual([
    { event: "install_copy", page: "/", component: "install-command" },
    { event: "agent_prompt_copy", page: "/", component: "agent-prompt-button" },
  ])
})

for (const clipboard of ["denied", "unsupported"] as const) {
  test(`${clipboard} clipboard reports copy failures and sends no success events`, async ({ page }) => {
    await page.addInitScript((state) => Object.defineProperty(navigator, "clipboard", {
      value: state === "unsupported" ? undefined : { writeText: async () => { throw new Error("Clipboard permission denied") } },
      configurable: true,
    }), clipboard)
    const events: unknown[] = []
    await page.route("**/api/events", async (route) => {
      events.push(route.request().postDataJSON())
      await route.fulfill({ status: 204 })
    })
    await page.goto("/?demo=off")
    await page.getByRole("button", { name: "Copy the install command", exact: true }).first().click()
    await expect(page.getByRole("button", { name: "Copy failed. Retry copying the install command" }).first()).toBeVisible()
    const agents = page.locator('section[aria-labelledby="agents-title"]')
    await agents.getByRole("button", { name: "Copy for your coding agent" }).click()
    await expect(agents.getByRole("button", { name: "Copy failed. Try again." })).toBeVisible()
    await expect(page.getByRole("status").filter({ hasText: "Copied" })).toHaveCount(0)
    expect(events).toEqual([])
    await page.goto("/theme")
    await page.getByRole("button", { name: "Copy the code" }).click()
    await expect(page.locator("main").getByRole("alert")).toBeVisible()
    expect(events).toEqual([])
  })
}

test("theme copies keep settings out of the event and use distinct action names", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => {} }, configurable: true }))
  const events: unknown[] = []
  await page.route("**/api/events", async (route) => {
    events.push(route.request().postDataJSON())
    await route.fulfill({ status: 204 })
  })
  await page.goto("/theme?dialog=fade&pace=2")
  for (const name of ["Copy the code", "Share", "Copy install instructions", "Copy for coding agent"]) await page.getByRole("button", { name, exact: true }).click()
  await expect.poll(() => events).toEqual(["theme_copy", "theme_share", "install_copy", "agent_prompt_copy"].map((event) => ({ event, page: "/theme", component: "theme-builder" })))
})

test("the public collector rejects cross-site, oversized and malformed writes", async ({ request }, info) => {
  test.skip(info.project.name !== "chromium", "HTTP validation is independent of the browser")
  const body = { event: "install_copy", page: "/", component: "install-command" }
  const headers = { Origin: "http://localhost:4500" }
  expect((await request.get("/api/events")).status()).toBe(405)
  expect((await request.post("/api/events", { data: body })).status()).toBe(403)
  expect((await request.post("/api/events", { headers: { Origin: "https://elsewhere.example" }, data: body })).status()).toBe(403)
  expect((await request.post("/api/events", { headers, form: body })).status()).toBe(415)
  expect((await request.post("/api/events", { headers, data: { ...body, page: "/?private=1" } })).status()).toBe(400)
  expect((await request.post("/api/events", { headers, data: { ...body, contents: "x".repeat(600) } })).status()).toBe(413)
  // Accepted for best-effort collection; production persistence is verified independently in Neon.
  const response = await request.post("/api/events", { headers, data: body })
  expect(response.status()).toBe(204)
  expect(response.headers()["cache-control"]).toBe("no-store")
})
