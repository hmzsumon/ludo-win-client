/* ────────── auth token storage key ────────── */
export const ACCESS_TOKEN_KEY = "accessToken";

/* ────────── save access token ────────── */
export const saveAccessToken = (token?: string | null) => {
  if (typeof window === "undefined") return;

  if (!token) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/* ────────── get access token ────────── */
export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/* ────────── remove access token ────────── */
export const removeAccessToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};
