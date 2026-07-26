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
        { label: "Home", translations: { th: "หน้าหลัก" }, slug: "index" },
        { label: "About", translations: { th: "เกี่ยวกับ" }, slug: "about" },
        {
          label: "Versions",
          translations: { th: "เวอร์ชัน" },
          items: [{ label: "v0.1", slug: "v0_1" }],
        },
        {
          label: "v0.1",
          items: [
            {
              label: "Introduction",
              translations: { th: "บทนำ" },
              slug: "v0_1",
            },
            {
              label: "Tutorial",
              translations: { th: "บทช่วยสอน" },
              items: [{ autogenerate: { directory: "v0_1/tutorial" } }],
            },
            {
              label: "Reference",
              translations: { th: "ข้อมูลอ้างอิง" },
              items: [
                {
                  label: "Elements",
                  translations: { th: "องค์ประกอบ" },
                  items: [
                    { autogenerate: { directory: "v0_1/reference/elements" } },
                  ],
                },
                {
                  label: "Examples",
                  translations: { th: "ตัวอย่าง" },
                  items: [
                    { autogenerate: { directory: "v0_1/reference/examples" } },
                  ],
                },
              ],
            },
            {
              label: "Updates",
              translations: { th: "การอัปเดต" },
              items: [
                {
                  label: "Breaking Changes",
                  translations: { th: "การเปลี่ยนแปลงสำคัญ" },
                  slug: "v0_1/updates/breaking-changes",
                },
                {
                  label: "Roadmap",
                  translations: { th: "แผนงาน" },
                  items: [
                    { autogenerate: { directory: "v0_1/updates/roadmap" } },
                  ],
                },
                {
                  label: "Erratum",
                  translations: { th: "ข้อผิดพลาด" },
                  items: [
                    { autogenerate: { directory: "v0_1/updates/erratum" } },
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
