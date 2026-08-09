const REGISTRATION_DEVICE_KEY = "ludowin_registration_device_id_v2";
const APP_INSTALLATION_KEY = "ludowin_app_installation_id_v1";

const createOpaqueDeviceId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 18)}`;
  }
};

/**
 * A privacy-safe, persistent device token for welcome-bonus eligibility.
 *
 * It intentionally does NOT contain IP, Wi-Fi, user-agent, screen resolution,
 * IMEI, MAC address or Android ID. The old browser fingerprint caused unrelated
 * phones with the same model/settings to collide and lose their bonus.
 */
export const getRegistrationDeviceId = (): string => {
  if (typeof window === "undefined") return "";

  try {
    const existing = localStorage.getItem(REGISTRATION_DEVICE_KEY)?.trim();
    if (existing) return existing;

    // TWA telemetry stores its private installation UUID on this same origin.
    // Reusing it lets the APK and its web content share one registration token.
    const appInstallationId = localStorage
      .getItem(APP_INSTALLATION_KEY)
      ?.trim();
    const created = appInstallationId
      ? `app:${appInstallationId}`
      : `web:${createOpaqueDeviceId()}`;

    localStorage.setItem(REGISTRATION_DEVICE_KEY, created);
    return created;
  } catch {
    // Storage-blocked/private contexts still receive a per-page opaque value.
    // The API will never fall back to IP or Wi-Fi matching.
    return `temporary:${createOpaqueDeviceId()}`;
  }
};

/** @deprecated Use getRegistrationDeviceId. Kept for older imports. */
export const getDeviceFingerprint = getRegistrationDeviceId;
