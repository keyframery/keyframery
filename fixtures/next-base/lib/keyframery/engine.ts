export function start(): () => void {
  return () => {}
}
export function applyMenus(_menus: Menus): void {}
export function setEnabled(on: boolean): void {
  if (on) document.documentElement.setAttribute("data-kf", "")
  else document.documentElement.removeAttribute("data-kf")
}
export function setPace(_pace: number | undefined): void {}
export type DialogCut = "rack-focus" | "punch-in" | "fade" | "none"
export type SheetCut = "slide-sink" | "slide" | "fade" | "none"
export type DrawerCut = "slide-sink" | "none"
export type TabsCut = "j-cut" | "whip" | "fade" | "none"
export type ToastCut = "cut-on-action" | "none"
export type Menus = { dialog?: DialogCut; sheet?: SheetCut; drawer?: DrawerCut; tabs?: TabsCut; toast?: ToastCut }
