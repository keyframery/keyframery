import { expect, test } from "./kit"

test("search loads on first use, keeps the query and returns focus to its trigger", async ({ page, errors }, info) => {
  const sources: Promise<string>[] = []
  page.on("response", (response) => {
    if (response.request().resourceType() === "script" && response.url().includes("/_next/")) {
      sources.push(response.text().catch(() => ""))
    }
  })

  await page.goto("/docs")
  await page.waitForLoadState("networkidle")
  const searchLoaded = async () => (await Promise.all(sources)).some((source) => source.includes("Nothing matches that."))
  expect(await searchLoaded()).toBe(false)

  const phone = info.project.name === "phone"
  const trigger = page.locator(phone ? "[data-search]" : "[data-search-full]").filter({ visible: true }).first()
  if (phone) await trigger.tap()
  else await trigger.click()

  const dialog = page.getByRole("dialog", { name: "Search the docs" })
  const input = dialog.getByRole("combobox")
  await expect(dialog).toBeVisible()
  await expect.poll(searchLoaded).toBe(true)
  if (!phone) await expect(input).toBeFocused()
  await input.fill("ListCut")
  await expect(dialog.getByRole("option").first()).toContainText("ListCut")
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  if (phone) await trigger.tap()
  else await trigger.click()
  await expect(input).toHaveValue("ListCut")
  if (phone) await dialog.getByRole("option").first().tap()
  else await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/\/docs\/helpers\/list-cut/)
  expect(errors).toEqual([])
})

test("both Command K and Control K open the deferred search", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "keyboard shortcuts")
  await page.goto("/")
  const dialog = page.getByRole("dialog", { name: "Search the docs" })
  for (const shortcut of ["Meta+k", "Control+k"]) {
    await page.keyboard.press(shortcut)
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole("combobox")).toBeFocused()
    // cmdk uses Ctrl+K for result navigation while the input is focused.
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
  }
})
