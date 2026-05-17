// utils/helpers.ts  — SSR safe

import { ROOM_RANGE } from "./constants";

// Query helpers — module scope এ document ছোঁবেন না
export const $ = (selector: string, root?: Document | HTMLElement) => {
  if (typeof document === "undefined") return null;
  const base = (root ?? document) as Document | HTMLElement;
  return base.querySelector(selector);
};

export const $$ = (selector: string, root?: Document | HTMLElement) => {
  if (typeof document === "undefined") return [] as Element[];
  const base = (root ?? document) as Document | HTMLElement;
  return Array.from(base.querySelectorAll(selector));
};

// User-agent check
export const isMobile = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Debounce (SSR safe)
export const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) => {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

// Random
export const randomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Clipboard
export const copyToClipboard = async (text = "") => {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Delay
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// JSON validate
export const isValidJson = (json: string): boolean => {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
};

// Number guard
export const isNumber = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value);

// GUID
export const guid = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4()}-${s4()}-${s4()}-${s4()}-${s4()}`;
};

// Strip HTML tags
export const sanizateTags = (input: string) =>
  input ? input.replace(/<\/?[^>]+(>|$)/g, "") : "";

export const isAValidRoom = (value: string, roomRange = ROOM_RANGE) => {
  const numRegex = /^[1-9]\d*$/;
  return numRegex.test(value) && value.length <= roomRange;
};

export const validateLastValueRoomName = (value: string) => {
  let isValid = false;
  let lastValue = value.at(-1);
  let numPlayers = 0;

  if (lastValue) {
    numPlayers = +lastValue;
    isValid = [2, 4].includes(+lastValue);
  }

  return { isValid, numPlayers };
};

export const isDev = () => process.env.NODE_ENV === "development";
