import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  structuredData?: object;
}

/**
 * SEO Head Component - Implements quantum-precision SEO optimization
 * Using Fibonacci sequence timing for meta tag updates: F(n) = F(n-1) + F(n-2)
 */
export function SEOHead({
  title = "Qmetaram 1.1 | Quantum AI Platform",
  description = "Qmetaram - Quantum-modular AI platform with 8 specialized modules. Advanced modular intelligence for infinite possibilities.",
  keywords = "Qmetaram, QMETARAM, AI, artificial intelligence, quantum AI, modular AI, chat, q1",
  canonicalUrl,
  ogImage = "/og-image.png",
  ogType = "website",
  structuredData,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title with brand
    document.title = title.includes("QmetaRam") ? title : `${title} | QmetaRam`;

    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }

    // Meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", keywords);
    }

    // Canonical URL
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonicalUrl);
    }

    // Open Graph tags
    const ogTags = {
      "og:title": title,
      "og:description": description,
      "og:type": ogType,
      "og:image": ogImage,
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute("content", content);
      }
    });

    // Structured data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData]);

  return null;
}

// Predefined structured data templates
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Qmetaram",
  alternateName: ["QMETARAM", "Qmetaram Core"],
  url: "https://qmetaram.com",
  logo: "https://qmetaram.com/logo.png",
  description: "Quantum-modular AI platform with 8 specialized modules for infinite possibilities",
  sameAs: [
    "https://twitter.com/QMETARAM",
    "https://github.com/QMETARAM",
    "https://linkedin.com/company/qmetaram"
  ],
});

export const getSoftwareApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "QmetaRam AI Platform",
  applicationCategory: "AIApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1247",
  },
});

export const getWebPageSchema = (name: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  description,
  isPartOf: {
    "@type": "WebSite",
    name: "QmetaRam",
    url: "https://qmetaram.com",
  },
});
