export type MarketingAttribution = {
  visitorId?: string;
  sessionId?: string;
  source?: string;
  medium?: string;
  fbclid?: string;
  campaignId?: string;
  campaignName?: string;
  adSetId?: string;
  adSetName?: string;
  adId?: string;
  adName?: string;
  placement?: string;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "ludowin_marketing_attribution";

const QUERY_MAPPING: Record<keyof MarketingAttribution, string[]> = {
  visitorId: ["lw_visitor_id"],
  sessionId: ["lw_session_id"],
  source: ["utm_source", "site_source_name"],
  medium: ["utm_medium"],
  fbclid: ["fbclid"],
  campaignId: ["utm_campaign_id", "campaign_id"],
  campaignName: ["utm_campaign"],
  adSetId: ["utm_adset_id", "adset_id"],
  adSetName: ["utm_adset"],
  adId: ["utm_ad_id", "ad_id"],
  adName: ["utm_ad"],
  placement: ["placement"],
};

const clean = (value: string | null) =>
  value?.trim().slice(0, 500) || undefined;

const readStoredAttribution = (): MarketingAttribution => {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "{}",
    ) as MarketingAttribution;
  } catch {
    return {};
  }
};

export const captureMarketingAttribution = (): MarketingAttribution => {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const incoming: MarketingAttribution = {};

  (
    Object.entries(QUERY_MAPPING) as Array<
      [keyof MarketingAttribution, string[]]
    >
  ).forEach(([field, queryKeys]) => {
    for (const key of queryKeys) {
      const value = clean(params.get(key));
      if (value) {
        incoming[field] = value;
        break;
      }
    }
  });

  const stored = readStoredAttribution();
  const merged = { ...stored, ...incoming };

  if (Object.keys(merged).length > 0) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  return merged;
};

export const getMarketingAttribution = (): MarketingAttribution | undefined => {
  const attribution = captureMarketingAttribution();
  return Object.keys(attribution).length > 0 ? attribution : undefined;
};

export const trackMetaEvent = (
  eventName: "Lead" | "CompleteRegistration",
  parameters: Record<string, string | number | boolean> = {},
) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", eventName, parameters);
  }
};

export const trackMetaCustomEvent = (
  eventName: string,
  parameters: Record<string, string | number | boolean> = {},
) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, parameters);
  }
};
