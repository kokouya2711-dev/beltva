export function haptic(duration = 30) {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      return navigator.vibrate(duration) !== false;
    }
  } catch {}
  return false;
}