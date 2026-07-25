// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "ThaiMusicXML",
      customCss: ["./src/styles/custom.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Nopparuj-an/ThaiMusicXML",
        },
      ],
      components: {
        Sidebar: "./src/components/Sidebar.astro",
        Pagination: "./src/components/Pagination.astro",
      },
      sidebar: [
        { label: "Home", slug: "index" },
        {
          label: "Versions",
          items: [{ label: "v0.1", slug: "v0_1" }],
        },
        {
          label: "v0.1",
          items: [
            { label: "Getting Started", slug: "v0_1" },
            {
              label: "Tutorial",
              items: [{ autogenerate: { directory: "v0_1/tutorial" } }],
            },
            {
              label: "Reference",
              items: [{ autogenerate: { directory: "v0_1/reference" } }],
            },
            {
              label: "Examples",
              items: [{ autogenerate: { directory: "v0_1/examples" } }],
            },
          ],
        },
        { label: "About", slug: "about" },
      ],
    }),
  ],
});
