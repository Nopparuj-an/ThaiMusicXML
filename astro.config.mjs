// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://thaimusicxml.anan.ovh",
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
      head: [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://thaimusicxml.anan.ovh/ThaiMusicXMLOG.png",
          },
        },
        {
          tag: "meta",
          attrs: { property: "og:image:width", content: "1200" },
        },
        {
          tag: "meta",
          attrs: { property: "og:image:height", content: "630" },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content: "https://thaimusicxml.anan.ovh/ThaiMusicXMLOG.png",
          },
        },
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          content: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: "ThaiMusicXML",
            description:
              "An open digital notation standard for Thai Traditional Music.",
            url: "https://thaimusicxml.anan.ovh/en/",
            codeRepository: "https://github.com/Nopparuj-an/ThaiMusicXML",
            programmingLanguage: "XML",
            license:
              "https://github.com/Nopparuj-an/ThaiMusicXML/blob/main/LICENSE.txt",
          }),
        },
      ],
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
                  label: "Conformance",
                  translations: { th: "ความสอดคล้อง" },
                  slug: "v0_1/reference/conformance",
                },
                {
                  label: "Rendering",
                  translations: { th: "การแสดงผล" },
                  slug: "v0_1/reference/rendering",
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
    sitemap({
      filter: (page) => page !== "https://thaimusicxml.anan.ovh/",
    }),
  ],
});
