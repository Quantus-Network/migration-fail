// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

/** @param {import('http').IncomingMessage} req */
function isTrackerApiRequest(req) {
  const url = req.url ?? "";
  return url === "/api/tracker" || url.startsWith("/api/tracker?");
}

/** @param {import('http').IncomingMessage} req */
function isOgApiRequest(req) {
  const url = req.url ?? "";
  return url === "/api/og" || url.startsWith("/api/og?");
}

export default defineConfig({
  site: process.env.SITE_URL,
  integrations: [tailwind(), react(), sitemap()],
  vite: {
    plugins: [
      {
        name: "tracker-api-dev",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!isTrackerApiRequest(req) && !isOgApiRequest(req)) {
              return next();
            }

            try {
              if (isTrackerApiRequest(req)) {
                const { fetchTrackerPayload } = await server.ssrLoadModule(
                  "/src/lib/fetch-tracker-payload.ts",
                );
                const apiKey = process.env.COINGECKO_API_KEY;
                const data = await fetchTrackerPayload(apiKey);

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
                return;
              }

              const { generateOgImageResponse } = await server.ssrLoadModule(
                "/src/lib/generate-og-response.ts",
              );
              const protocol = req.headers["x-forwarded-proto"] ?? "http";
              const host = req.headers.host ?? "localhost:4321";
              const requestUrl = `${protocol}://${host}${req.url}`;
              const apiKey = process.env.COINGECKO_API_KEY;
              const imageResponse = await generateOgImageResponse(
                requestUrl,
                apiKey,
              );
              const buffer = Buffer.from(await imageResponse.arrayBuffer());

              res.statusCode = imageResponse.status;
              res.setHeader("Content-Type", "image/png");
              res.end(buffer);
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Request failed";
              res.statusCode = 500;
              if (isOgApiRequest(req)) {
                res.setHeader("Content-Type", "text/plain");
                res.end(message);
              } else {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: message }));
              }
            }
          });
        },
      },
    ],
  },
});