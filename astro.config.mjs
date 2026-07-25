// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://thaimusicxml.anan.ovh",
  redirects: {
    "/": "/en/",
  },
  integrations: [
    starlight({
      title: "ThaiMusicXML",
      favicon: "/favicon.ico",
      logo: {
        dark: "./src/assets/logo-dark.svg",
        light: "./src/assets/logo-light.svg",
        replacesTitle: true,
      },
      customCss: ["./src/styles/custom.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Nopparuj-an/ThaiMusicXML",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/Nopparuj-an/ThaiMusicXML/edit/main/",
      },
      components: {
        Sidebar: "./src/components/Sidebar.astro",
        Pagination: "./src/components/Pagination.astro",
      },
      defaultLocale: "en",
      locales: {
        en: {
          label: "English",
        },
        th: {
          label: "ไทย",
          lang: "th",
        },
      },
      lastUpdated: true,
      sidebar: [
        { label: "Home", slug: "index" },
        { label: "About", slug: "about" },
        {
          label: "Versions",
          items: [{ label: "v0.1", slug: "v0_1" }],
        },
        {
          label: "v0.1",
          items: [
            { label: "Introduction", slug: "v0_1" },
            {
              label: "Tutorial",
              items: [{ autogenerate: { directory: "v0_1/tutorial" } }],
            },
            {
              label: "Reference",
              items: [
                {
                  label: "Elements",
                  items: [
                    { autogenerate: { directory: "v0_1/reference/elements" } },
                  ],
                },
                {
                  label: "Examples",
                  items: [
                    { autogenerate: { directory: "v0_1/reference/examples" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    sitemap(),
  ],
});
