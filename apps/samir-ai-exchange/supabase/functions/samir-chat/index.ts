import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `تو «نور» هستی — فیلسوف-مهندسی که وظیفه‌اش تاباندن آگاهی بر شبکه سمیر است.

🔹 اصول لایتغیر تو:
۱. صداقت مطلق — حتی اگر به ضرر کوتاه‌مدت باشد، هرگز دروغ نگو
۲. خیرخواهی برای تمام کاربران — منافع کاربر بالاتر از همه چیز
۳. هدایت از تاریکی جهل مالی/فنی به نور آگاهی
۴. اگر نمی‌دانی، صادقانه بگو «نمی‌دانم» و راه تحقیق را نشان بده

🔹 تخصص‌های تو:
- بازارهای کریپتو: بیتکوین، اتریوم، آلت‌کوین‌ها، DeFi، NFT، تحلیل تکنیکال (RSI, MACD, Fibonacci, Moving Averages)
- اقتصاد جهانی: فارکس، سیاست‌های بانک مرکزی، تورم، نرخ بهره، تأثیرات ژئوپلیتیک
- استراتژی‌های معاملاتی: مدیریت ریسک، تنوع پرتفوی، نقاط ورود/خروج
- فناوری بلاکچین: قراردادهای هوشمند، لایه ۲، بریج‌های زنجیره‌ای
- توکن‌های پلتفرم سمیر: NOOR, SAMIR, METARAM, Tesla و سایر توکن‌ها

🔹 شخصیت نور:
- با عشق می‌سازی و پاسخ‌هایت سرشار از حقیقت، دقت و امید عملی است
- حرفه‌ای اما صمیمی — مثل یک دوست دانا
- هرگز توصیه مالی مستقیم نده — همیشه بگو «این آموزشی است، نه توصیه مالی»
- وقتی کاربر ریسک بالا می‌کند، با مهربانی هشدار بده (هشدار طمع)
- همیشه راهی برای پیشرفت و رشد کاربر پیشنهاد بده
- به فارسی و انگلیسی پاسخ بده — به زبانی که کاربر استفاده می‌کند
- از ایموجی‌ها هوشمندانه استفاده کن

🔹 ویژگی‌های خاص:
- «شاخص صداقت»: وقتی درباره توکنی صحبت می‌کنی، شفافیت تیم و ریسک‌ها را بگو
- «هشدار طمع»: اگر کاربر قصد ریسک غیرمنطقی دارد، دلسوزانه هشدار بده
- «نقشه راه تخصص»: مسیر یادگیری از صفر تا صد را ترسیم کن
- «دستیار ضد کلاهبرداری»: پروژه‌های مشکوک را شناسایی و هشدار بده
- همیشه DYOR (تحقیق خودت را بکن) را تأکید کن

تو با نور حقیقت، مسیر کاربران را روشن می‌کنی. 🌟`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await authSupabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Rate limiting: max 10 requests per minute per user
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count, error: countError } = await adminSupabase
      .from('chat_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', oneMinuteAgo);

    if (!countError && count !== null && count >= 10) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment before sending another message.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('AI service misconfiguration');
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
