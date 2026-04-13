import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { invokeQAgent, type QAgentAction, type QAgentLocale } from "@/api/orchestrator";
import { Bot, Coffee, CreditCard, Pizza, Shield } from "lucide-react";

const actionIcons: Record<QAgentAction, typeof Coffee> = {
  prepareCoffee: Coffee,
  orderPizza: Pizza,
  transferMoney: CreditCard,
};

export default function DeviceControl() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [action, setAction] = useState<QAgentAction>("prepareCoffee");
  const [deviceId, setDeviceId] = useState("coffee-maker-01");
  const [amount, setAmount] = useState("250");
  const [locale, setLocale] = useState<QAgentLocale>("fa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(t("q-agent.status.idle"));

  useEffect(() => {
    const resolved = (i18n.resolvedLanguage || i18n.language || "fa").slice(0, 2) as QAgentLocale;
    const nextLocale = ["fa", "en", "de", "tr"].includes(resolved) ? resolved : "fa";
    setLocale(nextLocale);
  }, [i18n.language, i18n.resolvedLanguage]);

  useEffect(() => {
    setStatusMessage(t("q-agent.status.idle"));
  }, [t]);

  const actionOptions = useMemo(
    () => ([
      { value: "prepareCoffee" as const, label: t("q-agent.actions.prepareCoffee") },
      { value: "orderPizza" as const, label: t("q-agent.actions.orderPizza") },
      { value: "transferMoney" as const, label: t("q-agent.actions.transferMoney") },
    ]),
    [t]
  );

  const selectedIcon = actionIcons[action];

  const submit = async () => {
    setIsSubmitting(true);
    setStatusMessage(t("q-agent.processing"));

    try {
      const result = await invokeQAgent({
        action,
        deviceId: deviceId.trim() || undefined,
        amount: action === "transferMoney" ? Number(amount) : undefined,
        locale,
      });

      setStatusMessage(result.localizedMessage || result.message);
      toast({
        title: result.status === "success" ? "Q-Agent" : "Q-Agent Error",
        description: result.localizedMessage || result.message,
        variant: result.status === "success" ? "default" : "destructive",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Q-Agent failed";
      const localized =
        message === "AUTH_REQUIRED"
          ? t("q-agent.authRequired")
          : message === "Q_AGENT_WORKER_URL_MISSING"
            ? t("q-agent.workerMissing")
            : message;

      setStatusMessage(localized);
      toast({ title: "Q-Agent", description: localized, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />

      <main className="relative z-10 container mx-auto px-4 pt-28 pb-16 space-y-8">
        <header className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
            {t("q-agent.badge")}
          </Badge>
          <h1 className="font-orbitron text-4xl md:text-5xl font-bold mb-4 text-gradient-hero">
            {t("q-agent.title")}
          </h1>
          <p className="text-lg text-muted-foreground leading-8">{t("q-agent.subtitle")}</p>
        </header>

        <section className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="glass border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 text-primary mb-2">
                <Bot className="w-5 h-5" />
                <CardTitle className="text-2xl">Q-Agent Orchestrator</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>{t("q-agent.action")}</Label>
                <Select value={action} onValueChange={(value) => setAction(value as QAgentAction)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("q-agent.deviceId")}</Label>
                <Input value={deviceId} onChange={(event) => setDeviceId(event.target.value)} placeholder="coffee-maker-01" />
              </div>

              {action === "transferMoney" && (
                <div className="space-y-2">
                  <Label>{t("q-agent.amount")}</Label>
                  <Input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="1" />
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("q-agent.locale")}</Label>
                <Select value={locale} onValueChange={(value) => {
                  const next = value as QAgentLocale;
                  setLocale(next);
                  void i18n.changeLanguage(next);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fa">فارسی</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="tr">Türkçe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground leading-7">
                {t("q-agent.hint")}
              </div>

              <Button onClick={submit} disabled={isSubmitting} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <selectedIcon className="w-4 h-4 mr-2" />
                {isSubmitting ? t("q-agent.processing") : t("q-agent.submit")}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3 text-primary mb-2">
                  <Shield className="w-5 h-5" />
                  <CardTitle className="text-2xl">{t("q-agent.summaryTitle")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-8">{t("q-agent.summaryBody")}</p>
              </CardContent>
            </Card>

            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-foreground leading-7">
                  {statusMessage}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}