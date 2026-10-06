export function start(): () => void {
  return () => {}
}
export function applyMenus(_menus: Record<string, string | undefined>): void {}
export function setEnabled(on: boolean): void {
  if (on) document.documentElement.setAttribute("data-kf", "")
  else document.documentElement.removeAttribute("data-kf")
}
export function setPace(_pace: number | undefined): void {}
export type Menus = Record<string, string | undefined>
