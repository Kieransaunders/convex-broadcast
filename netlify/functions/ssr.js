import server from "../../dist/server/server.js";

export default async (request, context) => {
  return server.fetch(request, context);
};

export const config = {
  path: "/*",
  excludedPath: [
    "/assets/**",
    "/favicon.ico",
    "/manifest.json",
    "/sw.js",
    "/robots.txt",
    "/icon-*.png",
    "/apple-touch-icon.png",
    "/favicon-*.png",
    "/android-chrome-*.png",
  ],
};
