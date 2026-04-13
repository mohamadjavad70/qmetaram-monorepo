import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_SEO_LOCALE,
  SEO_CONTACT,
  SEO_FOUNDER,
  SUPPORTED_SEO_LOCALES,
  type SeoPageKey,
  type SupportedSeoLocale,
  getSeoEntry,
} from "@/i18n/seo-content";

type SEOProps = {
  pageKey: SeoPageKey;
  titleOverride?: string;
  descriptionOverride?: string;
  canonicalPathOverride?: string;
  imageUrl?: string;
  schemaNameOverride?: string;
};

const LOCALE_CODES: Record<SupportedSeoLocale, string> = {
  fa: "fa_IR",
  en: "en_US",
  de: "de_DE",
  tr: "tr_TR",
};

const CONTACT_NAME = import.meta.env.VITE_CONTACT_NAME?.trim() || SEO_FOUNDER.englishName;
const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE?.trim() || SEO_CONTACT.phone;

function normalizeLocale(langValue: string | null): SupportedSeoLocale {
  if (!langValue) return DEFAULT_SEO_LOCALE;
  const normalized = langValue.toLowerCase();
  if (SUPPORTED_SEO_LOCALES.includes(normalized as SupportedSeoLocale)) {
    return normalized as SupportedSeoLocale;
  }
  return DEFAULT_SEO_LOCALE;
}

function buildLocaleUrl(pathname: string, locale: SupportedSeoLocale): string {
  const cleanPath = pathname === "/" ? "" : pathname;
  return locale === DEFAULT_SEO_LOCALE
    ? `https://qmetaram.com${cleanPath || "/"}`
    : `https://qmetaram.com${cleanPath || "/"}?lang=${locale}`;
}

function buildJsonLd(
  pageKey: SeoPageKey,
  locale: SupportedSeoLocale,
  canonicalUrl: string,
  pageTitle: string,
  pageDescription: string,
  schemaNameOverride?: string
) {
  const contactPoint: Record<string, unknown> = {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: SEO_CONTACT.email,
    availableLanguage: SEO_FOUNDER.languages,
  };

  if (CONTACT_PHONE) {
    contactPoint.telephone = CONTACT_PHONE;
  }

  const webPage = {
    "@context": "https://schema.org",
    "@type": pageKey === "home" ? "WebSite" : "WebPage",
    name: schemaNameOverride || pageTitle,
    url: canonicalUrl,
    inLanguage: locale,
    description: pageDescription,
    about: SEO_CONTACT.organization,
    publisher: {
      "@type": "Organization",
      name: SEO_CONTACT.organization,
      url: "https://qmetaram.com",
      logo: {
        "@type": "ImageObject",
        url: "https://qmetaram.com/logo.png",
      },
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_CONTACT.organization,
    description: "Qmetaram builds modular AI systems, Q-Agents, and the Q-Network vision for structured private internet and IoT orchestration.",
    founder: {
      "@type": "Person",
      name: CONTACT_NAME,
      alternateName: SEO_FOUNDER.personName,
      jobTitle: SEO_FOUNDER.roleEn,
      birthPlace: {
        "@type": "Place",
        name: SEO_FOUNDER.birthPlace,
      },
      homeLocation: {
        "@type": "Place",
        name: SEO_FOUNDER.currentBase,
      },
      knowsLanguage: SEO_FOUNDER.languages,
      knowsAbout: SEO_FOUNDER.publicFocus,
      description: "Founder of Qmetaram and Q-Network, focused on AI agents, systems optimization, and private internet infrastructure.",
    },
    url: "https://qmetaram.com",
    logo: "https://qmetaram.com/logo.png",
    sameAs: SEO_CONTACT.socials,
    areaServed: ["Middle East", "Europe", "Africa"],
    contactPoint: [contactPoint],
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Qmetaram",
        item: buildLocaleUrl("/", locale),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: schemaNameOverride || pageTitle,
        item: canonicalUrl,
      },
    ],
  };

  const founderProfile = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: CONTACT_NAME,
    alternateName: SEO_FOUNDER.personName,
    jobTitle: SEO_FOUNDER.roleEn,
    birthPlace: SEO_FOUNDER.birthPlace,
    homeLocation: SEO_FOUNDER.currentBase,
    knowsLanguage: SEO_FOUNDER.languages,
    knowsAbout: SEO_FOUNDER.publicFocus,
    worksFor: {
      "@type": "Organization",
      name: SEO_CONTACT.organization,
    },
  };

  const schemas = [organization, webPage, breadcrumb];

  if (["about", "vision", "team", "nodes"].includes(pageKey)) {
    schemas.push(founderProfile);
  }

  return schemas;
}

export function SEO({
  pageKey,
  titleOverride,
  descriptionOverride,
  canonicalPathOverride,
  imageUrl = "https://qmetaram.com/og-image.png",
  schemaNameOverride,
}: SEOProps) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const locale = normalizeLocale(searchParams.get("lang"));
  const entry = getSeoEntry(pageKey);
  const translation = entry.translations[locale];
  const title = titleOverride || translation.title;
  const description = descriptionOverride || translation.description;
  const keywords = translation.keywords;
  const canonicalPath = canonicalPathOverride || location.pathname || entry.path;
  const canonicalUrl = buildLocaleUrl(canonicalPath, locale);
  const shouldIndex = entry.indexable !== false;
  const jsonLd = buildJsonLd(pageKey, locale, canonicalUrl, title, description, schemaNameOverride);

  return (
    <Helmet>
      <html lang={locale} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={CONTACT_NAME} />
      <meta name="robots" content={shouldIndex ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,nofollow"} />
      <meta name="googlebot" content={shouldIndex ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" : "noindex,nofollow"} />
      <meta property="og:type" content={entry.type || "website"} />
      <meta property="og:site_name" content="Qmetaram" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content={LOCALE_CODES[locale]} />
      {SUPPORTED_SEO_LOCALES.filter((item) => item !== locale).map((item) => (
        <meta key={item} property="og:locale:alternate" content={LOCALE_CODES[item]} />
      ))}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <link rel="canonical" href={canonicalUrl} />
      {SUPPORTED_SEO_LOCALES.map((item) => (
        <link key={item} rel="alternate" hrefLang={item} href={buildLocaleUrl(canonicalPath, item)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={buildLocaleUrl(canonicalPath, DEFAULT_SEO_LOCALE)} />
      {jsonLd.map((schema, index) => (
        <script key={`${pageKey}-${locale}-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}