// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import starlightVersions from "starlight-versions";
import { lastmodForUrl } from "./scripts/doc-lastmod.mjs";
import { versions } from "./versions.config.mjs";
import { versionRedirects } from "./scripts/version-redirects.mjs";

const site = "https://thaimusicxml.anan.ovh";

// https://astro.build/config
export default defineConfig({
  site,
  redirects: {
    // The same redirect for every visitor and crawler. /en/ links to /th/.
    "/": "/en/",
    // Keeps the version selector from landing on a 404: a page missing from a
    // version redirects to that version's introduction. Also catches retired
    // URL segments.
    ...versionRedirects(),
  },
  integrations: [
    starlight({
      plugins: [
        // The list of archived versions lives in versions.config.mjs.
        starlightVersions({ versions }),
      ],
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
      ],
      // Archive noindex and home-page structured data.
      routeMiddleware: "./src/routeData.ts",
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
        {
          label: "Playground",
          translations: { th: "สนามทดลอง" },
          link: "/playground/",
        },
        { label: "About", translations: { th: "เกี่ยวกับ" }, slug: "about" },
        {
          label: "Introduction",
          translations: { th: "บทนำ" },
          slug: "introduction",
        },
        {
          label: "Tutorial",
          translations: { th: "บทช่วยสอน" },
          items: [{ autogenerate: { directory: "tutorial" } }],
        },
        {
          label: "Reference",
          translations: { th: "ข้อมูลอ้างอิง" },
          items: [
            {
              label: "Conformance",
              translations: { th: "ความสอดคล้อง" },
              slug: "reference/conformance",
            },
            {
              label: "Rendering",
              translations: { th: "การแสดงผล" },
              slug: "reference/rendering",
            },
            {
              label: "Schema and test suite",
              translations: { th: "Schema และชุดทดสอบ" },
              slug: "reference/schema",
            },
            {
              label: "Conversion",
              translations: { th: "การแปลงไฟล์" },
              slug: "reference/conversion",
            },
            {
              label: "Elements",
              translations: { th: "องค์ประกอบ" },
              items: [
                { autogenerate: { directory: "reference/elements" } },
              ],
            },
            {
              label: "Examples",
              translations: { th: "ตัวอย่าง" },
              items: [
                { autogenerate: { directory: "reference/examples" } },
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
              slug: "updates/breaking-changes",
            },
            {
              label: "Roadmap",
              translations: { th: "แผนงาน" },
              items: [
                { autogenerate: { directory: "updates/roadmap" } },
              ],
            },
            {
              label: "Erratum",
              translations: { th: "ข้อผิดพลาด" },
              items: [
                { autogenerate: { directory: "updates/erratum" } },
              ],
            },
          ],
        },
      ],
    }),
    sitemap({
      // The root redirects to /en/, and archived versions are noindex.
      filter: (page) => {
        // https://site/en/v1_0/... -> "v1_0"
        const segment = page.replace(site, "").split("/")[2];
        return page !== `${site}/` && !versions.some((v) => v.slug === segment);
      },
      // Emits xhtml:link alternates so each URL declares its translation.
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", th: "th" },
      },
      serialize: (item) => {
        const lastmod = lastmodForUrl(item.url, site);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
});
