import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, MessageSquare, Bot, Lightbulb, CreditCard } from "lucide-react";
import qmetaramLogo from "@/assets/qmetaram-logo.jpg";
import { SEO_CONTACT } from "@/i18n/seo-content";

const publicPhone = import.meta.env.VITE_CONTACT_PHONE?.trim() || SEO_CONTACT.phone;

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border/50 py-12" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="QmetaRam Home">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
                <img 
                  src={qmetaramLogo} 
                  alt="QmetaRam Logo" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-orbitron font-bold text-xl text-gradient-primary">
                  QmetaRam
                </span>
                <span className="text-xs text-muted-foreground">v1.1</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">
              A quantum-modular AI platform with 8 specialized modules for unlimited possibilities.
              Experience decentralized intelligence.
            </p>
            {/* SEO: Internal linking to q1 and Ideas sections */}
            <div className="flex flex-col gap-2">
              <Link 
                to="/q1" 
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                Discover q1 - Our Core AI Technology
              </Link>
              <Link 
                to="/ideas" 
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Lightbulb className="w-4 h-4" />
                Explore Innovative Ideas
              </Link>
            </div>
            <div className="mt-5 rounded-2xl border border-border/50 bg-card/40 p-4 max-w-md">
              <h4 className="font-orbitron font-semibold text-foreground mb-2">Contact</h4>
              <p className="text-sm text-muted-foreground">{SEO_CONTACT.personName} | {SEO_CONTACT.englishName}</p>
              <p className="text-sm text-muted-foreground">
                <a href={`mailto:${SEO_CONTACT.email}`} className="hover:text-primary transition-colors">
                  {SEO_CONTACT.email}
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                {publicPhone ? (
                  <a href={`tel:${publicPhone}`} className="hover:text-primary transition-colors">
                    {publicPhone}
                  </a>
                ) : (
                  "Direct phone: available on request"
                )}
              </p>
            </div>
          </div>

          {/* Quick Links - SEO optimized internal linking */}
          <nav aria-label="Platform navigation">
            <h4 className="font-orbitron font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/q1"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  q1 Core Technology
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  Founder Story
                </Link>
              </li>
              <li>
                <Link
                  to="/vision"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  Q-Network Vision
                </Link>
              </li>
              <li>
                <Link
                  to="/q-agent"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  Q-Agent Control
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-3 h-3" />
                  AI Chat
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-tools"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Bot className="w-3 h-3" />
                  AI Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/ideas"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Lightbulb className="w-3 h-3" />
                  Ideas & Innovation
                </Link>
              </li>
              <li>
                <Link
                  to="/subscriptions"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <CreditCard className="w-3 h-3" />
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources navigation">
            <h4 className="font-orbitron font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/team"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Team 120
                </Link>
              </li>
              <li>
                <Link
                  to="/nodes"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Nodes Map
                </Link>
              </li>
              <li>
                <Link
                  to="/q-agent"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Agent Orchestrator
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  AI Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/compare"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Compare Models
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@qmetaram.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {currentYear} Qmetaram. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { Icon: Github, href: "https://github.com/QMETARAM", label: "GitHub" },
              { Icon: Twitter, href: "https://twitter.com/QMETARAM", label: "Twitter" },
              { Icon: Linkedin, href: "https://linkedin.com/company/qmetaram", label: "LinkedIn" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                aria-label={`Follow QmetaRam on ${label}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
