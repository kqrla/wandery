// generates public/sitemap.xml before dev and build.
// kept simple on purpose: only public, indexable routes are listed here.
// dynamic per-maker pages (/m/:alias) are intentionally omitted until
// approved makers are queried from the backend at build time.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { CITIES } from "../src/data/cities";

const BASE_URL = "https://fabnet.annecrypted.com";

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Entry {
  path: string;
  changefreq?: "weekly" | "monthly" | "daily";
  priority?: string;
}

const entries: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/landing", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/features", changefreq: "monthly", priority: "0.7" },
  ...CITIES.map(c => ({
    path: `/${slug(c.name)}`,
    changefreq: "weekly" as const,
    priority: "0.9",
  })),
  { path: "/localnetwork", changefreq: "weekly", priority: "0.9" },
  { path: "/localnetwork/join", changefreq: "monthly", priority: "0.6" },
  { path: "/localnetwork/request", changefreq: "monthly", priority: "0.6" },
  { path: "/localnetwork/auth", changefreq: "monthly", priority: "0.4" },
];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map(e => [
    `  <url>`,
    `    <loc>${BASE_URL}${e.path}</loc>`,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    `  </url>`,
  ].filter(Boolean).join("\n")),
  `</urlset>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${entries.length} entries)`);