import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const reportPath = resolve(process.cwd(), 'qnet-status.txt');
const alertLogPath = resolve(process.cwd(), process.env.QNET_ALERT_LOG || 'qnet-alert.log');
const expectedHttp = process.env.QNET_EXPECT_HTTP || '200';
const expectedTunnel = process.env.QNET_EXPECT_TUNNEL || 'running';
const webhookUrl = process.env.QNET_ALERT_WEBHOOK_URL;

if (!existsSync(reportPath)) {
  console.error('qnet-status.txt not found. Run `npm run qnet:smart-deploy` first.');
  process.exit(1);
}

const status = Object.fromEntries(
  readFileSync(reportPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf('=');
      return separatorIndex === -1
        ? [line, '']
        : [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
    }),
);

const alerts = [];

if ((status.http_status || '') !== expectedHttp) {
  alerts.push(`http_status expected ${expectedHttp} but got ${status.http_status || 'unknown'}`);
}

if ((status.tunnel_status || '') !== expectedTunnel) {
  alerts.push(`tunnel_status expected ${expectedTunnel} but got ${status.tunnel_status || 'unknown'}`);
}

const timestamp = new Date().toISOString();

if (alerts.length === 0) {
  console.log(`QNET OK ${timestamp} http_status=${status.http_status} tunnel_status=${status.tunnel_status}`);
  process.exit(0);
}

const payload = {
  timestamp,
  local_url: status.local_url || null,
  http_status: status.http_status || null,
  tunnel_status: status.tunnel_status || null,
  alerts,
};

const message = `[${timestamp}] ${alerts.join(' | ')}`;
appendFileSync(alertLogPath, `${message}\n`, 'utf8');
console.error(message);

if (webhookUrl) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Webhook alert failed with status ${response.status}`);
    }
  } catch (error) {
    console.error(`Webhook alert failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

process.exit(1);
