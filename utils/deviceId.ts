const DEVICE_ID_KEY = "ludowin_device_id";

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `lw-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
          .toString(36)
          .slice(2)}`;

  window.localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
