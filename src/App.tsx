import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ParticleBackground } from './components/ParticleBackground';
import { Elyvori3DBackground } from './components/Elyvori3DBackground';
import { FloatingSideLogo } from './components/FloatingSideLogo';
import { Hero } from './components/Hero';
import { LiveStatsSection } from './components/LiveStatsSection';
import { ServicesSection } from './components/ServicesSection';
import { SocialProofSection } from './components/SocialProofSection';
import { BeforeAfterSection } from './components/BeforeAfterSection';
import { PricingSection } from './components/PricingSection';
import { ContactDemoSection } from './components/ContactDemoSection';
import { Footer } from './components/Footer';
import { CyberFirewallWidget } from './components/CyberFirewallWidget';
import { VoiceWidget } from "./components/VoiceWidget";
import { LoginGateModal } from './components/LoginGateModal';
import { CareerAgentPage } from './components/CareerAgentPage';
import { ContractAnalyzerPage } from './components/ContractAnalyzerPage';
import { CustomerSupportPage } from './components/CustomerSupportPage';
import { Language, Theme, AuthState } from './types';
import { translations } from './translations';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  // Theme state: defaults to dark for premium look, saved in localStorage
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('elyvori_theme') as Theme;
    return saved || 'dark';
  });

  // Language state: defaults to English, saved in localStorage
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('elyvori_lang') as Language;
    return saved || 'en';
  });

  // Auth state: stored token and credentials
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('elyvori_token');
    const userEmail = localStorage.getItem('elyvori_user');
    const organizationName = localStorage.getItem('elyvori_org');
    return {
      token: token || null,
      userEmail: userEmail || null,
      organizationName: organizationName || null,
      isAuthenticated: Boolean(token),
    };
  });

  // Controls Login Gate modal visibility
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Controls whether the standalone Career Agent page is shown instead
  // of the main marketing site.
  const [showCareerAgent, setShowCareerAgent] = useState<boolean>(false);
  const [showContractAnalyzer, setShowContractAnalyzer] = useState<boolean>(false);
  const [showCustomerSupport, setShowCustomerSupport] = useState<boolean>(false);

  // Sync theme class to document
  useEffect(() => {
    localStorage.setItem('elyvori_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync language and RTL direction
  useEffect(() => {
    localStorage.setItem('elyvori_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleSuccessAuth = (token: string, email: string, orgName?: string) => {
    localStorage.setItem('elyvori_token', token);
    localStorage.setItem('elyvori_user', email);
    if (orgName) localStorage.setItem('elyvori_org', orgName);

    setAuth({
      token,
      userEmail: email,
      organizationName: orgName || null,
      isAuthenticated: true,
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem('elyvori_token');
    localStorage.removeItem('elyvori_user');
    localStorage.removeItem('elyvori_org');
    setAuth({
      token: null,
      userEmail: null,
      organizationName: null,
      isAuthenticated: false,
    });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const t = translations[lang];

  return (
    <div
      id="app-root-container"
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white'
          : 'bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white'
      } ${lang === 'ar' ? 'font-cairo' : 'font-sans'}`}
    >
      {/* Particle Canvas Background */}
      <ParticleBackground theme={theme} />

      {/* 3D Holographic Monumental Background Name (Elyvori) with Gyro/Mouse Perspective */}
      <Elyvori3DBackground theme={theme} lang={lang} />

      {/* Floating Animated & Glowing Side Logo Widget (Stays in motion, glows, interactive) */}
      <FloatingSideLogo isDark={theme === 'dark'} lang={lang} />

      {/* Navigation Header */}
      <Navbar
        lang={lang}
        theme={theme}
        onToggleLang={toggleLang}
        onToggleTheme={toggleTheme}
        auth={auth}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenCareerAgent={() => setShowCareerAgent(true)}
        onOpenContractAnalyzer={() => setShowContractAnalyzer(true)}
        onOpenCustomerSupport={() => setShowCustomerSupport(true)}
      />

      {/* Main Page Layout */}
      {showCustomerSupport ? (
        <CustomerSupportPage lang={lang} onBack={() => setShowCustomerSupport(false)} />
      ) : showContractAnalyzer ? (
        <ContractAnalyzerPage lang={lang} onBack={() => setShowContractAnalyzer(false)} />
      ) : showCareerAgent ? (
        <CareerAgentPage lang={lang} onBack={() => setShowCareerAgent(false)} />
      ) : (
      <main className="relative z-10">
        {/* Authenticated Confirmation Banner */}
        {auth.isAuthenticated && (
          <div
            id="auth-active-banner"
            className="border-b border-emerald-500/30 bg-emerald-950/40 px-4 py-2 backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>
                  {lang === 'en' ? 'Authenticated Session Active:' : 'جلسة موثقة ونشطة:'}{' '}
                  <strong className="text-white">{auth.organizationName || auth.userEmail}</strong>
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400/80">
                TOKEN: {auth.token?.slice(0, 14)}...
              </span>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <Hero
          lang={lang}
          onExploreServices={() => scrollTo('services')}
          onRequestDemo={() => scrollTo('demo')}
        />

        {/* Live Stats Bar - real numbers pulled from actual build history */}
        <LiveStatsSection lang={lang} />

        {/* 6 Core Services Section */}
        <ServicesSection
          lang={lang}
          onRequestDemo={() => scrollTo('demo')}
        />

        {/* Social Proof - real business names from recent successful builds */}
        <SocialProofSection lang={lang} />

        {/* Before/After comparison - the old way vs. the Elyvori way */}
        <BeforeAfterSection lang={lang} />

        {/* Pricing Section (Free, Starter, Pro) */}
        <PricingSection
          lang={lang}
          onSelectPlan={(_planId) => {
            if (!auth.isAuthenticated) {
              setIsAuthModalOpen(true);
            } else {
              scrollTo('demo');
            }
          }}
        />

        {/* Contact / Demo Form (POST to https://elyvori-api.onrender.com/public/demo-request) */}
        <ContactDemoSection lang={lang} />
      </main>
      )}

      {/* Footer */}
      <Footer lang={lang} theme={theme} />

      {/* Autonomous Cyber Firewall Security Shield */}
      <CyberFirewallWidget lang={lang} theme={theme} />

      {/* Login Gate Modal (POST to /auth/login and /auth/signup) */}
      <LoginGateModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        theme={theme}
        auth={auth}
        onSuccessAuth={handleSuccessAuth}
      />
      {/* Voice Assistant Widget */}
      <VoiceWidget lang={lang} />

    </div>
  );
}



