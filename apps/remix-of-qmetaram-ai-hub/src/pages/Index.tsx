import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ModulesShowcase } from "@/components/ModulesShowcase";
import { MarketplacePreview } from "@/components/MarketplacePreview";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { HOME_HIDDEN_SEO_COPY } from "@/i18n/seo-content";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />
      <main role="main">
        <HeroSection />
        <ModulesShowcase />
        <MarketplacePreview />
        <section className="sr-only" aria-hidden="true">
          <h2>Qmetaram multilingual search content</h2>
          <p lang="fa">{HOME_HIDDEN_SEO_COPY.fa}</p>
          <p lang="en">{HOME_HIDDEN_SEO_COPY.en}</p>
          <p lang="de">{HOME_HIDDEN_SEO_COPY.de}</p>
          <p lang="tr">{HOME_HIDDEN_SEO_COPY.tr}</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
