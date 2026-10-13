// Per-page <head> additions that depend on which page is rendering.
// Registered as Starlight `routeMiddleware` in astro.config.mjs.

import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { versions } from "../versions.config.mjs";

const site = "https://thaimusicxml.anan.ovh";
const archiveSlugs = new Set(versions.map((v) => v.slug));

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const [locale, first] = route.id.split("/");

  // Archived versions are near-copies of the current docs. Keep them readable
  // but out of the index, so search engines rank the current page instead.
  if (archiveSlugs.has(first)) {
    route.head.push({
      tag: "meta",
      attrs: { name: "robots", content: "noindex, follow" },
    });
  }

  // Structured data describes the format as a whole, so it belongs on the
  // home pages only, not on every page of the docs.
  if (route.id === locale && (locale === "en" || locale === "th")) {
    route.head.push({
      tag: "script",
      attrs: { type: "application/ld+json" },
      content: JSON.stringify([
        {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          name: "ThaiMusicXML Specification",
          headline:
            "ThaiMusicXML: An open digital notation standard for Thai Traditional Music",
          description:
            "ThaiMusicXML is an open, royalty-free XML file format for Thai traditional music (เพลงไทยเดิม). It records notation in a form software can validate, search, print, and exchange without tying scores to any single editor.",
          url: `${site}/${locale}/`,
          inLanguage: locale,
          author: {
            "@type": "Person",
            name: "Nopparuj Ananvoranich",
            url: "https://anan.ovh/",
          },
          license:
            "https://github.com/Nopparuj-an/ThaiMusicXML/blob/main/LICENSE.txt",
          codeRepository: "https://github.com/Nopparuj-an/ThaiMusicXML",
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "ThaiMusicXML",
          url: `${site}/`,
          description:
            "Documentation site for ThaiMusicXML, an open digital notation standard for Thai Traditional Music.",
        },
      ]),
    });
  }
});
