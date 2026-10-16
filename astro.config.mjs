// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    output: "server",
    // The site renders no session state and serves images as plain <img> tags,
    // so opt out of the adapter's default KV session driver and Cloudflare
    // Images binding to keep the deployed Worker's binding surface unchanged.
    session: false,
    adapter: cloudflare({ imageService: "passthrough" }),
    vite: {
        plugins: [tailwindcss()],
    },
});
