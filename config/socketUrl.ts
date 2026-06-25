// config/socketUrl.ts
let socketUrl = "";

if (process.env.NODE_ENV === "development") {
  socketUrl = "http://localhost:8000"; // local socket server
} else {
  socketUrl = "https://api.76.13.220.245.nip.io"; // deployed socket server
}

export default socketUrl;
