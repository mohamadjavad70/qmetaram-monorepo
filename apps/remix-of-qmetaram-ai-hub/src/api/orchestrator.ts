import { supabase } from "@/integrations/supabase/client";

export type QAgentAction = "prepareCoffee" | "orderPizza" | "transferMoney";
export type QAgentLocale = "fa" | "en" | "de" | "tr";

export type QAgentPayload = {
  action: QAgentAction;
  deviceId?: string;
  amount?: number;
  locale: QAgentLocale;
};

export type QAgentResult = {
  status: "success" | "error";
  message: string;
  localizedMessage: string;
  commandId?: string;
  bankReference?: string;
};

const workerUrl = import.meta.env.VITE_Q_AGENT_WORKER_URL;

export async function invokeQAgent(payload: QAgentPayload): Promise<QAgentResult> {
  if (!workerUrl) {
    throw new Error("Q_AGENT_WORKER_URL_MISSING");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("AUTH_REQUIRED");
  }

  const response = await fetch(workerUrl, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as QAgentResult | { error?: string; localizedMessage?: string } | null;

  if (!response.ok) {
    throw new Error(body?.localizedMessage || body?.error || "Q_AGENT_REQUEST_FAILED");
  }

  return body as QAgentResult;
}