import { createClient } from "@supabase/supabase-js";

type Locale = "fa" | "en" | "de" | "tr";
type Action = "prepareCoffee" | "orderPizza" | "transferMoney";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  BANK_API_URL: string;
  BANK_TOKEN: string;
};

type Payload = {
  action: Action;
  deviceId?: string;
  amount?: number;
  locale: Locale;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

const messages: Record<Locale, Record<string, string>> = {
  fa: {
    invalidPayload: "درخواست Q-Agent معتبر نیست.",
    authRequired: "برای استفاده از Q-Agent باید وارد حساب شوید.",
    rateLimited: "تعداد درخواست ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.",
    amountRequired: "برای انتقال وجه باید مبلغ معتبر وارد شود.",
    deviceRequired: "برای این عملیات شناسه دستگاه لازم است.",
    bankConfigMissing: "تنظیمات سرویس بانکی کامل نیست.",
    bankFailed: "ارتباط با سرویس بانکی ناموفق بود.",
    commandSaved: "فرمان با موفقیت ثبت شد.",
    transferCompleted: "انتقال وجه انجام شد و فرمان دستگاه ثبت شد.",
    commandFailed: "ثبت فرمان دستگاه ناموفق بود.",
  },
  en: {
    invalidPayload: "Invalid Q-Agent payload.",
    authRequired: "You must be signed in to use Q-Agent.",
    rateLimited: "Too many requests. Please try again shortly.",
    amountRequired: "A valid amount is required for money transfer.",
    deviceRequired: "A device ID is required for this action.",
    bankConfigMissing: "Banking service is not configured.",
    bankFailed: "Banking service request failed.",
    commandSaved: "Command saved successfully.",
    transferCompleted: "Money transfer completed and device command was recorded.",
    commandFailed: "Failed to record the device command.",
  },
  de: {
    invalidPayload: "Ungültige Q-Agent-Anfrage.",
    authRequired: "Sie müssen angemeldet sein, um Q-Agent zu verwenden.",
    rateLimited: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
    amountRequired: "Für Geldtransfers ist ein gültiger Betrag erforderlich.",
    deviceRequired: "Für diese Aktion ist eine Geräte-ID erforderlich.",
    bankConfigMissing: "Der Bankdienst ist nicht konfiguriert.",
    bankFailed: "Die Anfrage an den Bankdienst ist fehlgeschlagen.",
    commandSaved: "Befehl erfolgreich gespeichert.",
    transferCompleted: "Geldtransfer abgeschlossen und Gerätebefehl gespeichert.",
    commandFailed: "Der Gerätebefehl konnte nicht gespeichert werden.",
  },
  tr: {
    invalidPayload: "Geçersiz Q-Agent isteği.",
    authRequired: "Q-Agent kullanmak için oturum açmanız gerekir.",
    rateLimited: "Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.",
    amountRequired: "Para transferi için geçerli bir tutar gerekir.",
    deviceRequired: "Bu işlem için cihaz kimliği gereklidir.",
    bankConfigMissing: "Banka servisi yapılandırılmamış.",
    bankFailed: "Banka servisine istek başarısız oldu.",
    commandSaved: "Komut başarıyla kaydedildi.",
    transferCompleted: "Para transferi tamamlandı ve cihaz komutu kaydedildi.",
    commandFailed: "Cihaz komutu kaydedilemedi.",
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function extractToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const candidate = cookies.find((item) => item.startsWith("q_agent_session=") || item.startsWith("sb-access-token="));
  return candidate ? decodeURIComponent(candidate.split("=")[1] || "") : null;
}

function enforceRateLimit(request: Request, locale: Locale) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.expiresAt < now) {
    rateLimitStore.set(ip, { count: 1, expiresAt: now + 60_000 });
    return null;
  }

  if (current.count >= 20) {
    return jsonResponse({ status: "error", message: "rate_limited", localizedMessage: messages[locale].rateLimited }, 429);
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
  return null;
}

function validatePayload(payload: unknown): payload is Payload {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as Record<string, unknown>;
  return ["prepareCoffee", "orderPizza", "transferMoney"].includes(String(value.action))
    && ["fa", "en", "de", "tr"].includes(String(value.locale));
}

async function verifyUser(token: string, env: Env) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

async function performBankTransfer(payload: Payload, userId: string, env: Env) {
  const response = await fetch(env.BANK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.BANK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      amount: payload.amount,
      locale: payload.locale,
      action: payload.action,
      deviceId: payload.deviceId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "BANK_REQUEST_FAILED");
  }

  const data = await response.json().catch(() => ({}));
  return String(data.reference || data.transactionId || crypto.randomUUID());
}

async function insertIoTCommand(payload: Payload, userId: string, env: Env, bankReference?: string) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from("iot_commands")
    .insert({
      user_id: userId,
      device_id: payload.deviceId,
      action: payload.action,
      amount: payload.amount ?? null,
      locale: payload.locale,
      status: "queued",
      banking_reference: bankReference ?? null,
      metadata: {
        source: "q-agent-worker",
      },
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return jsonResponse({ status: "error", message: "method_not_allowed", localizedMessage: "Method not allowed" }, 405);
    }

    const payload = await request.json().catch(() => null);
    const locale = validatePayload(payload) ? payload.locale : "en";
    const limiter = enforceRateLimit(request, locale);
    if (limiter) return limiter;

    if (!validatePayload(payload)) {
      return jsonResponse({ status: "error", message: "invalid_payload", localizedMessage: messages[locale].invalidPayload }, 400);
    }

    const token = extractToken(request);
    if (!token) {
      return jsonResponse({ status: "error", message: "auth_required", localizedMessage: messages[payload.locale].authRequired }, 401);
    }

    const user = await verifyUser(token, env);
    if (!user) {
      return jsonResponse({ status: "error", message: "auth_required", localizedMessage: messages[payload.locale].authRequired }, 401);
    }

    if (!payload.deviceId) {
      return jsonResponse({ status: "error", message: "device_required", localizedMessage: messages[payload.locale].deviceRequired }, 400);
    }

    if (payload.action === "transferMoney" && (!payload.amount || payload.amount <= 0)) {
      return jsonResponse({ status: "error", message: "amount_required", localizedMessage: messages[payload.locale].amountRequired }, 400);
    }

    try {
      let bankReference: string | undefined;

      if (payload.action === "transferMoney") {
        if (!env.BANK_API_URL || !env.BANK_TOKEN) {
          return jsonResponse({ status: "error", message: "bank_config_missing", localizedMessage: messages[payload.locale].bankConfigMissing }, 500);
        }
        bankReference = await performBankTransfer(payload, user.id, env);
      }

      const commandId = await insertIoTCommand(payload, user.id, env, bankReference);

      const localizedMessage = payload.action === "transferMoney"
        ? messages[payload.locale].transferCompleted
        : messages[payload.locale].commandSaved;

      return jsonResponse({
        status: "success",
        message: localizedMessage,
        localizedMessage,
        commandId,
        bankReference,
      });
    } catch (error) {
      const message = payload.action === "transferMoney" ? messages[payload.locale].bankFailed : messages[payload.locale].commandFailed;
      return jsonResponse({
        status: "error",
        message,
        localizedMessage: message,
        detail: error instanceof Error ? error.message : "Unknown error",
      }, 500);
    }
  },
};