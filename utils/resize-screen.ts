// utils/resize-screen.ts
import { BASE_HEIGHT, BASE_WIDTH } from "./constants";
import { debounce } from "./helpers";

const getViewport = () => {
  if (typeof window === "undefined") {
    return { w: BASE_WIDTH, h: BASE_HEIGHT };
  }

  const vv = (window as any).visualViewport;
  return vv
    ? { w: vv.width, h: vv.height }
    : { w: window.innerWidth, h: window.innerHeight };
};

export const resetScreenStyles = (el?: HTMLElement | null) => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const root =
    el ??
    (document.querySelector(".screen") as HTMLElement | null) ??
    (document.getElementById("root") as HTMLElement | null);

  if (root) {
    root.style.width = "";
    root.style.height = "";
    root.style.position = "";
    root.style.left = "";
    root.style.top = "";
    root.style.transform = "";
    root.style.transformOrigin = "";
    root.style.willChange = "";
    root.style.overflow = "";
  }

  document.documentElement.style.width = "";
  document.documentElement.style.height = "";
  document.body.style.width = "";
  document.body.style.height = "";
  document.body.style.margin = "";
  document.body.style.padding = "";
  document.body.style.overflowX = "hidden";
  document.body.style.overflowY = "auto";
  document.body.style.zoom = "";
};

const resizeScreen = debounce((el?: HTMLElement | null) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const root =
    el ??
    (document.querySelector(".screen") as HTMLElement | null) ??
    (document.getElementById("root") as HTMLElement | null);

  if (!root) return;

  const { w, h } = getViewport();

  const scale = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT);

  root.style.width = `${BASE_WIDTH}px`;
  root.style.height = `${BASE_HEIGHT}px`;
  root.style.position = "absolute";
  root.style.left = "50%";
  root.style.top = "50%";
  root.style.transform = `translate(-50%, -50%) scale(${scale})`;
  root.style.transformOrigin = "center center";
  root.style.willChange = "transform";
  root.style.overflow = "hidden";

  document.documentElement.style.width = "100%";
  document.documentElement.style.height = "100%";

  document.body.style.width = "100%";
  document.body.style.height = "100%";
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";
  document.body.style.zoom = "100%";
}, 100);

export default resizeScreen;
