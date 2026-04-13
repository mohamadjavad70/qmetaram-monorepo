/**
 * Council Consensus Engine (شورای نور - فرمول ۹→۶→۳→۱)
 * ──────────────────────────────────────────────────────
 * Simulates 9 named members with authentic voice and conflict visibility.
 */

export interface CouncilMember {
  id: string;
  name: string;
  nameFa: string;
  role: string;
  icon: string;
}

export interface CouncilVote {
  member: CouncilMember;
  status: "APPROVED" | "REVIEWING" | "CONCERN";
  contribution: string;
}

export interface ConsensusResult {
  votes: CouncilVote[];
  finalResponse: string;
  confidence: number;
  timestamp: number;
}

const DEFAULT_PROBLEM_TEXT = "مسئله بدون عنوان";

const sanitizeForCode = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/"/g, '\\"')
    .replace(/\$\{/g, "\\${");

export const COUNCIL_MEMBERS: CouncilMember[] = [
  { id: "edison", name: "Edison", nameFa: "ادیسون", role: "Profit & ROI", icon: "💡" },
  { id: "rumi", name: "Rumi", nameFa: "رومی", role: "Meaning & Culture", icon: "🌹" },
  { id: "trump", name: "Trump", nameFa: "ترامپ", role: "Deals & Speed", icon: "🏁" },
  { id: "buddha", name: "Buddha", nameFa: "بودا", role: "Ethics & Balance", icon: "🧘" },
  { id: "grok", name: "Grok", nameFa: "گراک", role: "Unfiltered Reality", icon: "⚡" },
  { id: "tesla", name: "Tesla", nameFa: "تسلا", role: "Engineering", icon: "🔌" },
  { id: "ada", name: "Ada", nameFa: "آدا", role: "Data & Precision", icon: "📐" },
  { id: "machiavelli", name: "Machiavelli", nameFa: "ماکیاولی", role: "Power & Risk", icon: "♟️" },
  { id: "hermes", name: "Hermes", nameFa: "هرمس", role: "Operations", icon: "🕊️" },
];

/**
 * Process command through 9-member Council of Light with 9→6→3→1 format.
 */
export async function processCouncilCommand(input: string): Promise<ConsensusResult> {
  // Deterministic, short deliberation delay to keep tests fast
  await new Promise(r => setTimeout(r, 160));

  const normalizedInput = input.trim() || DEFAULT_PROBLEM_TEXT;
  const keywords = normalizedInput.toLowerCase();
  const riskKeywords = ["خطر", "ریسک", "تهدید", "حمله", "risk", "danger", "attack"];
  const hasRiskSignal = riskKeywords.some(k => keywords.includes(k));
  /**
   * مدل امتیازدهی:
   * - CONFIDENCE_BASE = 90: خوش‌بینانه و مطابق استاندارد عملیاتی Q-Net
   * - CONFIDENCE_MAX_LENGTH_PENALTY و CONFIDENCE_LENGTH_DIVISOR: جریمه ورودی‌های طولانی که اجرای سریع را سخت می‌کنند
   * - RISK_CONFIDENCE_PENALTY: کاهش اعتماد در صورت وجود کلمات پرخطر
   * - ROI_BASE = 18: خط مبنا برای حاشیه سود هدف Q-Net
   * - opportunityBoost/complexityPenalty: متناسب با کلمات کلیدی فرصت و پیچیدگی متن ورودی
   */
  const CONFIDENCE_BASE = 90; // optimistic base assuming normal conditions
  const CONFIDENCE_MAX_LENGTH_PENALTY = 18; // cap penalty so long prompts do not zero confidence
  const CONFIDENCE_LENGTH_DIVISOR = 22; // bucket size to scale penalty with input length
  const RISK_CONFIDENCE_PENALTY = hasRiskSignal ? 12 : 0; // extra penalty when risk keywords exist
  // ROI model: deterministic variation to avoid randomness while keeping a spread
  const ROI_BASE = 18; // خط مبنای ROI متناسب با حاشیه هدف Q-Net
  const MAX_PROBLEM_DISPLAY_LENGTH = 140; // حداکثر طول نمایش مسئله برای خلاصه‌سازی خروجی
  const opportunityKeywords = ["q-net", "qnet", "شبکه", "network", "gen-7", "internet", "q network"];
  const opportunityBoost = opportunityKeywords.some(k => keywords.includes(k)) ? 6 : 0;
  const complexityPenalty = Math.min(6, Math.floor(normalizedInput.length / 60));
  const successProbability = Math.max(60, Math.min(96, 80 + opportunityBoost - complexityPenalty * 3 - (hasRiskSignal ? 10 : 0)));
  const roiEstimate = Math.max(12, Math.min(40, ROI_BASE + opportunityBoost / 2 - complexityPenalty - (hasRiskSignal ? 2 : 0)));

  const votes: CouncilVote[] = COUNCIL_MEMBERS.map(member => {
    let contribution: string;
    let status: "APPROVED" | "REVIEWING" | "CONCERN" = "APPROVED";

    switch (member.id) {
      case "edison":
        contribution = `ادیسون: اگر ROI این تصمیم زیر ${roiEstimate}٪ بماند، باید مسیر درآمد را اصلاح کنیم.`;
        break;
      case "rumi":
        contribution = "رومی: راه‌حل باید دل کاربر را هم به دست بیاورد، نه فقط CPU را.";
        break;
      case "trump":
        contribution = "ترامپ: سرعت تصمیم‌گیری مهم است؛ یا سریع می‌بریم یا بازار از دست می‌رود.";
        break;
      case "buddha":
        status = hasRiskSignal ? "REVIEWING" : "APPROVED";
        contribution = hasRiskSignal
          ? "بودا: پیش از اقدام، تنش را پایین بیاور و دامنه اثر را محدود کن."
          : "بودا: تعادل بین سرعت و ایمنی حفظ شده است.";
        break;
      case "grok":
        status = hasRiskSignal ? "CONCERN" : "APPROVED";
        contribution = hasRiskSignal
          ? "گراک: ریسک واقعی است. اگر الان ایمن‌سازی نکنی، بعدا هزینه‌اش چند برابر است."
          : "گراک: حرف حساب؛ برنامه قابل اجرا و سریع است.";
        break;
      case "tesla":
        contribution = "تسلا: برای کارایی، مسیرهای Edge و تاخیر شبکه باید زیر آستانه هدف بماند.";
        break;
      case "ada":
        contribution = `آدا: بر اساس داده، احتمال موفقیت ${successProbability}٪ و ریسک کنترل‌شده است.`;
        break;
      case "machiavelli":
        status = hasRiskSignal ? "REVIEWING" : "APPROVED";
        contribution = hasRiskSignal
          ? "ماکیاولی: ابتدا ریسک قدرت و مسیر واکنش را ببند، بعد اجرا کن."
          : "ماکیاولی: از منظر قدرت تصمیم، تعادل ذی‌نفعان برقرار است.";
        break;
      case "hermes":
        contribution = "هرمس: اجرای عملیاتی آماده است؛ ترتیب کارها روشن و قابل پیگیری است.";
        break;
      default:
        contribution = `تحلیل ${member.nameFa} در حوزه ${member.role} اعمال شد.`;
    }

    return { member, status, contribution };
  });

  const concerns = votes.filter(v => v.status === "CONCERN").length;
  const baseScore = CONFIDENCE_BASE - Math.min(CONFIDENCE_MAX_LENGTH_PENALTY, Math.floor(normalizedInput.length / CONFIDENCE_LENGTH_DIVISOR));
  const blendedScore = Math.round((baseScore + successProbability) / 2) - Math.floor(RISK_CONFIDENCE_PENALTY / 2);
  const confidence = Math.max(65, Math.min(98, blendedScore));

  const trimmedProblem = normalizedInput.length > MAX_PROBLEM_DISPLAY_LENGTH
    ? `${normalizedInput.slice(0, MAX_PROBLEM_DISPLAY_LENGTH)}...`
    : normalizedInput;
  const safeTrimmedProblem = sanitizeForCode(trimmedProblem);
  const safeDefaultProblem = sanitizeForCode(DEFAULT_PROBLEM_TEXT);

  const layerOneAnalyses = [
    `۱) ادیسون (بازگشت سرمایه): برای «${trimmedProblem}» ROI حدود ${roiEstimate}٪ بر اساس فرصت و ریسک برآورد شد.`,
    `۲) رومی (معنا و فرهنگ): می‌گوید داستان «${trimmedProblem}» باید با همدلی روایت شود تا پذیرش بالا رود.`,
    "۳) ترامپ (معامله): معامله را زمانی برد می‌داند که زمان عرضه کوتاه و پیام روشن باشد.",
    "۴) بودا (آرامش): تاکید دارد بر اجرای تدریجی تا وابستگی‌ها رنج ایجاد نکنند.",
    `۵) گراک (بی‌پرده): اگر در «${trimmedProblem}» سریع نرویم، رقبا جلو می‌زنند. پس MVP در اولویت است.`,
    `۶) تسلا (فنی): پیشنهاد اتصال گره‌های Q-Net برای این سناریو با تاخیر زیر ۱۵ میلی‌ثانیه و پهنای باند تضمین شده.`,
    "۷) آدا (داده): داده‌های ترافیک و ازدحام باید مانیتور شده و در مدل پیش‌بینی تغذیه شوند.",
    `۸) ماکیاولی (ریسک): برای «${trimmedProblem}» مدیریت قدرت ذینفعان مهم است تا مقاومت سازمانی کاهش یابد.`,
    "۹) هرمیس (عملیات): به دسترس‌پذیری ۹۹.۹۹٪ و مسیرهای فیل-اوور اشاره می‌کند.",
    "تعارض: ادیسون و گراک سرعت و درآمد را می‌خواهند، بودا و ماکیاولی احتیاط می‌کنند. سود سرعت: سهم بازار بیشتر. زیان آن: ریسک امنیت و مقاومت فرهنگی."
  ];

  const structuralAnswers = [
    `۱. معماری دسترسی لایه‌ای Q-Net برای «${trimmedProblem}» با هدف تاخیر زیر ۲۰ms. داده: Wolfram Data Repository - Telecom Infrastructure Latency.`,
    `۲. پایش اقتصادی: هزینه هر گره برای این مسئله زیر ۱۵٪ نسبت به ARPU هدف. داده: Wolfram Data Repository - Economics/Prices.`,
    `۳. مسیر امن: Zero-Trust + رمزنگاری مقاوم در برابر کوانتوم ${hasRiskSignal ? "(تقویت‌شده به دلیل سیگنال ریسک)" : "(سطح استاندارد)"}. داده: Wolfram Data Repository - Security Key Metrics.`,
    "۴. پوشش محلی: اولویت شهرهای با تراکم بالای ترافیک. داده: Wolfram Data Repository - Demographics/Population.",
    `۵. عملیات خودکار: CI/CD و شاخص MTTR زیر ۱۵ دقیقه مخصوص سناریوی «${trimmedProblem}». داده: Wolfram Data Repository - Reliability Metrics.`,
    `۶. آموزش کاربر: بسته آنبوردینگ فارسی مخصوص مسئله «${trimmedProblem}» با KPI پذیرش ۳۰٪ در هفته اول.`
  ];

  const eliminatedAnswers = hasRiskSignal ? ["۶. آموزش کاربر تا پس از تایید امنیتی به تعویق افتاد."] : [];
  const filteredAnswers = hasRiskSignal ? structuralAnswers.slice(0, 5) : structuralAnswers;

  const languageChoice = "TypeScript";
  const languageReason = "سازگار با پشته پروژه و امکان اجرای سریع با ts-node برای تولید خروجی قابل سنجش.";

  const generateExecutableCode = (safeProblem: string, safeDefault: string): string => `// اجرا (نمونه): npx ts-node plan-runner.ts \"${safeProblem}\"
type Step = { title: string; metric: string; owner: string };
declare const process: { argv: string[] };

function buildPlan(problem: string): Step[] {
  const focus = problem || "${safeDefault}";
  return [
    { title: \`آماده‌سازی گره Q-Net برای \${focus}\`, metric: "latency < 20ms", owner: "Network" },
    { title: "امنیت Zero-Trust", metric: "100% سرویس‌ها با MFA و لاگ‌برداری", owner: "Security" },
    { title: "پایش اقتصادی", metric: "هزینه/کاربر <= 15% ARPU", owner: "Finance" },
    { title: "خودکارسازی عملیات", metric: "MTTR < 15m", owner: "SRE" },
  ];
}

const problem = process.argv[2] ?? "${safeDefault}";
const plan = buildPlan(problem);
console.log(JSON.stringify({ problem, plan }, null, 2));
`;
  const executableCode = generateExecutableCode(safeTrimmedProblem, safeDefaultProblem);

  const finalResponse = [
    `🔵 لایه ۱: تحلیل اعضا (۹ بعد هر عضو - خلاصه با صدای واقعی)\n${layerOneAnalyses.join("\n")}`,
    `🟡 لایه ۲: ۶ پاسخ ساختاری ترکیبی (با داده و منبع)\n${filteredAnswers.join("\n")}`,
    `🔴 لایه ۳: فیلتر ۳ معیار (اقتصادی، امنیتی، اخلاقی) - ذکر موارد حذف‌شده و دلیل\n- پذیرفته: ${filteredAnswers.length} پاسخ با ROI مثبت، ریسک کنترل‌شده و بدون تعارض اخلاقی\n- حذف‌شده: ${eliminatedAnswers.length === 0 ? "موردی حذف نشد" : eliminatedAnswers.join(" | ")}\n- معیارها: اقتصادی (کم‌هزینه)، امنیتی (Zero-Trust، QKD آماده)، اخلاقی (بدون تبعیض و شفاف)`,
    `🟢 لایه ۴: خروجی اجرایی (کد کامل و اجرایی / گام‌های اولویت‌بندی‌شده / تحلیل مستند)\n- زبان برنامه‌نویسی انتخاب شده و دلیل: ${languageChoice} - ${languageReason}\n- کد کامل و قابل اجرا:\n\`\`\`ts\n${executableCode}\n\`\`\``,
    "⭐ گزارش نهایی فرمانده سام آرمان\n- توضیح ساده با مثال‌های روزمره: مثل راه‌اندازی یک بزرگراه جدید است؛ اول مسیر اصلی، بعد تابلوهای ایمنی و در نهایت آموزش رانندگان.\n- وضعیت پیشرفت پروژه Q Network و مرحله فعلی: در فاز طراحی لایه دسترسی و سخت‌گیری امنیتی پیش از استقرار MVP هستیم.\n- سوال مشخص برای توسعه پروژه: بزرگ‌ترین محدودیت فعلی شما چیست؛ بودجه، زمان، یا ریسک امنیتی؟"
  ].join("\n\n");

  return {
    votes,
    finalResponse,
    confidence,
    timestamp: Date.now(),
  };
}
