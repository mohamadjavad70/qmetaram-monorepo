/**
 * Q Network Project Report (گزارش جامع پروژه Q Network)
 * Processed in 9→6→3→1 format.
 */

export interface ModuleReport {
  slug: string;
  nameFa: string;
  readiness: "high" | "medium" | "low";
  keyFiles: string[];
  statusFa: string;
  gapsFa: string[];
}

export interface ExecutionStep {
  titleFa: string;
  command: string;
  notes: string;
}

export interface ProjectRisk {
  level: "high" | "medium" | "low";
  titleFa: string;
  descriptionFa: string;
  mitigationFa: string;
}

export const MODULE_REPORTS: ModuleReport[] = [
  {
    slug: "council-engine",
    nameFa: "موتور شورای نور",
    readiness: "high",
    keyFiles: ["src/lib/councilEngine.ts"],
    statusFa: "فعال و قابل استفاده",
    gapsFa: ["نیاز به تست پوششی بیشتر برای سناریوهای ریسک بالا"],
  },
  {
    slug: "guardian-core",
    nameFa: "هسته Guardian",
    readiness: "medium",
    keyFiles: ["../../src/core/guardian/policy-engine.ts", "../../src/core/guardian/markov-quarantine.ts"],
    statusFa: "اسکلت اصلی آماده",
    gapsFa: ["اتصال به telemetry واقعی", "تست chaos در محیط staging"],
  },
  {
    slug: "pqc-transport",
    nameFa: "حمل‌ونقل PQC",
    readiness: "medium",
    keyFiles: ["../../src/core/pqc_transport/edge-envelope.ts"],
    statusFa: "قرارداد داده آماده",
    gapsFa: ["اتصال به provider واقعی ML-KEM/Kyber"],
  },
  {
    slug: "wasm-runtime",
    nameFa: "اجرای WASM لبه",
    readiness: "medium",
    keyFiles: ["../../src/core/wasm_runtime/runtime-contract.ts"],
    statusFa: "قرارداد sandbox تعریف شده",
    gapsFa: ["پیاده‌سازی محدودیت CPU/Memory در runtime واقعی"],
  },
  {
    slug: "light-nodes",
    nameFa: "نودهای نور",
    readiness: "high",
    keyFiles: ["../../scripts/qnet-light-node.ps1", "../../scripts/qnet-light-node.sh"],
    statusFa: "۲۳ نود HTML تولید شده",
    gapsFa: ["نیاز به deploy و DNS automation"],
  },
  {
    slug: "ollama-local",
    nameFa: "مدل محلی Ollama",
    readiness: "medium",
    keyFiles: ["../../scripts/ollama-q-chat.ps1", "../../docs/ai/ollama-q-model.md"],
    statusFa: "API محلی آماده",
    gapsFa: ["مدل mshznet77/Q هنوز pull نشده روی این ماشین"],
  },
  {
    slug: "monorepo",
    nameFa: "هسته Monorepo",
    readiness: "high",
    keyFiles: ["../../package.json", "../../pnpm-workspace.yaml", "../../turbo.json"],
    statusFa: "یکپارچه‌سازی اولیه کامل",
    gapsFa: ["رفع کامل build اپ سوم و CI pipeline"],
  },
  {
    slug: "security-purge",
    nameFa: "پاکسازی امنیتی",
    readiness: "medium",
    keyFiles: ["../../../../Q_LIBRARY/scripts/security_purge_filter_repo.ps1"],
    statusFa: "اسکریپت آماده",
    gapsFa: ["rotate کلیدها و rewrite history هنوز کامل اجرا نشده"],
  },
  {
    slug: "delivery-governance",
    nameFa: "حاکمیت تحویل",
    readiness: "low",
    keyFiles: [],
    statusFa: "نیازمند اجرا",
    gapsFa: ["۴ PR باز باید merge/close شوند", "SLA درفت ۴۸ ساعته هنوز enforce نشده"],
  },
];

export const EXECUTION_GUIDE: ExecutionStep[] = [
  {
    titleFa: "نصب وابستگی‌ها",
    command: "pnpm install",
    notes: "از ریشه monorepo اجرا شود.",
  },
  {
    titleFa: "تنظیم env",
    command: "cp .env.example .env",
    notes: "متغیرهای ضروری: VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY",
  },
  {
    titleFa: "تولید نودهای نور",
    command: "./scripts/qnet-light-node.ps1",
    notes: "خروجی در generated/qnet-nodes",
  },
  {
    titleFa: "اجرای Build",
    command: "pnpm build",
    notes: "وضعیت packageها را بررسی کنید.",
  },
  {
    titleFa: "تست مدل محلی",
    command: "ollama pull mshznet77/Q ; ./scripts/ollama-q-chat.ps1",
    notes: "در صورت خالی بودن tags، pull الزامی است.",
  },
  {
    titleFa: "پاکسازی امنیتی",
    command: "../Q_LIBRARY/scripts/security_purge_filter_repo.ps1 -Execute",
    notes: "فقط بعد از rotate کلیدها",
  },
  {
    titleFa: "نهایی‌سازی PRها",
    command: "GitHub: merge/close open draft PRs",
    notes: "طبق پروتکل Zero-Draft",
  },
];

export const PROJECT_RISKS: ProjectRisk[] = [
  {
    level: "high",
    titleFa: "نشت کلیدها در تاریخچه",
    descriptionFa: "وجود env در برخی مخازن سابقه داشته است.",
    mitigationFa: "rotate کلیدها + rewrite history + secret scanning",
  },
  {
    level: "high",
    titleFa: "توقف تحویل به‌علت PR درفت",
    descriptionFa: "PRهای باز بدون تکلیف باعث انباشت ریسک می‌شوند.",
    mitigationFa: "SLA 48 ساعته merge/close",
  },
  {
    level: "medium",
    titleFa: "عدم یکنواختی build در همه اپ‌ها",
    descriptionFa: "بعضی اپ‌ها ورودی یا ساختار ناقص دارند.",
    mitigationFa: "fix entrypoint + CI gating",
  },
  {
    level: "medium",
    titleFa: "اتکای زیاد به محیط محلی",
    descriptionFa: "همه قابلیت‌ها هنوز در cloud parity کامل نیستند.",
    mitigationFa: "pipeline استاندارد و sync policy",
  },
  {
    level: "low",
    titleFa: "chunk size بالا در Vite",
    descriptionFa: "بعضی bundleها بزرگ هستند.",
    mitigationFa: "code splitting و manualChunks",
  },
];

export const PRIORITIZED_RECOMMENDATIONS: string[] = [
  "۱) rotate فوری کلیدها و پاکسازی history",
  "۲) enforce پروتکل Zero-Draft روی PRها",
  "۳) سبز کردن کامل build monorepo",
  "۴) CI پایه lint/test/build",
  "۵) deploy نودهای نور + DNS",
  "۶) pull مدل mshznet77/Q و اتصال API",
  "۷) تکمیل telemetry برای Guardian",
  "۸) برنامه ۹۰ روزه MVP به production",
];
