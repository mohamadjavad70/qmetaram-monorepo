import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const resources = {
  fa: {
    translation: {
      "q-agent.badge": "Q-Agent Control",
      "q-agent.title": "Q-Agent برای دستگاه و پرداخت",
      "q-agent.subtitle": "یک مسیر عملیاتی برای ارسال فرمان به دستگاه های متصل و در صورت نیاز، اجرای پرداخت بانکی قبل از ثبت فرمان در Q-Network.",
      "q-agent.action": "عملیات",
      "q-agent.deviceId": "شناسه دستگاه",
      "q-agent.amount": "مبلغ",
      "q-agent.locale": "زبان پاسخ",
      "q-agent.submit": "اجرای عملیات",
      "q-agent.processing": "در حال پردازش درخواست...",
      "q-agent.hint": "برای عملیات مالی، مبلغ و شناسه دستگاه را وارد کنید. برای فرمان های مستقیم IoT فقط شناسه دستگاه کافی است.",
      "q-agent.authRequired": "برای استفاده از Q-Agent باید وارد حساب خود شوید.",
      "q-agent.workerMissing": "آدرس Worker تنظیم نشده است. VITE_Q_AGENT_WORKER_URL را در env قرار دهید.",
      "q-agent.summaryTitle": "جریان اجرا",
      "q-agent.summaryBody": "Q-Agent ابتدا هویت کاربر را تایید می کند، در صورت نیاز با endpoint بانکی صحبت می کند و سپس فرمان را در جدول iot_commands ثبت می کند تا دستگاه یا سرویس مقصد آن را مصرف کند.",
      "q-agent.actions.prepareCoffee": "آماده سازی قهوه",
      "q-agent.actions.orderPizza": "سفارش پیتزا",
      "q-agent.actions.transferMoney": "انتقال وجه و ارسال فرمان",
      "q-agent.status.idle": "آماده اجرای فرمان جدید.",
    },
  },
  en: {
    translation: {
      "q-agent.badge": "Q-Agent Control",
      "q-agent.title": "Q-Agent for devices and payments",
      "q-agent.subtitle": "A real orchestration path for connected devices and banking-aware agent actions before commands enter Q-Network.",
      "q-agent.action": "Action",
      "q-agent.deviceId": "Device ID",
      "q-agent.amount": "Amount",
      "q-agent.locale": "Response locale",
      "q-agent.submit": "Run action",
      "q-agent.processing": "Processing request...",
      "q-agent.hint": "For money transfer actions, provide both amount and device ID. For direct IoT commands, the device ID is enough.",
      "q-agent.authRequired": "You need to sign in before using Q-Agent.",
      "q-agent.workerMissing": "Worker endpoint is not configured. Set VITE_Q_AGENT_WORKER_URL in the environment.",
      "q-agent.summaryTitle": "Execution flow",
      "q-agent.summaryBody": "Q-Agent verifies the user, talks to the banking endpoint when required, and then records the command in iot_commands so the target device or service can consume it.",
      "q-agent.actions.prepareCoffee": "Prepare coffee",
      "q-agent.actions.orderPizza": "Order pizza",
      "q-agent.actions.transferMoney": "Transfer money and dispatch command",
      "q-agent.status.idle": "Ready for the next command.",
    },
  },
  de: {
    translation: {
      "q-agent.badge": "Q-Agent Steuerung",
      "q-agent.title": "Q-Agent für Geräte und Zahlungen",
      "q-agent.subtitle": "Ein echter Orchestrierungspfad für vernetzte Geräte und bankgestützte Agentenaktionen, bevor Befehle in Q-Network gelangen.",
      "q-agent.action": "Aktion",
      "q-agent.deviceId": "Geräte-ID",
      "q-agent.amount": "Betrag",
      "q-agent.locale": "Antwortsprache",
      "q-agent.submit": "Aktion ausführen",
      "q-agent.processing": "Anfrage wird verarbeitet...",
      "q-agent.hint": "Für Geldtransfers müssen Betrag und Geräte-ID gesetzt sein. Für direkte IoT-Befehle reicht die Geräte-ID.",
      "q-agent.authRequired": "Sie müssen angemeldet sein, um Q-Agent zu verwenden.",
      "q-agent.workerMissing": "Worker-Endpunkt ist nicht konfiguriert. Setzen Sie VITE_Q_AGENT_WORKER_URL in der Umgebung.",
      "q-agent.summaryTitle": "Ablauf",
      "q-agent.summaryBody": "Q-Agent verifiziert den Nutzer, spricht bei Bedarf mit dem Bank-Endpunkt und schreibt anschließend den Befehl in iot_commands, damit Gerät oder Dienst ihn verarbeiten kann.",
      "q-agent.actions.prepareCoffee": "Kaffee vorbereiten",
      "q-agent.actions.orderPizza": "Pizza bestellen",
      "q-agent.actions.transferMoney": "Geld übertragen und Befehl senden",
      "q-agent.status.idle": "Bereit für den nächsten Befehl.",
    },
  },
  tr: {
    translation: {
      "q-agent.badge": "Q-Agent Kontrol",
      "q-agent.title": "Cihazlar ve ödemeler için Q-Agent",
      "q-agent.subtitle": "Komutlar Q-Network'e girmeden önce bağlı cihazlar ve banka entegrasyonlu ajan eylemleri için gerçek bir orkestrasyon akışı.",
      "q-agent.action": "Aksiyon",
      "q-agent.deviceId": "Cihaz kimliği",
      "q-agent.amount": "Tutar",
      "q-agent.locale": "Yanıt dili",
      "q-agent.submit": "Aksiyonu çalıştır",
      "q-agent.processing": "İstek işleniyor...",
      "q-agent.hint": "Para transferi işlemleri için hem tutar hem cihaz kimliği gerekir. Doğrudan IoT komutlarında cihaz kimliği yeterlidir.",
      "q-agent.authRequired": "Q-Agent kullanmadan önce oturum açmanız gerekir.",
      "q-agent.workerMissing": "Worker endpoint yapılandırılmamış. Ortama VITE_Q_AGENT_WORKER_URL ekleyin.",
      "q-agent.summaryTitle": "Çalışma akışı",
      "q-agent.summaryBody": "Q-Agent önce kullanıcıyı doğrular, gerekirse banka endpoint'i ile konuşur ve ardından komutu iot_commands tablosuna yazar; böylece hedef cihaz veya servis komutu tüketebilir.",
      "q-agent.actions.prepareCoffee": "Kahve hazırla",
      "q-agent.actions.orderPizza": "Pizza siparişi ver",
      "q-agent.actions.transferMoney": "Para transfer et ve komutu gönder",
      "q-agent.status.idle": "Bir sonraki komut için hazır.",
    },
  },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fa",
    supportedLngs: ["fa", "en", "de", "tr"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "navigator"],
      lookupQuerystring: "lang",
      caches: [],
    },
  });

export default i18n;