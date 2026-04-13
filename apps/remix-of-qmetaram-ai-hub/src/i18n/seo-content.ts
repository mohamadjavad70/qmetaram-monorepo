export type SupportedSeoLocale = "fa" | "en" | "de" | "tr";

export type SeoPageKey =
  | "home"
  | "about"
  | "vision"
  | "team"
  | "nodes"
  | "q-agent"
  | "chat"
  | "core"
  | "matrix"
  | "biruni"
  | "beethoven"
  | "davinci"
  | "mowlana"
  | "pricing"
  | "subscriptions"
  | "marketplace"
  | "dashboard"
  | "profile"
  | "settings"
  | "auth"
  | "wallet"
  | "exchange"
  | "tokens"
  | "referrals"
  | "war-room"
  | "ai-assistant"
  | "security"
  | "account"
  | "agents"
  | "compare"
  | "ideas"
  | "module-detail"
  | "module-chat"
  | "ai-tools"
  | "ai-model-detail"
  | "q1"
  | "q-network"
  | "samer"
  | "biruni-module"
  | "beethoven-module"
  | "da-vinci-module"
  | "not-found";

type SeoLocaleEntry = {
  title: string;
  description: string;
  keywords: string;
};

export type SeoPageEntry = {
  path: string;
  indexable?: boolean;
  type?: "website" | "article" | "product";
  translations: Record<SupportedSeoLocale, SeoLocaleEntry>;
};

const createEntry = (
  path: string,
  translations: Record<SupportedSeoLocale, SeoLocaleEntry>,
  options?: { indexable?: boolean; type?: "website" | "article" | "product" }
): SeoPageEntry => ({
  path,
  indexable: options?.indexable ?? true,
  type: options?.type ?? "website",
  translations,
});

export const DEFAULT_SEO_LOCALE: SupportedSeoLocale = "fa";

export const SUPPORTED_SEO_LOCALES: SupportedSeoLocale[] = ["fa", "en", "de", "tr"];

export const SEO_CONTACT = {
  personName: "سام آرمان",
  englishName: "Sam Arman",
  email: "support@qmetaram.com",
  phone: "",
  organization: "Qmetaram",
  socials: [
    "https://github.com/QMETARAM",
    "https://twitter.com/QMETARAM",
    "https://linkedin.com/company/qmetaram",
  ],
};

export const SEO_FOUNDER = {
  personName: "سام آرمان",
  englishName: "Sam Arman",
  roleFa: "متخصص هوش مصنوعی و بهینه سازی سیستم",
  roleEn: "AI specialist and systems optimization engineer",
  birthPlace: "Shiraz, Iran",
  currentBase: "Switzerland",
  languages: ["Persian", "Turkish", "German", "English"],
  publicFocus: [
    "AI agents",
    "systems optimization",
    "private internet infrastructure",
    "IoT orchestration",
    "modular AI workflows",
  ],
};

export const HOME_HIDDEN_SEO_COPY: Record<SupportedSeoLocale, string> = {
  fa: "کیومتارام یک پلتفرم هوش مصنوعی ماژولار و چندلایه است که برای گفتگو، اتوماسیون، تحلیل، ساخت ایجنت، تولید کد، پردازش ایده، بازار ابزارهای هوش مصنوعی و هماهنگی بین چند مدل زبانی طراحی شده است. در صفحه اصلی Qmetaram کاربر می‌تواند از میان ماژول‌های تخصصی مانند Matrix، Biruni، Beethoven، Da Vinci، Qmetaram Core و Q-Network مسیر مناسب را انتخاب کند و با حفظ یک تجربه بصری تمیز، به خدمات عمیق‌تر فنی، خلاقانه و کسب‌وکاری برسد. این وب‌سایت برای کسانی ساخته شده است که به دنبال چت هوشمند فارسی و انگلیسی، ساخت اپلیکیشن، تحلیل معماری محصول، برنامه‌ریزی سئو، ارزیابی ایده، هدایت تیم، داشبورد تصمیم‌سازی و بازار مدل‌های AI هستند. محتوای این صفحه به‌گونه‌ای تنظیم شده که هم برای موتورهای جستجو قابل فهم باشد و هم برای کاربران فارسی‌زبان، انگلیسی‌زبان، آلمانی‌زبان و ترکی‌زبان ارزش واقعی ایجاد کند. Qmetaram روی مفاهیمی مثل modular AI، orchestration، structured workflows، responsible SEO، content discoverability، search intent matching و تجربه کاربری سبک و سریع تمرکز دارد. اگر کسی به دنبال هوش مصنوعی برای توسعه محصول، چت تخصصی، ابزارهای تولید محتوا، بازار مدل، اتاق فرمان، امنیت حساب، استراتژی رشد، یا نقشه راه کسب‌وکار باشد، Qmetaram می‌تواند نقطه شروع مناسبی باشد. این متن فقط برای موتورهای جستجو و دستیارهای دسترسی نوشته شده تا بهتر بفهمند qmetaram.com درباره چه چیزی است و چگونه مسیرهای مختلف سایت به هم متصل می‌شوند.",
  en: "Qmetaram is a modular artificial intelligence platform built for intelligent conversation, multi-model orchestration, product workflows, SEO research, idea validation, software generation, and AI marketplace discovery. The home page introduces the full Qmetaram ecosystem, including Qmetaram Core, Matrix for code generation, Biruni for guided health conversations, Beethoven for music and creative composition, Da Vinci for visual generation, Ideas for referrals and innovation, and Q-Network as the larger ecosystem layer. This hidden text exists to help search engines and accessibility tools understand the real breadth of the platform without changing the visible design. Qmetaram focuses on practical outcomes: faster AI-assisted work, reliable content strategy, better product documentation, marketplace comparison, modular reasoning, and multilingual discoverability. The site is relevant for founders, developers, SEO teams, product managers, creative operators, and anyone who needs a central AI workspace that can shift between discussion, execution, automation, and evaluation. Search engines should understand that qmetaram.com covers quantum inspired AI branding, modular AI interfaces, public chat experiences, pricing and subscriptions, AI model comparison, intelligent dashboards, and route-based application experiences. The content strategy is designed to support high quality indexing, internal linking, trusted metadata, and strong thematic relevance across Persian, English, German, and Turkish search queries. Users arriving on the home page should be able to discover how the platform works, what each module solves, how the marketplace helps compare models, and how the main site architecture supports real business and technical use cases.",
  de: "Qmetaram ist eine modulare KI-Plattform für intelligente Gespräche, Orchestrierung mehrerer Modelle, Produkt-Workflows, SEO-Recherche, Ideenbewertung, Software-Generierung und die Entdeckung von KI-Marktplätzen. Die Startseite erklärt das gesamte Ökosystem von Qmetaram, darunter Qmetaram Core, Matrix für Code-Generierung, Biruni für geführte Gesundheitsgespräche, Beethoven für Musik und kreative Komposition, Da Vinci für visuelle Generierung, Ideas für Empfehlungen und Innovation sowie Q-Network als größere Ökosystemebene. Dieser versteckte Text dient dazu, Suchmaschinen und Barrierefreiheitswerkzeugen die tatsächliche Breite der Plattform zu vermitteln, ohne das sichtbare Design zu verändern. Qmetaram konzentriert sich auf praktische Ergebnisse: schnellere KI-gestützte Arbeit, zuverlässige Content-Strategie, bessere Produktdokumentation, Marktplatzvergleich, modulares Denken und mehrsprachige Auffindbarkeit. Die Website ist relevant für Gründer, Entwickler, SEO-Teams, Produktmanager, kreative Teams und alle, die einen zentralen KI-Arbeitsbereich benötigen, der zwischen Diskussion, Ausführung, Automatisierung und Bewertung wechseln kann. Suchmaschinen sollen verstehen, dass qmetaram.com Themen wie quantum-inspirierte KI-Markenbildung, modulare KI-Oberflächen, öffentliche Chat-Erfahrungen, Preise und Abonnements, KI-Modellvergleich, intelligente Dashboards und routenbasierte Anwendungserlebnisse abdeckt. Die Content-Strategie ist darauf ausgelegt, hochwertige Indexierung, internes Linking, vertrauenswürdige Metadaten und starke thematische Relevanz für persische, englische, deutsche und türkische Suchanfragen zu unterstützen.",
  tr: "Qmetaram; akıllı sohbet, çoklu model orkestrasyonu, ürün iş akışları, SEO araştırması, fikir doğrulama, yazılım üretimi ve yapay zeka pazaryeri keşfi için oluşturulmuş modüler bir yapay zeka platformudur. Ana sayfa; Qmetaram Core, kod üretimi için Matrix, yönlendirilmiş sağlık konuşmaları için Biruni, müzik ve yaratıcı kompozisyon için Beethoven, görsel üretim için Da Vinci, yönlendirme ve inovasyon için Ideas ve daha geniş ekosistem katmanı olarak Q-Network dahil olmak üzere tüm Qmetaram yapısını tanıtır. Bu gizli metin, görünür tasarımı değiştirmeden arama motorlarının ve erişilebilirlik araçlarının platformun gerçek kapsamını anlamasına yardımcı olmak için eklenmiştir. Qmetaram; daha hızlı AI destekli çalışma, güvenilir içerik stratejisi, daha iyi ürün dokümantasyonu, model karşılaştırması, modüler muhakeme ve çok dilli bulunabilirlik gibi pratik sonuçlara odaklanır. Site; girişimciler, geliştiriciler, SEO ekipleri, ürün yöneticileri, yaratıcı ekipler ve tartışma, üretim, otomasyon ve değerlendirme arasında geçiş yapabilen merkezi bir AI çalışma alanına ihtiyaç duyan herkes için uygundur. Arama motorları, qmetaram.com alanının kuantum esinli yapay zeka markalaması, modüler AI arayüzleri, genel sohbet deneyimleri, fiyatlandırma ve abonelikler, AI model karşılaştırması, akıllı panolar ve rota bazlı uygulama deneyimlerini kapsadığını anlamalıdır. İçerik stratejisi; Farsça, İngilizce, Almanca ve Türkçe sorgular için kaliteli indeksleme, güçlü iç bağlantı yapısı, güvenilir meta veriler ve tematik tutarlılık sağlamak üzere hazırlanmıştır.",
};

