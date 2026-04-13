import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, BarChart3, Scale, Menu, X, Home, ChevronRight, Lightbulb, CreditCard, LogIn, LogOut, Bot, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import qmetaramLogo from "@/assets/qmetaram-logo.jpg";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/chat", label: "Chat", icon: MessageSquare },
  { path: "/marketplace", label: "Marketplace", icon: BarChart3 },
  { path: "/ai-tools", label: "AI Tools", icon: Bot },
  { path: "/ideas", label: "Ideas", icon: Lightbulb },
  { path: "/q-agent", label: "Q-Agent", icon: Cpu },
  { path: "/subscriptions", label: "Pricing", icon: CreditCard },
  { path: "/compare", label: "Compare", icon: Scale },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen ? "glass-strong shadow-lg" : "glass"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="container-safe">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group touch-target">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/50 group-hover:border-primary transition-colors"
              >
                <img 
                  src={qmetaramLogo} 
                  alt="Qmetaram Logo - Quantum AI Platform" 
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-orbitron font-bold text-lg sm:text-xl text-gradient-primary leading-tight">
                  QmetaRam
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:block">v1.1</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium text-sm lg:text-base">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle & Auth Button - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle variant="simple" size="sm" />
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user.user_metadata?.display_name || user.email?.split("@")[0]}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate("/");
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="md:hidden touch-target p-2 text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 56px)" }}
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed left-0 right-0 z-50 md:hidden glass-strong border-b border-border/50 shadow-xl"
              style={{ 
                top: "calc(env(safe-area-inset-top) + 56px)",
                maxHeight: "calc(100vh - env(safe-area-inset-top) - 56px)",
                overflowY: "auto"
              }}
            >
              <div className="container-safe py-4 pb-safe">
                <div className="space-y-2">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-4 rounded-xl transition-all touch-target ${
                            isActive
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "text-foreground hover:bg-muted/50 active:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <item.icon className="w-5 h-5" />
                            <div className="flex flex-col">
                              <span className="font-medium">{item.label}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Theme Toggle in Mobile Menu */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center justify-between px-4 py-4 mt-2 rounded-xl bg-muted/30"
                >
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle variant="dropdown" size="sm" />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-6"
                >
                  {user ? (
                    <Button 
                      size="lg"
                      variant="outline"
                      className="w-full h-14"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setMobileMenuOpen(false);
                        navigate("/");
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        size="lg"
                        className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-14"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In / Sign Up
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
