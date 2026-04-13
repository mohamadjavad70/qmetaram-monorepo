const zoneId = process.env.CLOUDFLARE_ZONE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!zoneId || !apiToken) {
  console.log("Skipped Cloudflare cache purge because CLOUDFLARE_ZONE_ID or CLOUDFLARE_API_TOKEN is not set.");
  process.exit(0);
}

const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ purge_everything: true }),
});

const payload = await response.json();

if (!response.ok || !payload.success) {
  console.error("Cloudflare cache purge failed.");
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

console.log("Cloudflare cache purge completed.");