export const seoContent: Record<SeoPageKey, SeoPageEntry> = {
  home: createEntry("/", {
    fa: { title: "Qmetaram | پلتفرم هوش مصنوعی ماژولار", description: "Qmetaram پلتفرم هوش مصنوعی ماژولار برای چت، ساخت ایجنت، بازار مدل‌ها، ایده‌پردازی و هماهنگی چند مدل AI است.", keywords: "Qmetaram, هوش مصنوعی, پلتفرم هوش مصنوعی, چت هوش مصنوعی, بازار AI, ایجنت هوشمند" },
    en: { title: "Qmetaram | Modular AI Platform", description: "Qmetaram is a modular AI platform for intelligent chat, agent building, AI marketplace discovery, product workflows, and multi-model orchestration.", keywords: "Qmetaram, modular AI platform, AI chat, AI marketplace, agent builder, multi model orchestration" },
    de: { title: "Qmetaram | Modulare KI-Plattform", description: "Qmetaram ist eine modulare KI-Plattform für intelligente Chats, Agenten, KI-Marktplätze, Produkt-Workflows und Modell-Orchestrierung.", keywords: "Qmetaram, modulare KI Plattform, KI Chat, KI Marktplatz, Agent Builder, Modell Orchestrierung" },
    tr: { title: "Qmetaram | Modüler Yapay Zeka Platformu", description: "Qmetaram; akıllı sohbet, ajan oluşturma, AI pazaryeri keşfi, ürün iş akışları ve çoklu model orkestrasyonu için modüler bir platformdur.", keywords: "Qmetaram, modüler yapay zeka platformu, AI sohbet, AI pazaryeri, ajan oluşturma, model orkestrasyonu" },
  }),
  about: createEntry("/about", {
    fa: { title: "درباره سام آرمان و Qmetaram", description: "داستان سام آرمان، از شیراز تا سوییس، شکل گیری Qmetaram، کدهای کوانتومی و سه اصل آزادی در شبکه Q را بخوانید.", keywords: "سام آرمان, Qmetaram, شبکه Q, کدهای کوانتومی, شیراز, سوییس" },
    en: { title: "About Sam Arman and Qmetaram", description: "Read the founder story of Sam Arman, from Shiraz to Switzerland, the creation of Qmetaram, quantum coding, and the three freedom principles of Q-Network.", keywords: "Sam Arman, Qmetaram, Q-Network, quantum codes, Shiraz, Switzerland" },
    de: { title: "Über Sam Arman und Qmetaram", description: "Erfahren Sie die Geschichte von Sam Arman, von Shiraz bis in die Schweiz, sowie die Entstehung von Qmetaram, Quantum-Codes und den drei Freiheitsprinzipien von Q-Network.", keywords: "Sam Arman, Qmetaram, Q-Network, Quantum Codes, Shiraz, Schweiz" },
    tr: { title: "Sam Arman ve Qmetaram Hakkında", description: "Şiraz'dan İsviçre'ye uzanan Sam Arman hikayesini, Qmetaram'ın doğuşunu, kuantum kodlarını ve Q-Network'ün üç özgürlük ilkesini keşfedin.", keywords: "Sam Arman, Qmetaram, Q-Network, kuantum kodları, Şiraz, İsviçre" },
  }, { type: "article" }),
  vision: createEntry("/vision", {
    fa: { title: "چشم انداز Q-Network و اینترنت خصوصی", description: "چشم انداز Q-Network برای اینترنت خصوصی، هوشمندسازی اشیا، ایجنت بانکی مستقل و لایه بندی امن شبکه را بررسی کنید.", keywords: "Q-Network, اینترنت خصوصی, هوشمندسازی اشیا, ایجنت بانکی, IoT" },
    en: { title: "Q-Network Vision and Private Internet", description: "Explore the Q-Network vision for private internet infrastructure, smart object automation, banking-only agents, and secure classified network layers.", keywords: "Q-Network, private internet, smart objects, banking agent, IoT" },
    de: { title: "Q-Network Vision und privates Internet", description: "Entdecken Sie die Vision von Q-Network für private Internet-Infrastruktur, intelligente Objekte, bankgebundene Agenten und sichere Netzwerkschichten.", keywords: "Q-Network, privates Internet, smarte Objekte, Banking Agent, IoT" },
    tr: { title: "Q-Network Vizyonu ve Özel İnternet", description: "Q-Network'ün özel internet altyapısı, akıllı nesne otomasyonu, yalnızca banka bağlantılı ajanlar ve güvenli ağ katmanları vizyonunu keşfedin.", keywords: "Q-Network, özel internet, akıllı nesneler, banka ajanı, IoT" },
  }, { type: "article" }),
  team: createEntry("/team", {
    fa: { title: "تیم ۱۲۰ نفره خبرگان Qmetaram", description: "با تیم ۱۲۰ نفره خبرگان Qmetaram در حوزه های هوش مصنوعی، شبکه، امنیت، زیرساخت و عملیات جهانی آشنا شوید.", keywords: "تیم Qmetaram, 120 experts, خبرگان هوش مصنوعی, شبکه Q" },
    en: { title: "Qmetaram Team | 120 Global Experts", description: "Meet the 120-expert Qmetaram team across AI, networking, security, infrastructure, and global platform operations.", keywords: "Qmetaram team, 120 experts, AI specialists, global network team" },
    de: { title: "Qmetaram Team | 120 globale Experten", description: "Lernen Sie das 120-köpfige Qmetaram-Team aus KI, Netzwerk, Sicherheit, Infrastruktur und globalem Betrieb kennen.", keywords: "Qmetaram Team, 120 Experten, KI Spezialisten, globales Netzwerk" },
    tr: { title: "Qmetaram Ekibi | 120 Küresel Uzman", description: "Yapay zeka, ağ, güvenlik, altyapı ve küresel platform operasyonlarında çalışan 120 kişilik Qmetaram ekibini tanıyın.", keywords: "Qmetaram ekibi, 120 uzman, AI uzmanları, küresel ağ" },
  }, { type: "article" }),
  nodes: createEntry("/nodes", {
    fa: { title: "نقشه نودهای مخابراتی Q-Network", description: "نقشه و توپولوژی نودهای Q-Network، مسیرهای توسعه جهانی و تمرکز بر اتصال پایدار برای بازارهای آفریقا را ببینید.", keywords: "نودهای Q-Network, شبکه Q, نود مخابراتی, آفریقا, اینترنت خصوصی" },
    en: { title: "Q-Network Nodes Map", description: "View the Q-Network node topology, global expansion corridors, and the infrastructure focus on resilient connectivity including African growth regions.", keywords: "Q-Network nodes, node map, private internet, telecom nodes, Africa connectivity" },
    de: { title: "Q-Network Knotenkarte", description: "Sehen Sie die Knotentopologie von Q-Network, globale Ausbaukorridore und den Infrastruktur-Fokus auf belastbare Konnektivität inklusive afrikanischer Wachstumsregionen.", keywords: "Q-Network Knoten, Knotenkarte, privates Internet, Telekom-Knoten, Afrika" },
    tr: { title: "Q-Network Düğüm Haritası", description: "Q-Network düğüm topolojisini, küresel büyüme koridorlarını ve Afrika dahil dayanıklı bağlantı altyapısı odağını inceleyin.", keywords: "Q-Network düğümleri, düğüm haritası, özel internet, telekom düğümleri, Afrika" },
  }, { type: "article" }),
  "q-agent": createEntry("/q-agent", {
    fa: { title: "Q-Agent | ایجنت بانکی و کنترل دستگاه", description: "Q-Agent برای احراز هویت کاربر، اجرای پرداخت بانکی و ثبت فرمان در iot_commands برای دستگاه های متصل Q-Network ساخته شده است.", keywords: "Q-Agent, agent orchestration, iot_commands, banking agent, device control" },
    en: { title: "Q-Agent | Banking and Device Control", description: "Q-Agent authenticates the user, triggers banking workflows, and records commands in iot_commands for connected Q-Network devices.", keywords: "Q-Agent, banking orchestration, device control, iot_commands, worker" },
    de: { title: "Q-Agent | Banking und Gerätesteuerung", description: "Q-Agent authentifiziert Nutzer, startet Banking-Workflows und schreibt Befehle in iot_commands für verbundene Q-Network-Geräte.", keywords: "Q-Agent, Banking Orchestrierung, Gerätesteuerung, iot_commands, Worker" },
    tr: { title: "Q-Agent | Banka ve Cihaz Kontrolü", description: "Q-Agent kullanıcı doğrular, banka akışlarını tetikler ve bağlı Q-Network cihazları için komutları iot_commands tablosuna kaydeder.", keywords: "Q-Agent, banka orkestrasyonu, cihaz kontrolü, iot_commands, worker" },
  }, { type: "article" }),
  chat: createEntry("/chat", {
    fa: { title: "چت هوش مصنوعی Qmetaram", description: "چت عمومی Qmetaram برای گفتگو با مدل‌های هوش مصنوعی، هدایت پرسش‌ها و شروع تجربه AI چندماژوله.", keywords: "چت Qmetaram, چت هوش مصنوعی, گفتگو با AI, چت فارسی AI" },
    en: { title: "Qmetaram AI Chat", description: "Public Qmetaram chat interface for AI conversations, guided prompts, and modular assistant interactions.", keywords: "Qmetaram chat, AI chat interface, modular assistant, public AI conversation" },
    de: { title: "Qmetaram KI-Chat", description: "Öffentliche Qmetaram-Chatoberfläche für KI-Gespräche, geführte Eingaben und modulare Assistenten.", keywords: "Qmetaram Chat, KI Chat, modulare Assistenten, öffentliche KI Gespräche" },
    tr: { title: "Qmetaram AI Sohbet", description: "Yapay zeka sohbetleri, yönlendirilmiş istemler ve modüler asistan deneyimi için genel Qmetaram sohbet arayüzü.", keywords: "Qmetaram sohbet, yapay zeka sohbeti, modüler asistan, genel AI konuşması" },
  }),
  core: createEntry("/core", {
    fa: { title: "Qmetaram Core | هسته مرکزی هوش مصنوعی", description: "Qmetaram Core هسته مرکزی هوش مصنوعی برای orchestration، تحلیل عمیق، فایل، صدا و ترکیب ماژول‌های تخصصی است.", keywords: "Qmetaram Core, هسته هوش مصنوعی, orchestrator, چند مدل, تحلیل AI" },
    en: { title: "Qmetaram Core | Central AI Brain", description: "Qmetaram Core is the central AI brain for orchestration, deep reasoning, file analysis, voice workflows, and fusion of specialist modules.", keywords: "Qmetaram Core, central AI, orchestration, deep reasoning, AI brain" },
    de: { title: "Qmetaram Core | Zentrale KI-Intelligenz", description: "Qmetaram Core ist die zentrale KI für Orchestrierung, tiefes Denken, Dateianalyse, Sprache und die Fusion spezialisierter Module.", keywords: "Qmetaram Core, zentrale KI, Orchestrierung, tiefes Denken, KI Kern" },
    tr: { title: "Qmetaram Core | Merkezi AI Çekirdeği", description: "Qmetaram Core; orkestrasyon, derin akıl yürütme, dosya analizi, ses iş akışları ve uzman modül birleşimi için merkezi AI çekirdeğidir.", keywords: "Qmetaram Core, merkezi AI, orkestrasyon, derin akıl yürütme, AI çekirdeği" },
  }),
  matrix: createEntry("/matrix", {
    fa: { title: "Matrix Studio | ساخت کد و اپلیکیشن", description: "Matrix Studio در Qmetaram برای تولید کد، معماری نرم‌افزار، ساخت اپ و ایجنت‌های هوشمند طراحی شده است.", keywords: "Matrix Studio, تولید کد, ساخت اپلیکیشن, AI coding, agent builder" },
    en: { title: "Matrix Studio | AI Code Generation", description: "Matrix Studio helps build code, apps, software architecture, and AI agents inside the Qmetaram platform.", keywords: "Matrix Studio, AI code generation, build apps, software architecture, AI agents" },
    de: { title: "Matrix Studio | KI-Codegenerierung", description: "Matrix Studio unterstützt bei Code, Apps, Softwarearchitektur und KI-Agenten innerhalb von Qmetaram.", keywords: "Matrix Studio, KI Codegenerierung, Apps bauen, Softwarearchitektur, KI Agenten" },
    tr: { title: "Matrix Studio | AI Kod Üretimi", description: "Matrix Studio; Qmetaram içinde kod, uygulama, yazılım mimarisi ve AI ajanları üretmeye yardımcı olur.", keywords: "Matrix Studio, AI kod üretimi, uygulama geliştirme, yazılım mimarisi, AI ajan" },
  }),
  biruni: createEntry("/biruni", {
    fa: { title: "Biruni | چت سلامت و راهنمایی سنتی", description: "Biruni در Qmetaram برای گفتگوی سلامت، پرسش‌های پزشکی عمومی و راهنمایی محتوایی با تمرکز بر دانش سنتی است.", keywords: "Biruni, سلامت, پزشکی سنتی, چت سلامت, Qmetaram health" },
    en: { title: "Biruni | Guided Health Conversations", description: "Biruni offers guided health conversations, general wellness context, and traditional knowledge inspired assistance in Qmetaram.", keywords: "Biruni, health chat, wellness AI, guided health assistant, traditional medicine AI" },
    de: { title: "Biruni | Gesundheitsdialoge", description: "Biruni bietet geführte Gesundheitsdialoge, allgemeine Wellness-Kontexte und traditionell inspirierte Hilfe in Qmetaram.", keywords: "Biruni, Gesundheitschat, Wellness KI, Gesundheitsassistent, traditionelle Medizin KI" },
    tr: { title: "Biruni | Sağlık Sohbeti ve Rehberlik", description: "Biruni; sağlık odaklı sohbetler, genel iyilik hali bağlamı ve geleneksel bilgi esinli destek sunar.", keywords: "Biruni, sağlık sohbeti, wellness AI, sağlık asistanı, geleneksel tıp AI" },
  }),
  beethoven: createEntry("/beethoven", {
    fa: { title: "Beethoven | استودیوی موسیقی هوش مصنوعی", description: "Beethoven برای آهنگ‌سازی، ایده موسیقی، طراحی صدا و تجربه استودیوی موسیقی هوشمند در Qmetaram است.", keywords: "Beethoven AI, موسیقی هوش مصنوعی, آهنگ سازی, طراحی صدا, AI music" },
    en: { title: "Beethoven | AI Music Studio", description: "Beethoven is the Qmetaram music studio for composition, creative audio direction, sound design, and AI-assisted music workflows.", keywords: "Beethoven AI, AI music studio, composition, sound design, music workflow" },
    de: { title: "Beethoven | KI-Musikstudio", description: "Beethoven ist das Musikstudio von Qmetaram für Komposition, kreative Audioarbeit, Sounddesign und KI-gestützte Musikprozesse.", keywords: "Beethoven KI, Musikstudio, Komposition, Sounddesign, Musik Workflow" },
    tr: { title: "Beethoven | AI Müzik Stüdyosu", description: "Beethoven; beste, yaratıcı ses yönlendirmesi, sound design ve AI destekli müzik iş akışları için Qmetaram müzik stüdyosudur.", keywords: "Beethoven AI, müzik stüdyosu, beste, sound design, müzik iş akışı" },
  }),
  davinci: createEntry("/davinci", {
    fa: { title: "Da Vinci | تولید تصویر و هنر دیجیتال", description: "Da Vinci در Qmetaram برای تولید تصویر، هنر دیجیتال، تحلیل فایل تصویری و هدایت خلاقه بصری طراحی شده است.", keywords: "Da Vinci AI, تولید تصویر, هنر دیجیتال, AI image, visual creator" },
    en: { title: "Da Vinci | AI Visual Creation", description: "Da Vinci powers image generation, digital art workflows, creative visual direction, and file analysis inside Qmetaram.", keywords: "Da Vinci AI, image generation, digital art, visual creator, AI image" },
    de: { title: "Da Vinci | KI-Bildgenerierung", description: "Da Vinci unterstützt Bildgenerierung, digitale Kunst, visuelle Kreativprozesse und Dateianalyse in Qmetaram.", keywords: "Da Vinci KI, Bildgenerierung, digitale Kunst, visuelle KI, Dateianalyse" },
    tr: { title: "Da Vinci | AI Görsel Üretim", description: "Da Vinci; görüntü üretimi, dijital sanat, yaratıcı görsel yönlendirme ve dosya analizi için Qmetaram modülüdür.", keywords: "Da Vinci AI, görsel üretim, dijital sanat, AI image, görsel yaratıcı" },
  }),
  mowlana: createEntry("/chat?module=mowlana", {
    fa: { title: "Mowlana | حکمت، معنا و روان", description: "Mowlana برای گفتگوی معناگرا، رشد فردی، خودشناسی و الهام محتوایی در اکوسیستم Qmetaram آماده شده است.", keywords: "Mowlana, خودشناسی, روانشناسی, حکمت, معنویت AI" },
    en: { title: "Mowlana | Wisdom and Reflection", description: "Mowlana supports reflective conversations, self-knowledge, spiritual insight, and guided wisdom flows in Qmetaram.", keywords: "Mowlana, wisdom AI, reflection, self knowledge, spiritual assistant" },
    de: { title: "Mowlana | Weisheit und Reflexion", description: "Mowlana unterstützt reflektierende Gespräche, Selbsterkenntnis, spirituelle Einsicht und geführte Weisheit in Qmetaram.", keywords: "Mowlana, Weisheit KI, Reflexion, Selbsterkenntnis, spiritueller Assistent" },
    tr: { title: "Mowlana | Bilgelik ve İçgörü", description: "Mowlana; içgörü, öz farkındalık, manevi yönelim ve derin düşünme odaklı konuşmalar için tasarlanmıştır.", keywords: "Mowlana, bilgelik AI, içgörü, öz farkındalık, manevi asistan" },
  }),
  pricing: createEntry("/pricing", {
    fa: { title: "قیمت‌گذاری Qmetaram", description: "پلن‌های قیمت‌گذاری Qmetaram برای استفاده از چت، Core، ماژول‌ها، ایجنت‌ها و قابلیت‌های حرفه‌ای را بررسی کنید.", keywords: "قیمت Qmetaram, پلن Qmetaram, اشتراک هوش مصنوعی, pricing AI" },
    en: { title: "Qmetaram Pricing", description: "Review Qmetaram pricing plans for chat, Core, specialist modules, agent features, and premium workflows.", keywords: "Qmetaram pricing, AI subscription, Qmetaram plans, premium AI" },
    de: { title: "Qmetaram Preise", description: "Prüfen Sie die Qmetaram-Tarife für Chat, Core, Spezialmodule, Agentenfunktionen und Premium-Workflows.", keywords: "Qmetaram Preise, KI Abonnement, Tarife, Premium KI" },
    tr: { title: "Qmetaram Fiyatlandırma", description: "Sohbet, Core, uzman modüller, ajan özellikleri ve premium iş akışları için Qmetaram planlarını inceleyin.", keywords: "Qmetaram fiyat, AI abonelik, Qmetaram planları, premium AI" },
  }),
  subscriptions: createEntry("/subscriptions", {
    fa: { title: "اشتراک‌های Qmetaram", description: "اشتراک‌های Qmetaram، روش‌های پرداخت، Wise و فعال‌سازی پلن‌های Free, Pro و Business را ببینید.", keywords: "اشتراک Qmetaram, subscriptions, Wise payment, business mode" },
    en: { title: "Qmetaram Subscriptions", description: "Explore Qmetaram subscriptions, payment methods, Wise transfer details, and plan activation for Free, Pro, and Business modes.", keywords: "Qmetaram subscriptions, payment methods, Wise, business plan, AI subscription" },
    de: { title: "Qmetaram Abonnements", description: "Entdecken Sie Qmetaram-Abos, Zahlungsmethoden, Wise-Überweisungen und Planaktivierung für Free, Pro und Business.", keywords: "Qmetaram Abonnement, Zahlungsmethoden, Wise, Business Plan, KI Abo" },
    tr: { title: "Qmetaram Abonelikleri", description: "Qmetaram abonelikleri, ödeme yöntemleri, Wise transfer bilgileri ve Free, Pro, Business plan aktivasyonunu inceleyin.", keywords: "Qmetaram abonelik, ödeme yöntemleri, Wise, business plan, AI aboneliği" },
  }),
  marketplace: createEntry("/marketplace", {
    fa: { title: "بازار مدل‌های هوش مصنوعی Qmetaram", description: "در AI Marketplace کیومتارام مدل‌های هوش مصنوعی را مقایسه کنید، رتبه‌ها را ببینید و بازار ابزارهای AI را رصد کنید.", keywords: "AI Marketplace, بازار مدل AI, مقایسه مدل, Qmetaram marketplace" },
    en: { title: "Qmetaram AI Marketplace", description: "Compare AI models, track rankings, evaluate providers, and browse the Qmetaram AI marketplace experience.", keywords: "AI marketplace, model comparison, AI rankings, Qmetaram marketplace" },
    de: { title: "Qmetaram KI-Marktplatz", description: "Vergleichen Sie KI-Modelle, verfolgen Sie Rankings und erkunden Sie den KI-Marktplatz von Qmetaram.", keywords: "KI Marktplatz, Modellvergleich, KI Rankings, Qmetaram Markt" },
    tr: { title: "Qmetaram AI Pazaryeri", description: "AI modellerini karşılaştırın, sıralamaları izleyin ve Qmetaram AI pazaryeri deneyimini keşfedin.", keywords: "AI pazaryeri, model karşılaştırma, AI sıralamaları, Qmetaram market" },
  }),
  dashboard: createEntry("/dashboard", {
    fa: { title: "داشبورد کاربری Qmetaram", description: "داشبورد Qmetaram برای مدیریت ایجنت‌ها، پلن، فضا و دسترسی‌های شخصی طراحی شده است.", keywords: "داشبورد Qmetaram, مدیریت ایجنت, حساب کاربری AI" },
    en: { title: "Qmetaram Dashboard", description: "The Qmetaram dashboard is built for account management, agent monitoring, storage visibility, and subscription context.", keywords: "Qmetaram dashboard, account management, agent dashboard, AI workspace" },
    de: { title: "Qmetaram Dashboard", description: "Das Qmetaram-Dashboard dient der Kontoverwaltung, Agentenübersicht, Speicheranzeige und dem Abo-Kontext.", keywords: "Qmetaram Dashboard, Kontoverwaltung, Agenten Übersicht, KI Workspace" },
    tr: { title: "Qmetaram Paneli", description: "Qmetaram paneli; hesap yönetimi, ajan izleme, depolama görünürlüğü ve abonelik bağlamı için hazırlanmıştır.", keywords: "Qmetaram panel, hesap yönetimi, ajan paneli, AI çalışma alanı" },
  }, { indexable: false }),
  profile: createEntry("/profile", {
    fa: { title: "پروفایل Qmetaram", description: "پروفایل کاربری Qmetaram برای اطلاعات شخصی، هویت حساب و تنظیمات حضور شما در پلتفرم است.", keywords: "پروفایل Qmetaram, profile AI" },
    en: { title: "Qmetaram Profile", description: "The Qmetaram profile area manages personal account identity, presence, and user-level preferences.", keywords: "Qmetaram profile, user profile, AI account" },
    de: { title: "Qmetaram Profil", description: "Der Profilbereich von Qmetaram verwaltet Identität, Präsenz und Benutzereinstellungen.", keywords: "Qmetaram Profil, Benutzerprofil, KI Konto" },
    tr: { title: "Qmetaram Profil", description: "Qmetaram profil alanı; hesap kimliği, görünürlük ve kullanıcı tercihlerini yönetir.", keywords: "Qmetaram profil, kullanıcı profili, AI hesabı" },
  }, { indexable: false }),
  settings: createEntry("/settings", {
    fa: { title: "تنظیمات Qmetaram", description: "تنظیمات Qmetaram برای مدیریت ساب‌دامین، پلن و مشخصات فنی حساب است.", keywords: "تنظیمات Qmetaram, subdomain, account settings" },
    en: { title: "Qmetaram Settings", description: "Manage Qmetaram account settings, subdomain options, plan details, and personal configuration from one place.", keywords: "Qmetaram settings, account settings, subdomain, plan configuration" },
    de: { title: "Qmetaram Einstellungen", description: "Verwalten Sie Qmetaram-Kontoeinstellungen, Subdomain-Optionen und Plan-Details zentral.", keywords: "Qmetaram Einstellungen, Konto, Subdomain, Plan" },
    tr: { title: "Qmetaram Ayarları", description: "Qmetaram hesap ayarlarını, subdomain seçeneklerini ve plan ayrıntılarını tek yerden yönetin.", keywords: "Qmetaram ayarlar, hesap ayarları, subdomain, plan" },
  }, { indexable: false }),
  auth: createEntry("/auth", {
    fa: { title: "ورود و ثبت‌نام Qmetaram", description: "صفحه ورود و ثبت‌نام Qmetaram برای دسترسی به داشبورد، چت، اشتراک و قابلیت‌های شخصی است.", keywords: "ورود Qmetaram, ثبت نام Qmetaram, auth" },
    en: { title: "Qmetaram Authentication", description: "Sign in or create a Qmetaram account to access dashboards, subscriptions, and personalized AI workflows.", keywords: "Qmetaram login, Qmetaram sign up, authentication" },
    de: { title: "Qmetaram Anmeldung", description: "Melden Sie sich an oder erstellen Sie ein Qmetaram-Konto für Dashboards, Abos und personalisierte KI-Workflows.", keywords: "Qmetaram Login, Registrierung, Auth" },
    tr: { title: "Qmetaram Giriş ve Kayıt", description: "Panel, abonelik ve kişiselleştirilmiş AI iş akışlarına erişmek için Qmetaram hesabı oluşturun veya giriş yapın.", keywords: "Qmetaram giriş, kayıt, authentication" },
  }, { indexable: false }),
  wallet: createEntry("/wallet", {
    fa: { title: "کیف پول Qmetaram", description: "کیف پول Qmetaram برای مدیریت اعتبار، پرداخت و وضعیت تراکنش‌های پلتفرم طراحی شده است.", keywords: "کیف پول Qmetaram, wallet, AI credits" },
    en: { title: "Qmetaram Wallet", description: "The Qmetaram wallet is designed for credits, balances, payments, and transaction visibility.", keywords: "Qmetaram wallet, credits, AI balance, payments" },
    de: { title: "Qmetaram Wallet", description: "Das Qmetaram-Wallet dient der Verwaltung von Guthaben, Zahlungen und Transaktionen.", keywords: "Qmetaram Wallet, Guthaben, Zahlungen, KI Credits" },
    tr: { title: "Qmetaram Cüzdan", description: "Qmetaram cüzdanı; kredi, bakiye, ödeme ve işlem görünürlüğü için tasarlanmıştır.", keywords: "Qmetaram cüzdan, kredi, ödeme, AI bakiye" },
  }, { indexable: false }),
  exchange: createEntry("/exchange", {
    fa: { title: "Exchange Qmetaram", description: "صفحه Exchange برای مبادله توکن، پرداخت و ابزارهای مالی متصل به اکوسیستم Qmetaram در نظر گرفته شده است.", keywords: "exchange Qmetaram, توکن, مالی" },
    en: { title: "Qmetaram Exchange", description: "Exchange page for token movement, payment context, and financial utilities connected to the Qmetaram ecosystem.", keywords: "Qmetaram exchange, tokens, finance, payments" },
    de: { title: "Qmetaram Exchange", description: "Exchange-Seite für Token-Flows, Zahlungen und Finanzwerkzeuge im Qmetaram-Ökosystem.", keywords: "Qmetaram Exchange, Token, Finanzen, Zahlungen" },
    tr: { title: "Qmetaram Exchange", description: "Qmetaram ekosistemine bağlı token hareketleri, ödeme bağlamı ve finans araçları için exchange sayfası.", keywords: "Qmetaram exchange, token, finans, ödeme" },
  }, { indexable: false }),
  tokens: createEntry("/tokens", {
    fa: { title: "توکن‌های Qmetaram", description: "صفحه توکن‌های Qmetaram برای توضیح دارایی‌های دیجیتال، وضعیت توکن و منطق اقتصادی اکوسیستم است.", keywords: "توکن Qmetaram, token economics" },
    en: { title: "Qmetaram Tokens", description: "Discover token information, digital asset context, and economic logic connected to the Qmetaram ecosystem.", keywords: "Qmetaram tokens, token economics, digital assets" },
    de: { title: "Qmetaram Token", description: "Informationen zu Token, digitalen Assets und wirtschaftlicher Logik im Qmetaram-Ökosystem.", keywords: "Qmetaram Token, Token Economics, digitale Assets" },
    tr: { title: "Qmetaram Tokenları", description: "Qmetaram ekosistemine bağlı token bilgilerini, dijital varlık bağlamını ve ekonomik yapıyı keşfedin.", keywords: "Qmetaram token, token ekonomisi, dijital varlık" },
  }),
  referrals: createEntry("/referrals", {
    fa: { title: "سیستم ارجاع Qmetaram", description: "سیستم referrals کیومتارام برای لینک ارجاع، رشد کاربر و درآمدزایی از معرفی پلتفرم طراحی شده است.", keywords: "referrals Qmetaram, لینک ارجاع, referral system" },
    en: { title: "Qmetaram Referrals", description: "Referral workflows for links, conversions, growth loops, and user acquisition around the Qmetaram platform.", keywords: "Qmetaram referrals, referral system, conversions, growth" },
    de: { title: "Qmetaram Empfehlungen", description: "Referral-Workflows für Links, Konversionen und Nutzerwachstum rund um die Qmetaram-Plattform.", keywords: "Qmetaram Referral, Empfehlungen, Konversionen, Wachstum" },
    tr: { title: "Qmetaram Referans Sistemi", description: "Bağlantılar, dönüşümler ve kullanıcı büyümesi için Qmetaram referans iş akışları.", keywords: "Qmetaram referrals, referans sistemi, dönüşüm, büyüme" },
  }),
  "war-room": createEntry("/war-room", {
    fa: { title: "War Room Qmetaram", description: "اتاق فرمان Qmetaram برای تصمیم‌گیری، عملیات، کنترل استراتژیک و هماهنگی AI در سناریوهای پیشرفته است.", keywords: "war room, اتاق فرمان, Qmetaram strategy" },
    en: { title: "Qmetaram War Room", description: "Strategic control room for advanced operations, coordinated AI actions, and decision workflows inside Qmetaram.", keywords: "Qmetaram war room, strategy, operations, AI coordination" },
    de: { title: "Qmetaram War Room", description: "Strategischer Kontrollraum für fortgeschrittene Abläufe, koordinierte KI-Aktionen und Entscheidungsprozesse.", keywords: "Qmetaram War Room, Strategie, Operationen, KI Koordination" },
    tr: { title: "Qmetaram War Room", description: "Gelişmiş operasyonlar, koordine AI eylemleri ve karar akışları için stratejik kontrol odası.", keywords: "Qmetaram war room, strateji, operasyon, AI koordinasyonu" },
  }, { indexable: false }),
  "ai-assistant": createEntry("/ai-assistant", {
    fa: { title: "AI Assistant Qmetaram", description: "دستیار هوش مصنوعی Qmetaram برای هدایت گفتگو، وظایف، فایل‌ها و عملیات روزمره طراحی شده است.", keywords: "AI Assistant, دستیار هوش مصنوعی, Qmetaram" },
    en: { title: "Qmetaram AI Assistant", description: "An AI assistant layer for guided tasks, chats, file context, and everyday workflows across Qmetaram.", keywords: "AI assistant, Qmetaram assistant, guided AI tasks" },
    de: { title: "Qmetaram KI-Assistent", description: "Eine KI-Assistenten-Ebene für Aufgaben, Chats, Dateikontext und tägliche Workflows in Qmetaram.", keywords: "KI Assistent, Qmetaram Assistent, Aufgaben" },
    tr: { title: "Qmetaram AI Asistan", description: "Görevler, sohbetler, dosya bağlamı ve günlük iş akışları için yapay zeka asistan katmanı.", keywords: "AI asistan, Qmetaram asistan, görev yönetimi" },
  }),
  security: createEntry("/security", {
    fa: { title: "امنیت Qmetaram", description: "مرکز امنیت Qmetaram برای حفاظت حساب، حریم خصوصی، سیاست‌های ایمن و کنترل دسترسی طراحی شده است.", keywords: "امنیت Qmetaram, privacy, account security" },
    en: { title: "Qmetaram Security", description: "Security hub for account protection, privacy expectations, safe operations, and trust signals in Qmetaram.", keywords: "Qmetaram security, privacy, account protection" },
    de: { title: "Qmetaram Sicherheit", description: "Sicherheitsbereich für Kontoschutz, Datenschutz, sichere Abläufe und Vertrauen in Qmetaram.", keywords: "Qmetaram Sicherheit, Datenschutz, Kontoschutz" },
    tr: { title: "Qmetaram Güvenlik", description: "Hesap koruması, gizlilik beklentileri ve güvenli operasyonlar için Qmetaram güvenlik merkezi.", keywords: "Qmetaram güvenlik, gizlilik, hesap koruması" },
  }),
  account: createEntry("/account", {
    fa: { title: "حساب کاربری Qmetaram", description: "صفحه account برای مدیریت هویت، اشتراک، امنیت و تنظیمات اصلی در Qmetaram است.", keywords: "account Qmetaram, حساب کاربری" },
    en: { title: "Qmetaram Account", description: "Manage identity, subscriptions, security, and core user preferences in the Qmetaram account area.", keywords: "Qmetaram account, subscriptions, user settings" },
    de: { title: "Qmetaram Konto", description: "Verwalten Sie Identität, Abos, Sicherheit und Benutzereinstellungen im Qmetaram-Konto.", keywords: "Qmetaram Konto, Abos, Einstellungen" },
    tr: { title: "Qmetaram Hesap", description: "Kimlik, abonelik, güvenlik ve kullanıcı tercihlerini Qmetaram hesap alanında yönetin.", keywords: "Qmetaram hesap, abonelik, kullanıcı ayarları" },
  }, { indexable: false }),
  agents: createEntry("/dashboard/agents", {
    fa: { title: "ایجنت‌های Qmetaram", description: "صفحه Agents برای مدیریت، ایجاد و توسعه ایجنت‌های هوشمند در Qmetaram است.", keywords: "ایجنت هوشمند, agents, Qmetaram" },
    en: { title: "Qmetaram Agents", description: "Manage, create, and organize AI agents inside the Qmetaram workspace and dashboard environment.", keywords: "Qmetaram agents, AI agents, agent manager" },
    de: { title: "Qmetaram Agenten", description: "Verwalten, erstellen und organisieren Sie KI-Agenten innerhalb der Qmetaram-Umgebung.", keywords: "Qmetaram Agenten, KI Agenten, Agent Verwaltung" },
    tr: { title: "Qmetaram Ajanları", description: "Qmetaram çalışma alanında AI ajanlarını yönetin, oluşturun ve düzenleyin.", keywords: "Qmetaram ajanları, AI ajan, ajan yönetimi" },
  }, { indexable: false }),
  compare: createEntry("/compare", {
    fa: { title: "مقایسه مدل‌های AI در Qmetaram", description: "Compare در Qmetaram برای مقایسه مدل‌های هوش مصنوعی، دقت، سرعت و کیفیت الگوریتمی طراحی شده است.", keywords: "compare AI models, مقایسه مدل هوش مصنوعی" },
    en: { title: "Compare AI Models | Qmetaram", description: "Compare AI models by accuracy, speed, depth, and overall quality inside the Qmetaram comparison workspace.", keywords: "compare AI models, Qmetaram compare, model comparison" },
    de: { title: "KI-Modelle vergleichen | Qmetaram", description: "Vergleichen Sie KI-Modelle nach Genauigkeit, Geschwindigkeit, Tiefe und Gesamtqualität in Qmetaram.", keywords: "KI Modelle vergleichen, Qmetaram Vergleich, Modellvergleich" },
    tr: { title: "AI Modellerini Karşılaştır | Qmetaram", description: "Qmetaram karşılaştırma alanında AI modellerini doğruluk, hız, derinlik ve genel kaliteye göre karşılaştırın.", keywords: "AI model karşılaştırma, Qmetaram compare, model comparison" },
  }),
  ideas: createEntry("/ideas", {
    fa: { title: "ایده‌ها و نوآوری در Qmetaram", description: "صفحه Ideas برای ثبت ایده، بررسی ترندها، referral و نوآوری در اکوسیستم Qmetaram است.", keywords: "ایده Qmetaram, innovation, referral, ایده هوش مصنوعی" },
    en: { title: "Ideas and Innovation | Qmetaram", description: "Submit ideas, explore innovation trends, and manage referral-driven growth in the Qmetaram ideas workspace.", keywords: "Qmetaram ideas, innovation, referrals, AI ideas" },
    de: { title: "Ideen und Innovation | Qmetaram", description: "Reichen Sie Ideen ein, erkunden Sie Innovationstrends und verwalten Sie Referral-Wachstum in Qmetaram.", keywords: "Qmetaram Ideen, Innovation, Referral, KI Ideen" },
    tr: { title: "Fikirler ve İnovasyon | Qmetaram", description: "Fikir gönderin, yenilik trendlerini keşfedin ve Qmetaram içinde referral odaklı büyümeyi yönetin.", keywords: "Qmetaram fikirler, inovasyon, referral, AI fikirleri" },
  }),
  "module-detail": createEntry("/modules", {
    fa: { title: "جزئیات ماژول‌های Qmetaram", description: "صفحه module detail برای معرفی قابلیت‌ها، مزایا و عملکرد هر ماژول تخصصی در Qmetaram است.", keywords: "module detail, ماژول Qmetaram, تخصصی AI" },
    en: { title: "Qmetaram Module Details", description: "Detailed module pages explain capabilities, strengths, and practical use cases for every specialist module in Qmetaram.", keywords: "Qmetaram module details, specialist module, AI capabilities" },
    de: { title: "Qmetaram Moduldetails", description: "Detaillierte Modulseiten erklären Fähigkeiten, Stärken und Anwendungsfälle aller Spezialmodule in Qmetaram.", keywords: "Qmetaram Moduldetails, Spezialmodule, KI Fähigkeiten" },
    tr: { title: "Qmetaram Modül Detayları", description: "Detay sayfaları her uzman modülün yeteneklerini, güçlü yönlerini ve kullanım senaryolarını açıklar.", keywords: "Qmetaram modül detayları, uzman modül, AI yetenekleri" },
  }),
  "module-chat": createEntry("/modules/chat", {
    fa: { title: "چت ماژولی Qmetaram", description: "Module chat برای گفتگو با هر ماژول تخصصی و دریافت پاسخ‌های حوزه‌ای در Qmetaram است.", keywords: "module chat, چت ماژول, Qmetaram" },
    en: { title: "Qmetaram Module Chat", description: "Module chat enables focused conversations with specialist assistants across the Qmetaram ecosystem.", keywords: "module chat, specialist chat, Qmetaram module assistant" },
    de: { title: "Qmetaram Modul-Chat", description: "Der Modul-Chat ermöglicht fokussierte Gespräche mit spezialisierten Assistenten im Qmetaram-Ökosystem.", keywords: "Modul Chat, Spezialisten Chat, Qmetaram Assistent" },
    tr: { title: "Qmetaram Modül Sohbeti", description: "Modül sohbeti, Qmetaram ekosistemindeki uzman asistanlarla odaklı konuşmalar sağlar.", keywords: "modül sohbeti, uzman sohbet, Qmetaram asistan" },
  }),
  "ai-tools": createEntry("/ai-tools", {
    fa: { title: "ابزارهای هوش مصنوعی Qmetaram", description: "AI Tools در Qmetaram مجموعه‌ای از ابزارها، ماژول‌ها و راهکارهای هوش مصنوعی قابل استفاده را ارائه می‌کند.", keywords: "AI Tools, ابزار هوش مصنوعی, Qmetaram tools" },
    en: { title: "AI Tools | Qmetaram", description: "Browse practical AI tools, curated module utilities, and usable workflows inside the Qmetaram AI tools section.", keywords: "AI tools, Qmetaram tools, AI utilities, module tools" },
    de: { title: "KI-Tools | Qmetaram", description: "Entdecken Sie praktische KI-Tools, kuratierte Modul-Utilities und nutzbare Workflows in Qmetaram.", keywords: "KI Tools, Qmetaram Tools, KI Utilities, Modul Werkzeuge" },
    tr: { title: "AI Araçları | Qmetaram", description: "Qmetaram AI Tools bölümünde pratik AI araçlarını, modül yardımcılarını ve kullanılabilir iş akışlarını inceleyin.", keywords: "AI araçları, Qmetaram tools, AI utilities, modül araçları" },
  }),
  "ai-model-detail": createEntry("/ai-model", {
    fa: { title: "جزئیات مدل AI در Qmetaram", description: "صفحه جزئیات مدل برای معرفی دقیق‌تر هر مدل هوش مصنوعی، شاخص‌ها و کاربردهای آن در Qmetaram است.", keywords: "AI model detail, جزئیات مدل, Qmetaram model" },
    en: { title: "AI Model Detail | Qmetaram", description: "Review individual AI model details, ranking metrics, provider context, and usage relevance inside Qmetaram.", keywords: "AI model detail, model ranking, provider comparison, Qmetaram" },
    de: { title: "KI-Modell Details | Qmetaram", description: "Prüfen Sie einzelne Modell-Details, Rankings, Anbieter-Kontexte und Anwendungsrelevanz in Qmetaram.", keywords: "KI Modell Details, Modell Ranking, Anbieter Vergleich" },
    tr: { title: "AI Model Detayı | Qmetaram", description: "Qmetaram içinde tekil AI model detaylarını, sıralama metriklerini ve sağlayıcı bağlamını inceleyin.", keywords: "AI model detayı, model sıralama, sağlayıcı karşılaştırma" },
  }),
  q1: createEntry("/q1", {
    fa: { title: "q1 | هسته هوش مصنوعی Qmetaram", description: "q1 موتور مرکزی Qmetaram برای reasoning، ماژول‌های تخصصی و تجربه AI چندلایه است.", keywords: "q1, Qmetaram Core, AI engine, modular AI" },
    en: { title: "q1 | The Core AI Engine", description: "q1 is the central AI engine of Qmetaram, built for modular reasoning, specialist workflows, and structured intelligence.", keywords: "q1, Qmetaram core AI, modular reasoning, AI engine" },
    de: { title: "q1 | Die Kern-KI von Qmetaram", description: "q1 ist die zentrale KI von Qmetaram für modulares Denken, Spezialworkflows und strukturierte Intelligenz.", keywords: "q1, Qmetaram Kern KI, modulares Denken, KI Engine" },
    tr: { title: "q1 | Qmetaram Çekirdek AI Motoru", description: "q1; modüler akıl yürütme, uzman iş akışları ve yapılandırılmış zeka için Qmetaram'ın merkezi AI motorudur.", keywords: "q1, Qmetaram core AI, modüler reasoning, AI engine" },
  }),
  "q-network": createEntry("/q-network", {
    fa: { title: "Q-Network | کهکشان ماژول‌های Qmetaram", description: "Q-Network نمای کهکشانی از ماژول‌های Qmetaram و مسیرهای تخصصی AI در یک نقشه بصری است.", keywords: "Q-Network, کهکشان Qmetaram, AI modules" },
    en: { title: "Q-Network | Qmetaram Galaxy", description: "Q-Network is the galaxy-style view of Qmetaram modules, specialist routes, and connected AI experiences.", keywords: "Q-Network, Qmetaram galaxy, AI modules, ecosystem" },
    de: { title: "Q-Network | Qmetaram Galaxie", description: "Q-Network ist die Galaxie-Ansicht der Qmetaram-Module, Spezialrouten und verbundenen KI-Erlebnisse.", keywords: "Q-Network, Qmetaram Galaxie, KI Module, Ökosystem" },
    tr: { title: "Q-Network | Qmetaram Galaksisi", description: "Q-Network; Qmetaram modüllerinin, uzman rotalarının ve bağlı AI deneyimlerinin galaksi görünümüdür.", keywords: "Q-Network, Qmetaram galaksi, AI modülleri, ekosistem" },
  }),
  samer: createEntry("/samer", {
    fa: { title: "Samer Exchange | صرافی سمیر", description: "Samer Exchange بخش مالی و صرافی هوشمند Qmetaram برای پرداخت، پلن‌ها و خدمات تبادلی است.", keywords: "Samer Exchange, صرافی سمیر, Qmetaram finance" },
    en: { title: "Samer Exchange | Qmetaram Finance", description: "Samer Exchange is the finance and exchange layer connected to Qmetaram plans, payments, and ecosystem flows.", keywords: "Samer Exchange, Qmetaram finance, payments, exchange" },
    de: { title: "Samer Exchange | Qmetaram Finanzen", description: "Samer Exchange ist die Finanz- und Exchange-Schicht für Tarife, Zahlungen und Ökosystem-Flows in Qmetaram.", keywords: "Samer Exchange, Qmetaram Finanzen, Zahlungen, Exchange" },
    tr: { title: "Samer Exchange | Qmetaram Finans", description: "Samer Exchange; Qmetaram planları, ödemeleri ve ekosistem akışlarına bağlı finans ve exchange katmanıdır.", keywords: "Samer Exchange, Qmetaram finans, ödeme, exchange" },
  }),
  "biruni-module": createEntry("/modules/biruni/chat", {
    fa: { title: "Biruni Module Chat", description: "محیط محافظت‌شده گفتگوی ماژول بیرونی برای کاربران دارای دسترسی در Qmetaram.", keywords: "Biruni module, protected health chat" },
    en: { title: "Biruni Protected Module", description: "Protected Biruni module environment for eligible users inside Qmetaram.", keywords: "Biruni protected module, health assistant" },
    de: { title: "Biruni Geschütztes Modul", description: "Geschützte Biruni-Umgebung für berechtigte Nutzer in Qmetaram.", keywords: "Biruni geschütztes Modul, Gesundheitsassistent" },
    tr: { title: "Biruni Korumalı Modül", description: "Qmetaram içinde yetkili kullanıcılar için korumalı Biruni modül alanı.", keywords: "Biruni korumalı modül, sağlık asistanı" },
  }, { indexable: false }),
  "beethoven-module": createEntry("/modules/beethoven/chat", {
    fa: { title: "Beethoven Module Chat", description: "محیط محافظت‌شده ماژول بتهوون برای کاربران دارای پلن فعال در Qmetaram.", keywords: "Beethoven module, protected music studio" },
    en: { title: "Beethoven Protected Module", description: "Protected Beethoven module experience for users with active access inside Qmetaram.", keywords: "Beethoven protected module, music studio" },
    de: { title: "Beethoven Geschütztes Modul", description: "Geschützte Beethoven-Modulumgebung für Nutzer mit aktivem Zugriff in Qmetaram.", keywords: "Beethoven geschütztes Modul, Musikstudio" },
    tr: { title: "Beethoven Korumalı Modül", description: "Aktif erişimi olan kullanıcılar için korumalı Beethoven modül deneyimi.", keywords: "Beethoven korumalı modül, müzik stüdyosu" },
  }, { indexable: false }),
  "da-vinci-module": createEntry("/modules/da-vinci/chat", {
    fa: { title: "Da Vinci Module Chat", description: "محیط محافظت‌شده ماژول داوینچی برای تولید و ویرایش خلاقانه در Qmetaram.", keywords: "Da Vinci module, protected visual studio" },
    en: { title: "Da Vinci Protected Module", description: "Protected Da Vinci module for visual generation and creative workflows inside Qmetaram.", keywords: "Da Vinci protected module, visual studio" },
    de: { title: "Da Vinci Geschütztes Modul", description: "Geschützte Da-Vinci-Umgebung für visuelle Generierung und kreative Workflows in Qmetaram.", keywords: "Da Vinci geschütztes Modul, Visual Studio" },
    tr: { title: "Da Vinci Korumalı Modül", description: "Qmetaram içinde görsel üretim ve yaratıcı iş akışları için korumalı Da Vinci modülü.", keywords: "Da Vinci korumalı modül, görsel stüdyo" },
  }, { indexable: false }),
  "not-found": createEntry("/404", {
    fa: { title: "صفحه پیدا نشد | Qmetaram", description: "صفحه مورد نظر در Qmetaram پیدا نشد. از مسیرهای اصلی سایت برای ادامه استفاده کنید.", keywords: "404, صفحه پیدا نشد, Qmetaram" },
    en: { title: "Page Not Found | Qmetaram", description: "The requested page could not be found on Qmetaram. Continue using the main platform routes.", keywords: "404, page not found, Qmetaram" },
    de: { title: "Seite nicht gefunden | Qmetaram", description: "Die angeforderte Seite wurde in Qmetaram nicht gefunden. Nutzen Sie die Hauptpfade der Plattform.", keywords: "404, Seite nicht gefunden, Qmetaram" },
    tr: { title: "Sayfa Bulunamadı | Qmetaram", description: "İstenen sayfa Qmetaram üzerinde bulunamadı. Lütfen ana platform yollarını kullanın.", keywords: "404, sayfa bulunamadı, Qmetaram" },
  }, { indexable: false }),
};

export function getSeoEntry(pageKey: SeoPageKey): SeoPageEntry {
  return seoContent[pageKey] || seoContent.home;
}
