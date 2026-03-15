// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-02-12",
  devtools: { enabled: true },

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  modules: ["nitro-cloudflare-dev", "@nuxt/ui", "@nuxt/fonts", "@nuxt/image"],
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "Cadmus",
      titleTemplate: "%s - Product Design Studio",
      meta: [
        {
          name: "description",
          content:
            "A small design studio crafting thoughtful, polished visuals for web and software products, helping ideas become clear, functional, and beautifully executed.",
        },
      ],
    },
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
  },
});
