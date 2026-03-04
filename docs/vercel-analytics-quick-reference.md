# Vercel Web Analytics Quick Reference

Quick reference guide for implementing Vercel Web Analytics in your project.

## Installation

```bash
# Choose your package manager
pnpm i @vercel/analytics
yarn add @vercel/analytics
npm install @vercel/analytics
bun add @vercel/analytics
```

## Quick Implementation by Framework

### Next.js Pages Directory
```tsx
// pages/_app.tsx
import { Analytics } from "@vercel/analytics/next";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Next.js App Directory
```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Remix
```tsx
// app/root.tsx
import { Analytics } from "@vercel/analytics/remix";

export default function App() {
  return (
    <html lang="en">
      <body>
        <Analytics />
        <Outlet />
      </body>
    </html>
  );
}
```

### SvelteKit
```ts
// src/routes/+layout.ts
import { dev } from "$app/environment";
import { injectAnalytics } from "@vercel/analytics/sveltekit";

injectAnalytics({ mode: dev ? "development" : "production" });
```

### React/CRA
```tsx
// App.tsx
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <div>
      {/* your content */}
      <Analytics />
    </div>
  );
}
```

### Vue
```vue
<!-- App.vue -->
<script setup>
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <Analytics />
  <!-- your content -->
</template>
```

### Nuxt
```vue
<!-- app.vue -->
<script setup>
import { Analytics } from '@vercel/analytics/nuxt';
</script>

<template>
  <Analytics />
  <NuxtPage />
</template>
```

### Astro
```astro
<!-- src/layouts/Base.astro -->
---
import Analytics from '@vercel/analytics/astro';
---

<html lang="en">
  <head>
    <Analytics />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Plain HTML
```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### Other Frameworks
```ts
// main.ts
import { inject } from "@vercel/analytics";

inject();
```

## Enable on Vercel Dashboard

1. Go to your Vercel project dashboard
2. Click the **Analytics** tab
3. Click **Enable**
4. Deploy your app

## Verification

After deployment, check your browser's Network tab for a request to `/_vercel/insights/view`.

## More Information

For detailed instructions and additional configuration options, see the [full guide](./vercel-web-analytics-guide.md).
