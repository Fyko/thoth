import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import astroI18next from "astro-i18next";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), astroI18next()],
  output: "hybrid",
  adapter: cloudflare(),
});
