export const TOGGLE_MOBILE_MENU_EVENT = "zakeem:toggle-mobile-menu";
export const OPEN_MOBILE_MENU_EVENT = "zakeem:open-mobile-menu";
export const CLOSE_MOBILE_MENU_EVENT = "zakeem:close-mobile-menu";
export const MOBILE_MENU_STATE_EVENT = "zakeem:mobile-menu-state";

export function toggleMobileMenu(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOGGLE_MOBILE_MENU_EVENT));
  }
}

export function openMobileMenu(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_MOBILE_MENU_EVENT));
  }
}

export function closeMobileMenu(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CLOSE_MOBILE_MENU_EVENT));
  }
}

export function notifyMobileMenuState(isOpen: boolean): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MOBILE_MENU_STATE_EVENT, { detail: { isOpen } }));
  }
}
