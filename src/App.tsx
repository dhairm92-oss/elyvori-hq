import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FloatingSideLogo } from './components/FloatingSideLogo';
import { Hero } from './components/Hero';
import { LiveStatsSection } from './components/LiveStatsSection';
import { ServicesSection } from './components/ServicesSection';
import { SocialProofSection } from './components/SocialProofSection';
import { BeforeAfterSection } from './components/BeforeAfterSection';
import { PricingSection } from './components/PricingSection';
import { ContactDemoSection } from './components/ContactDemoSection';
import { Footer } from './components/Footer';
import { CustomProductSection } from './components/CustomProductSection';
import { CyberFirewallWidget } from './components/CyberFirewallWidget';
import { VoiceWidget } from "./components/VoiceWidget";
import { LoginGateModal } from './components/LoginGateModal';
import { CareerAgentPage } from './components/CareerAgentPage';
import { ContractAnalyzerPage } from './components/ContractAnalyzerPage';
import { CustomerSupportPage } from './components/CustomerSupportPage';
import { NegotiationPage } from './components/NegotiationPage';
import { KanbanBoard } from './components/KanbanBoard';
import { CheckoutPage } from './components/CheckoutPage';
import { Language, Theme, AuthState } from './types';
import { translations } from './translations';
import { ShieldCheck } from 'lucide-react';
import { ProjectTracker } from './components/ProjectTracker';

export default function App() {
  // Theme state: defaults to dark for premium look, saved in localStorage
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('elyvori_theme') === 'light' ? 'light' : 'dark'));

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
  const [showNegotiation, setShowNegotiation] = useState<boolean>(false);
  const [showKanban, setShowKanban] = useState<boolean>(false);
  const [showTracker, setShowTracker] = useState<boolean>(false);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'starter' | 'pro'>('starter');
  const [trackerTaskId, setTrackerTaskId] = useState<string | undefined>(undefined);
  const [trackerClientName, setTrackerClientName] = useState<string>('');
  const [trackerClientEmail, setTrackerClientEmail] = useState<string>('');
  const [trackerContractId, setTrackerContractId] = useState<string>('');

  // Sync theme class to document
  useEffect(() => {
    localStorage.setItem('elyvori_theme', theme);
    /* ELYVORI-THEME-SYNC */ {
      const root = document.documentElement;
      const isDarkTheme = theme === 'dark';
      root.classList.add('theme-anim');
      root.classList.toggle('dark', isDarkTheme);
      root.classList.toggle('light', !isDarkTheme);
      root.style.colorScheme = isDarkTheme ? 'dark' : 'light';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDarkTheme ? '#080A12' : '#F6F8FC');
      window.setTimeout(() => root.classList.remove('theme-anim'), 450);
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


  // ELYVORI-ASSISTANT-ACTIONS: the AI chat (VoiceWidget) can open pages and modals
  useEffect(() => {
    const onAssistantAction = (e: Event) => {
      const type = (e as CustomEvent).detail?.type;
      if (type === 'auth') setIsAuthModalOpen(true);
      if (type === 'career') setShowCareerAgent(true);
      if (type === 'contract') setShowContractAnalyzer(true);
      if (type === 'support') setShowCustomerSupport(true);
      if (type === 'negotiation') setShowNegotiation(true);
      if (type === 'tracker') setShowTracker(true);
    };
    window.addEventListener('elyvori:action', onAssistantAction);
    return () => window.removeEventListener('elyvori:action', onAssistantAction);
  }, []);

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

      {/* 3D Holographic Monumental Background Name (Elyvori) with Gyro/Mouse Perspective */}

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
        onOpenNegotiation={() => setShowNegotiation(true)}
        onOpenKanban={() => setShowKanban(true)}
        onOpenTracker={() => setShowTracker(true)}
      />

      {/* Main Page Layout */}
      {showCheckout && (
        <CheckoutPage
          lang={lang}
          auth={auth}
          initialPlan={checkoutPlan}
          onClose={() => setShowCheckout(false)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}
      {showTracker ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
          <button
            onClick={() => setShowTracker(false)}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 10000,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', borderRadius: '50%', width: 40, height: 40,
              cursor: 'pointer', fontSize: 18,
            }}
           aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}>✕</button>
          <ProjectTracker lang={lang} token={auth.token || ''} taskId={trackerTaskId} clientName={trackerClientName} clientEmail={trackerClientEmail} contractId={trackerContractId} />
        </div>
      ) : showKanban && auth.token ? (
        <div className="min-h-screen bg-[#0A0A14] p-6">
          <button onClick={() => setShowKanban(false)} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2 text-sm">
            {lang === 'ar' ? '→ رجوع' : '← Back'}
          </button>
          <KanbanBoard lang={lang} token={auth.token} />
        </div>
      ) : showNegotiation ? (
        <NegotiationPage lang={lang} onBack={() => setShowNegotiation(false)} />
      ) : showCustomerSupport ? (
        <CustomerSupportPage lang={lang} onBack={() => setShowCustomerSupport(false)} />
      ) : showContractAnalyzer ? (
        <ContractAnalyzerPage lang={lang} onBack={() => setShowContractAnalyzer(false)} />
      ) : showCareerAgent ? (
        <CareerAgentPage lang={lang} onBack={() => setShowCareerAgent(false)} />
      ) : (
      <main className="relative z-10">

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
            onOpenCheckout={(plan) => {
              setCheckoutPlan(plan);
              setShowCheckout(true);
            }}
            onSelectPlan={(_planId) => {
              if (!auth.isAuthenticated) {
                setIsAuthModalOpen(true);
              } else {
                scrollTo('demo');
              }
            }}
          />

        {/* Contact / Demo Form (POST to https://elyvori-api.onrender.com/public/demo-request) */}
        <CustomProductSection lang={lang} />

        <ContactDemoSection
            lang={lang}
            onOpenTracker={(tid) => { setTrackerTaskId(tid); setShowTracker(true); }}
            onTrackerClientInfo={(name, email, contractId) => {
              setTrackerClientName(name);
              setTrackerClientEmail(email);
              setTrackerContractId(contractId);
            }}
          />
      </main>
      )}

      {/* Footer */}
      <Footer lang={lang} theme={theme} />

      {/* AI Chat Widget */}
      <VoiceWidget lang={lang} />


      {/* Autonomous Cyber Firewall Security Shield */}

      {/* Login Gate Modal (POST to /auth/login and /auth/signup) */}
      <LoginGateModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        theme={theme}
        auth={auth}
        onSuccessAuth={handleSuccessAuth}
      />


    </div>
  );
}





