import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const publicDir = resolve(process.cwd(), "public");
const sitemapPath = resolve(publicDir, "sitemap.xml");
const distDir = resolve(process.cwd(), "dist");
const distSitemapPath = resolve(distDir, "sitemap.xml");
const today = new Date().toISOString().slice(0, 10);

const urls = [
  ["/", "daily", "1.00"],
  ["/about", "monthly", "0.89"],
  ["/vision", "monthly", "0.88"],
  ["/team", "monthly", "0.84"],
  ["/nodes", "weekly", "0.86"],
  ["/q-agent", "weekly", "0.87"],
  ["/chat", "daily", "0.95"],
  ["/core", "daily", "0.92"],
  ["/q1", "weekly", "0.90"],
  ["/q-network", "weekly", "0.88"],
  ["/matrix", "weekly", "0.86"],
  ["/marketplace", "weekly", "0.85"],
  ["/compare", "weekly", "0.84"],
  ["/ai-tools", "weekly", "0.82"],
  ["/ideas", "weekly", "0.80"],
  ["/subscriptions", "monthly", "0.78"],
  ["/pricing", "monthly", "0.77"],
  ["/samer", "weekly", "0.76"],
  ["/biruni", "monthly", "0.74"],
  ["/beethoven", "monthly", "0.74"],
  ["/davinci", "monthly", "0.74"],
  ["/modules/matrix", "monthly", "0.70"],
  ["/modules/tesla", "monthly", "0.69"],
  ["/modules/biruni", "monthly", "0.69"],
  ["/modules/quantum-pulse", "monthly", "0.69"],
  ["/modules/da-vinci", "monthly", "0.69"],
  ["/modules/beethoven", "monthly", "0.69"],
  ["/modules/mowlana", "monthly", "0.68"],
  ["/modules/qmetaram", "monthly", "0.68"],
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ([path, changefreq, priority]) => `  <url>
    <loc>https://qmetaram.com${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

await mkdir(dirname(sitemapPath), { recursive: true });
await writeFile(sitemapPath, xml, "utf8");
console.log(`Updated sitemap at ${sitemapPath}`);

await mkdir(dirname(distSitemapPath), { recursive: true });
await writeFile(distSitemapPath, xml, "utf8");
console.log(`Updated sitemap at ${distSitemapPath}`);