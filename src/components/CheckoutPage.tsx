import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Language } from '../types';

interface CheckoutPageProps {
  lang: Language;
  auth: { isAuthenticated: boolean; token?: string; user?: any };
  initialPlan?: 'starter' | 'pro';
  onClose: () => void;
  onOpenAuthModal: () => void;
}

const STRIPE_PK = 'pk_test_51ULMudCuVv4Dnc23g4SMwOq49DoMFfHgf1BTAbT7C669bz6pfkrajOGzIeJwRgGJxxIa7Su2xWuUB4df6wHWowix0016zhm838';
const API = 'https://elyvori-api.onrender.com';

export function CheckoutPage({ lang, auth, initialPlan = 'starter', onClose, onOpenAuthModal }: CheckoutPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>(initialPlan);
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(auth.user?.name || '');
  const [email, setEmail] = useState(auth.user?.email || '');
  const [stripeLoaded, setStripeLoaded] = useState(false);
  // ELYVORI-PAY-CHECKOUT: pay a plan from the Elyvori Pay wallet
  const [payMethod, setPayMethod] = useState<'card' | 'wallet'>('card');
  const [wallet, setWallet] = useState<{ linked: boolean; usd: string } | null>(null);
  const [wPhone, setWPhone] = useState('');
  const [wPin, setWPin] = useState('');
  const [wBusy, setWBusy] = useState(false);
  const [wError, setWError] = useState('');
  // ELYVORI-PAY-SIGNUP: create a new wallet right here (no app needed)
  const [wMode, setWMode] = useState<'link' | 'create'>('link');
  const [wStep, setWStep] = useState<'phone' | 'details'>('phone');
  const [wCode, setWCode] = useState('');
  const [wDevCode, setWDevCode] = useState('');
  const [wName, setWName] = useState(auth.user?.name || '');
  const [wPin2, setWPin2] = useState('');
  const [wKey] = useState(() => `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
  const cardRef = useRef<any>(null);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const isAr = lang === 'ar';

  const plans = {
    starter: { name: isAr ? 'ستارتر' : 'Starter', price: 19, color: '#00E5FF', shadow: 'rgba(0,229,255,0.3)', gradient: 'linear-gradient(135deg,#00E5FF,#00B8D4)' },
    pro: { name: isAr ? 'برو' : 'Pro', price: 29, color: '#7C3AED', shadow: 'rgba(124,58,237,0.3)', gradient: 'linear-gradient(135deg,#7C3AED,#5B21B6)' },
  };
  const plan = plans[selectedPlan];

  // ELYVORI-CHECKOUT-FIX: the page behind stays still while the checkout is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Load Stripe.js
  useEffect(() => {
    if (window.Stripe) { setStripeLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => setStripeLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Mount Stripe card element when on payment step
  useEffect(() => {
    if (step !== 'payment' || payMethod !== 'card' || !stripeLoaded || cardRef.current?.hasChildNodes()) return;
    const timer = setTimeout(() => {
      try {
        const stripe = (window as any).Stripe(STRIPE_PK);
        stripeRef.current = stripe;
        const elements = stripe.elements({
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: plan.color,
              colorBackground: '#0A0C1A',
              colorText: '#ffffff',
              colorDanger: '#ef4444',
              fontFamily: 'Inter, Cairo, sans-serif',
              borderRadius: '12px',
              spacingUnit: '4px',
            },
          },
        });
        elementsRef.current = elements;
        const card = elements.create('card', {
          style: {
            base: {
              color: '#ffffff',
              fontFamily: 'Inter, Cairo, sans-serif',
              fontSize: '16px',
              '::placeholder': { color: 'rgba(255,255,255,0.3)' },
            },
          },
          hidePostalCode: true,
        });
        card.mount('#stripe-card-element');
        card.on('change', (e: any) => {
          if (e.error) setError(e.error.message);
          else setError('');
        });
      } catch (e) { console.error(e); }
    }, 100);
    return () => clearTimeout(timer);
  }, [step, stripeLoaded, payMethod]);

  const walletAction = async (action: string, params: Record<string, unknown> = {}) => {
    const res = await fetch(`${API}/wallet/chat/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ action, params }),
    });
    if (res.status === 401 || res.status === 403) throw new Error('auth');
    return (await res.json()) as { ok: boolean; code?: string; message_ar: string; message_en: string; data?: any; actions?: any[] };
  };

  const loadWallet = async () => {
    setWError('');
    setWallet(null);
    try {
      const r = await walletAction('balance');
      if (r.code === 'wallet_not_linked') { setWallet({ linked: false, usd: '0' }); return; }
      const usd = (r.data?.wallets || []).find((w: any) => w.currency === 'USD')?.balance ?? '0.00';
      setWallet({ linked: true, usd: String(usd) });
    } catch (e: any) {
      if (e?.message === 'auth') { onOpenAuthModal(); return; }
      setWError(isAr ? 'ما قدرت أوصل للمحفظة، جرّب كمان شوي.' : 'Could not reach the wallet, try again shortly.');
    }
  };

  const chooseWallet = () => {
    if (!auth.isAuthenticated) { onOpenAuthModal(); return; }
    setPayMethod('wallet');
    setError('');
    if (!wallet) loadWallet();
  };

  const linkWallet = async () => {
    if (wBusy) return;
    if (!/^\d{6}$/.test(wPin)) { setWError(isAr ? 'الرمز السري 6 أرقام.' : 'The PIN is 6 digits.'); return; }
    setWBusy(true); setWError('');
    try {
      const res = await fetch(`${API}/wallet/chat/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ phone: wPhone.trim(), pin: wPin }),
      });
      if (res.status === 401 || res.status === 403) { onOpenAuthModal(); return; }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setWError(j?.message === 'pin_locked' ? (isAr ? 'انقفلت المحفظة 15 دقيقة.' : 'Wallet locked for 15 minutes.') : (isAr ? 'رقم الجوال أو الرمز السري غلط.' : 'Wrong phone or PIN.'));
        return;
      }
      setWPin('');
      await loadWallet();
    } catch {
      setWError(isAr ? 'ما قدرت أوصل للسيرفر.' : 'Could not reach the server.');
    } finally {
      setWBusy(false);
    }
  };

  const SIGNUP_ERR: Record<string, [string, string]> = {
    invalid_phone: ['رقم الجوال مش صحيح.', 'Invalid phone number.'],
    too_many_codes: ['طلبت رموز كثيرة، جرّب بعد 10 دقائق.', 'Too many codes, try again in 10 minutes.'],
    invalid_code: ['رمز التحقق غلط أو انتهى.', 'The code is wrong or expired.'],
    phone_taken: ['هالرقم عنده محفظة — اربطها بدل ما تعمل وحدة جديدة.', 'This number already has a wallet — link it instead.'],
    pin_too_simple: ['الرمز السري سهل كثير، اختار غيره.', 'That PIN is too simple.'],
    pin_must_be_6_digits: ['الرمز السري لازم يكون 6 أرقام.', 'The PIN must be 6 digits.'],
    name_required: ['اكتب اسمك.', 'Enter your name.'],
  };
  const signupError = (code: string) => { const e = SIGNUP_ERR[code]; return e ? (isAr ? e[0] : e[1]) : (isAr ? 'صار خطأ، جرّب مرة ثانية.' : 'Something went wrong, try again.'); };

  const sendWalletCode = async () => {
    if (wBusy) return;
    setWBusy(true); setWError('');
    try {
      const res = await fetch(`${API}/wallet/auth/otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: wPhone.trim(), purpose: 'signup' }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setWError(signupError(String(j?.message || ''))); return; }
      setWDevCode(j?.devCode ? String(j.devCode) : '');
      if (j?.devCode) setWCode(String(j.devCode));
      setWStep('details');
    } catch {
      setWError(isAr ? 'ما قدرت أوصل للسيرفر (ممكن يكون نايم) — جرّب بعد دقيقة.' : 'Could not reach the server — try again in a minute.');
    } finally {
      setWBusy(false);
    }
  };

  const createWallet = async () => {
    if (wBusy) return;
    if (wName.trim().length < 2) { setWError(signupError('name_required')); return; }
    if (!/^\d{6}$/.test(wPin)) { setWError(signupError('pin_must_be_6_digits')); return; }
    if (wPin !== wPin2) { setWError(isAr ? 'الرمزين مش متطابقين.' : 'The PINs do not match.'); return; }
    setWBusy(true); setWError('');
    try {
      const res = await fetch(`${API}/wallet/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: wPhone.trim(), code: wCode.trim(), name: wName.trim(), email: auth.user?.email || '', pin: wPin,
          deviceId: `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`, deviceName: 'Elyvori website',
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setWError(signupError(String(j?.message || ''))); if (j?.message === 'phone_taken') { setWMode('link'); setWStep('phone'); } return; }
      // link the new wallet to this Elyvori account, then show its balance
      const link = await fetch(`${API}/wallet/chat/link`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ phone: wPhone.trim(), pin: wPin }) });
      if (link.status === 401 || link.status === 403) { onOpenAuthModal(); return; }
      setWPin(''); setWPin2(''); setWMode('link'); setWStep('phone');
      await loadWallet();
    } catch {
      setWError(isAr ? 'ما قدرت أوصل للسيرفر.' : 'Could not reach the server.');
    } finally {
      setWBusy(false);
    }
  };

  const payFromWallet = async () => {
    if (wBusy) return;
    if (!/^\d{6}$/.test(wPin)) { setWError(isAr ? 'اكتب رمزك السري (6 أرقام).' : 'Enter your 6-digit PIN.'); return; }
    setWBusy(true); setWError('');
    try {
      const r = await walletAction('pay_item', { itemType: 'plan', itemId: selectedPlan, pin: wPin, idempotencyKey: `${wKey}-${selectedPlan}` });
      setWPin('');
      if (r.ok) { setStep('success'); return; }
      if (r.code === 'insufficient_funds') await loadWallet();
      setWError(isAr ? r.message_ar : r.message_en);
    } catch (e: any) {
      if (e?.message === 'auth') { onOpenAuthModal(); return; }
      setWError(isAr ? 'ما قدرت أوصل للسيرفر.' : 'Could not reach the server.');
    } finally {
      setWBusy(false);
    }
  };

  const topUpWallet = async () => {
    if (wBusy || !wallet) return;
    const missing = Math.max(2, Math.ceil((plan.price - Number(wallet.usd)) * 100) / 100);
    setWBusy(true); setWError('');
    try {
      const r = await walletAction('topup', { amount: missing.toFixed(2), currency: 'USD' });
      const url = (r.actions || []).find((a: any) => a.type === 'open_url')?.url;
      if (r.ok && url) { window.open(url, '_blank', 'noopener'); setWError(isAr ? 'بعد ما تدفع بالصفحة اللي انفتحت، ارجع هون واكبس "حدّث الرصيد".' : 'After paying on the page that opened, come back and tap "Refresh balance".'); }
      else setWError(isAr ? r.message_ar : r.message_en);
    } catch (e: any) {
      if (e?.message === 'auth') { onOpenAuthModal(); return; }
      setWError(isAr ? 'ما قدرت أوصل للسيرفر.' : 'Could not reach the server.');
    } finally {
      setWBusy(false);
    }
  };

  const handlePay = async () => {
    if (!auth.isAuthenticated) { onOpenAuthModal(); return; }
    if (!stripeRef.current || !elementsRef.current) return;
    setLoading(true); setError('');
    try {
      // Create payment intent
      const res = await fetch(`${API}/public/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, customerEmail: email, organizationId: auth.user?.organizationId || 'default' }),
      });
      const data = await res.json() as any;
      // If we get a URL, redirect to Stripe hosted page
      if (data.url) { window.location.href = data.url; return; }
      // If we get clientSecret, use Elements
      if (data.clientSecret) {
        const card = elementsRef.current.getElement('card');
        const result = await stripeRef.current.confirmCardPayment(data.clientSecret, {
          payment_method: { card, billing_details: { name, email } },
        });
        if (result.error) { setError(result.error.message); }
        else { setStep('success'); }
      } else {
        setError(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong. Please try again.');
      }
    } catch { setError(isAr ? 'تعذر الاتصال بالخادم' : 'Could not connect. Please try again.'); }
    finally { setLoading(false); }
  };

  return createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .co-overlay{position:fixed;inset:0;z-index:10000;overflow-y:auto;-webkit-overflow-scrolling:touch;background:rgba(2,4,15,0.97);backdrop-filter:blur(24px);}
        .co-wrap{min-height:100%;display:flex;flex-direction:column;align-items:center;padding-bottom:40px;}
        .co-topbar{position:sticky;top:0;z-index:10;width:100%;max-width:480px;background:rgba(2,4,15,0.97);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between;padding:14px 20px;box-sizing:border-box;}
        .co-card{width:100%;max-width:480px;padding:0 16px;box-sizing:border-box;}
        .plan-pill{display:flex;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:100px;padding:4px;gap:4px;}
        .pill-btn{flex:1;padding:10px 16px;border:none;border-radius:100px;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.25s;white-space:nowrap;}
        .pill-cyan{background:linear-gradient(135deg,#00E5FF,#00B8D4);color:#000;box-shadow:0 0 20px rgba(0,229,255,0.35);}
        .pill-purple{background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;box-shadow:0 0 20px rgba(124,58,237,0.35);}
        .pill-off{background:transparent;color:rgba(255,255,255,0.35);}
        .inp{width:100%;padding:15px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#fff;font-size:15px;box-sizing:border-box;outline:none;transition:border 0.2s;font-family:Inter,Cairo,sans-serif;}
        .inp:focus{border-color:var(--plan-color);}
        .inp::placeholder{color:rgba(255,255,255,0.3);}
        .stripe-box{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px;}
        .cta{width:100%;padding:18px;border:none;border-radius:16px;font-size:17px;font-weight:900;cursor:pointer;transition:all 0.3s;font-family:Inter,Cairo,sans-serif;}
        .badge-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
        .badge{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:10px 6px;text-align:center;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px;}
      `}</style>

      <div className="co-overlay" dir={isAr ? 'rtl' : 'ltr'} style={{ '--plan-color': plan.color } as any}>
        <div className="co-wrap">

          {/* Top bar */}
          <div className="co-topbar">
            <button onClick={step === 'payment' ? () => setStep('plan') : onClose} style={{
              background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',
              color:'rgba(255,255,255,0.7)',borderRadius:12,width:38,height:38,
              cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
            }}>
              {step === 'payment' ? (isAr ? '→' : '←') : '✕'}
            </button>
            <div style={{background:'linear-gradient(135deg,#00E5FF,#7C3AED)',borderRadius:10,padding:'6px 16px'}}>
              <span style={{color:'#000',fontSize:14,fontWeight:900,fontFamily:'Inter,sans-serif'}}>ELYVORI</span>
            </div>
            <div style={{width:38}} />
          </div>

          <div className="co-card">

            {/* ═══ STEP 1: PLAN ═══ */}
            {step === 'plan' && (
              <>
                <div style={{textAlign:'center',padding:'28px 0 20px'}}>
                  <h1 style={{color:'#fff',fontSize:26,fontWeight:900,margin:'0 0 6px',fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                    {isAr ? 'اختر خطتك' : 'Choose Your Plan'}
                  </h1>
                  <p style={{color:'rgba(255,255,255,0.4)',fontSize:14,margin:0,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                    {isAr ? 'جميع الوكلاء العشرة — إلغاء في أي وقت' : 'All 10 AI agents — cancel anytime'}
                  </p>
                </div>

                {/* Toggle */}
                <div className="plan-pill" style={{marginBottom:20,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                  <button className={`pill-btn ${selectedPlan==='starter' ? 'pill-cyan' : 'pill-off'}`} onClick={() => setSelectedPlan('starter')}>
                    {isAr ? <>ستارتر — <bdi>$19</bdi></> : 'Starter — $19'}
                  </button>
                  <button className={`pill-btn ${selectedPlan==='pro' ? 'pill-purple' : 'pill-off'}`} onClick={() => setSelectedPlan('pro')}>
                    {isAr ? <>برو — <bdi>$29</bdi> ⭐</> : 'Pro — $29 ⭐'}
                  </button>
                </div>

                {/* Plan card */}
                <div style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${plan.color}30`,borderRadius:20,padding:'24px 20px',marginBottom:16,boxShadow:`0 0 40px ${plan.shadow}15`}}>
                  <div style={{display:'flex',alignItems:'flex-end',gap:8,marginBottom:4}}>
                    <span dir="ltr" style={{fontSize:52,fontWeight:900,lineHeight:1,color:plan.color,fontFamily:'Inter,sans-serif'}}>${plan.price}</span>
                    <span style={{color:'rgba(255,255,255,0.35)',fontSize:15,paddingBottom:8}}>{isAr ? 'شهرياً' : '/mo'}</span>
                  </div>
                  <div style={{height:1,background:'rgba(255,255,255,0.06)',margin:'16px 0'}} />
                  {(isAr
                    ? selectedPlan==='starter'
                      ? ['٥ مشاريع نشطة','جميع الوكلاء العشرة','بناء مواقع وتطبيقات حقيقية','حملات تسويقية ثنائية اللغة','دعم فني بالإيميل']
                      : ['مشاريع غير محدودة','جميع الوكلاء العشرة','بناء ويب وأندرويد مخصص','محرك تسويق مؤسسي','مدير حساب مخصص','ضمان تشغيل ٩٩.٩٪']
                    : selectedPlan==='starter'
                      ? ['5 active projects','All 10 AI agents','Full-stack website & app builds','Bilingual marketing campaigns','Email & chat support']
                      : ['Unlimited projects','All 10 AI agents','Custom web & Android builds','Enterprise marketing engine','Dedicated account manager','99.9% uptime SLA']
                  ).map((f,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <div style={{width:20,height:20,borderRadius:7,flexShrink:0,background:`${plan.color}20`,border:`1px solid ${plan.color}50`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <span style={{color:plan.color,fontSize:11,fontWeight:900}}>✓</span>
                      </div>
                      <span style={{color:'rgba(255,255,255,0.75)',fontSize:14,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="cta"
                  onClick={() => auth.isAuthenticated ? setStep('payment') : onOpenAuthModal()}
                  style={{background:plan.gradient,color:selectedPlan==='starter'?'#000':'#fff',boxShadow:`0 8px 32px ${plan.shadow}`,marginBottom:14}}
                >
                  {isAr ? <>متابعة — <bdi>${plan.price}</bdi> شهرياً ←</> : `Continue — $${plan.price}/mo →`}
                </button>

                <div className="badge-row" style={{marginBottom:16}}>
                  {[{i:'🔒',l:isAr?'دفع آمن':'Secure'},{i:'↩️',l:isAr?'إلغاء مجاني':'Cancel Free'},{i:'⚡',l:isAr?'فوري':'Instant'}].map((b,i)=>(
                    <div key={i} className="badge">
                      <div style={{fontSize:18,marginBottom:3}}>{b.i}</div>
                      <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>{b.l}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══ STEP 2: PAYMENT ═══ */}
            {step === 'payment' && (
              <>
                <div style={{textAlign:'center',padding:'28px 0 20px'}}>
                  <div style={{display:'inline-block',background:plan.gradient,borderRadius:12,padding:'4px 14px',marginBottom:10}}>
                    <span style={{color:selectedPlan==='starter'?'#000':'#fff',fontSize:13,fontWeight:800,fontFamily:'Inter,sans-serif'}}>
                      {plan.name} — <bdi>${plan.price}</bdi>{isAr ? ' شهرياً' : '/mo'}
                    </span>
                  </div>
                  <h1 style={{color:'#fff',fontSize:24,fontWeight:900,margin:'0 0 6px',fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                    {isAr ? 'بيانات الدفع' : 'Payment Details'}
                  </h1>
                  <p style={{color:'rgba(255,255,255,0.4)',fontSize:13,margin:0,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                    {isAr ? 'مشفّر ومحمي بـ Stripe' : 'Encrypted & secured by Stripe'}
                  </p>
                </div>

                <div className="plan-pill" style={{marginBottom:18,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                  <button type="button" className="pill-btn" onClick={() => setPayMethod('card')} style={{background: payMethod==='card' ? plan.gradient : 'transparent', color: payMethod==='card' ? (selectedPlan==='starter' ? '#000' : '#fff') : 'rgba(255,255,255,0.5)'}}>
                    {isAr ? '💳 بطاقة' : '💳 Card'}
                  </button>
                  <button type="button" className="pill-btn" onClick={chooseWallet} style={{background: payMethod==='wallet' ? plan.gradient : 'transparent', color: payMethod==='wallet' ? (selectedPlan==='starter' ? '#000' : '#fff') : 'rgba(255,255,255,0.5)'}}>
                    {isAr ? '👛 محفظة Elyvori Pay' : '👛 Elyvori Pay wallet'}
                  </button>
                </div>
                {payMethod === 'card' && (<>
                <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
                  {/* Name */}
                  <div>
                    <label style={{color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600,display:'block',marginBottom:6,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                      {isAr ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <input
                      className="inp"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={isAr ? 'محمد عبدالله' : 'John Smith'}
                      autoComplete="name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600,display:'block',marginBottom:6,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      className="inp"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      dir="ltr"
                      autoComplete="email"
                      style={{textAlign: isAr ? 'right' : 'left'}}
                    />
                  </div>

                  {/* Card */}
                  <div>
                    <label style={{color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600,display:'block',marginBottom:6,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                      {isAr ? 'بيانات البطاقة' : 'Card Details'}
                    </label>
                    <div className="stripe-box">
                      {!stripeLoaded ? (
                        <div style={{color:'rgba(255,255,255,0.4)',fontSize:14,textAlign:'center',padding:8}}>
                          {isAr ? 'جاري تحميل نموذج الدفع...' : 'Loading payment form...'}
                        </div>
                      ) : (
                        <div id="stripe-card-element" ref={cardRef} />
                      )}
                    </div>
                    <p style={{color:'rgba(255,255,255,0.25)',fontSize:11,margin:'6px 0 0',fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                      {isAr ? <>للاختبار: <bdi dir="ltr">4242 4242 4242 4242</bdi> — أي تاريخ — أي CVV</> : 'Test: 4242 4242 4242 4242 — any date — any CVV'}
                    </p>
                  </div>
                </div>

                {error && (
                  <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:12,padding:'12px 16px',marginBottom:14,color:'#f87171',fontSize:13,textAlign:'center',fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                    {error}
                  </div>
                )}

                <button
                  className="cta"
                  onClick={handlePay}
                  disabled={loading || !name.trim() || !email.trim()}
                  style={{
                    background: loading || !name.trim() || !email.trim() ? 'rgba(255,255,255,0.08)' : plan.gradient,
                    color: loading || !name.trim() || !email.trim() ? 'rgba(255,255,255,0.3)' : selectedPlan==='starter' ? '#000' : '#fff',
                    boxShadow: loading ? 'none' : `0 8px 32px ${plan.shadow}`,
                    cursor: loading || !name.trim() || !email.trim() ? 'not-allowed' : 'pointer',
                    marginBottom:14,
                  }}
                >
                  {loading ? (
                    <><span className="spinner"/>{isAr ? 'جاري المعالجة...' : 'Processing...'}</>
                  ) : (
                    isAr ? <>💳 ادفع <bdi>${plan.price}</bdi> الآن</> : `💳 Pay $${plan.price} Now`
                  )}
                </button>

                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:20}}>
                  <span style={{fontSize:14}}>🔒</span>
                  <span style={{color:'rgba(255,255,255,0.25)',fontSize:11,fontFamily:'Inter,sans-serif'}}>
                    {isAr ? 'مشفّر بـ SSL — لا نحتفظ ببيانات بطاقتك' : 'SSL encrypted — we never store your card'}
                  </span>
                </div>
                </>)}
                {payMethod === 'wallet' && (
                  <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:18,padding:'18px 16px',marginBottom:16,fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                    {!wallet ? (
                      wError ? (
                        <button type="button" onClick={loadWallet} style={{width:'100%',background:'transparent',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.8)',borderRadius:14,padding:12,cursor:'pointer',font:'inherit'}}>
                          {isAr ? '↻ حاول مرة ثانية' : '↻ Try again'}
                        </button>
                      ) : (
                        <div style={{color:'rgba(255,255,255,0.5)',textAlign:'center',padding:10}}>{isAr ? 'جاري تحميل المحفظة… (أول مرة ممكن تاخد دقيقة)' : 'Loading wallet… (the first time can take a minute)'}</div>
                      )
                    ) : !wallet.linked && wMode === 'create' ? (
                      <>
                        <div style={{color:'#fff',fontWeight:800,marginBottom:4}}>{isAr ? 'محفظة جديدة' : 'New wallet'}</div>
                        <p style={{color:'rgba(255,255,255,0.45)',fontSize:13,margin:'0 0 12px'}}>{isAr ? 'بدقيقة وحدة: رقم جوالك، رمز التحقق، واسمك ورمز سري.' : 'One minute: your phone, a code, your name and a PIN.'}</p>
                        {wStep === 'phone' ? (
                          <>
                            <input className="inp" type="tel" dir="ltr" autoComplete="tel" placeholder="0591234567" value={wPhone} onChange={e => setWPhone(e.target.value)} style={{marginBottom:12}} />
                            <button className="cta" type="button" onClick={sendWalletCode} disabled={wBusy} style={{background:plan.gradient,color:selectedPlan==='starter'?'#000':'#fff'}}>
                              {wBusy ? <span className="spinner"/> : (isAr ? 'أرسل رمز التحقق' : 'Send code')}
                            </button>
                          </>
                        ) : (
                          <>
                            {wDevCode && <div style={{color:'#fbbf24',fontSize:12.5,marginBottom:8}}>{isAr ? `وضع تجريبي — الرمز: ${wDevCode}` : `Sandbox — code: ${wDevCode}`}</div>}
                            <input className="inp" type="text" inputMode="numeric" dir="ltr" maxLength={6} placeholder={isAr ? 'رمز التحقق' : 'Verification code'} value={wCode} onChange={e => setWCode(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{marginBottom:10}} />
                            <input className="inp" type="text" autoComplete="name" placeholder={isAr ? 'الاسم الكامل' : 'Full name'} value={wName} onChange={e => setWName(e.target.value)} style={{marginBottom:10}} />
                            <input className="inp" type="password" inputMode="numeric" maxLength={6} dir="ltr" autoComplete="new-password" placeholder={isAr ? 'رمز سري جديد (6 أرقام)' : 'New PIN (6 digits)'} value={wPin} onChange={e => setWPin(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{marginBottom:10}} />
                            <input className="inp" type="password" inputMode="numeric" maxLength={6} dir="ltr" autoComplete="new-password" placeholder={isAr ? 'أكّد الرمز السري' : 'Confirm PIN'} value={wPin2} onChange={e => setWPin2(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{marginBottom:12}} />
                            <button className="cta" type="button" onClick={createWallet} disabled={wBusy} style={{background:plan.gradient,color:selectedPlan==='starter'?'#000':'#fff'}}>
                              {wBusy ? <span className="spinner"/> : (isAr ? 'إنشاء المحفظة' : 'Create wallet')}
                            </button>
                          </>
                        )}
                        <button type="button" onClick={() => { setWMode('link'); setWStep('phone'); setWError(''); }} style={{width:'100%',marginTop:10,background:'transparent',border:0,color:'#22d3ee',cursor:'pointer',font:'inherit',fontSize:13}}>
                          {isAr ? 'عندي محفظة — بدي أربطها' : 'I already have a wallet — link it'}
                        </button>
                      </>
                    ) : !wallet.linked ? (
                      <>
                        <div style={{color:'#fff',fontWeight:800,marginBottom:4}}>{isAr ? 'اربط محفظتك (مرة وحدة)' : 'Link your wallet (one time)'}</div>
                        <p style={{color:'rgba(255,255,255,0.45)',fontSize:13,margin:'0 0 12px'}}>{isAr ? 'رقم جوال محفظة Elyvori Pay ورمزها السري.' : 'Your Elyvori Pay phone number and PIN.'}</p>
                        <input className="inp" type="tel" dir="ltr" autoComplete="tel" placeholder="0591234567" value={wPhone} onChange={e => setWPhone(e.target.value)} style={{marginBottom:10}} />
                        <input className="inp" type="password" inputMode="numeric" maxLength={6} dir="ltr" autoComplete="off" placeholder={isAr ? 'الرمز السري' : 'PIN'} value={wPin} onChange={e => setWPin(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{marginBottom:12}} />
                        <button className="cta" type="button" onClick={linkWallet} disabled={wBusy} style={{background:plan.gradient,color:selectedPlan==='starter'?'#000':'#fff'}}>
                          {wBusy ? <span className="spinner"/> : (isAr ? 'ربط المحفظة' : 'Link wallet')}
                        </button>
                        <button type="button" onClick={() => { setWMode('create'); setWStep('phone'); setWError(''); setWPin(''); }} style={{width:'100%',marginTop:10,background:'transparent',border:0,color:'#22d3ee',cursor:'pointer',font:'inherit',fontSize:13}}>
                          {isAr ? 'ما عندك محفظة؟ أنشئ محفظة جديدة هون ←' : "No wallet yet? Create one here →"}
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                          <span style={{color:'rgba(255,255,255,0.55)',fontSize:14}}>{isAr ? 'رصيد المحفظة' : 'Wallet balance'}</span>
                          <span dir="ltr" style={{color: Number(wallet.usd) >= plan.price ? '#10B981' : '#f87171',fontWeight:900,fontSize:20}}>${wallet.usd}</span>
                        </div>
                        {Number(wallet.usd) >= plan.price ? (
                          <>
                            <input className="inp" type="password" inputMode="numeric" maxLength={6} dir="ltr" autoComplete="off" placeholder={isAr ? 'الرمز السري (6 أرقام)' : 'PIN (6 digits)'} value={wPin}
                              onChange={e => setWPin(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={e => { if (e.key === 'Enter') payFromWallet(); }} style={{marginBottom:12}} />
                            <button className="cta" type="button" onClick={payFromWallet} disabled={wBusy} style={{background:plan.gradient,color:selectedPlan==='starter'?'#000':'#fff',boxShadow:`0 8px 32px ${plan.shadow}`}}>
                              {wBusy ? <span className="spinner"/> : (isAr ? <>👛 ادفع <bdi>${plan.price}</bdi> من المحفظة</> : `👛 Pay $${plan.price} from wallet`)}
                            </button>
                          </>
                        ) : (
                          <>
                            <p style={{color:'rgba(255,255,255,0.5)',fontSize:13,margin:'0 0 12px'}}>{isAr ? 'رصيدك ما بكفي لهالباقة. اشحن الفرق بالبطاقة وبعدين ادفع من المحفظة.' : 'Not enough balance for this plan. Top up the difference by card, then pay from the wallet.'}</p>
                            <button className="cta" type="button" onClick={topUpWallet} disabled={wBusy} style={{background:plan.gradient,color:selectedPlan==='starter'?'#000':'#fff',marginBottom:10}}>
                              {wBusy ? <span className="spinner"/> : (isAr ? '💳 اشحن المحفظة بالبطاقة' : '💳 Top up the wallet by card')}
                            </button>
                            <button type="button" onClick={loadWallet} style={{width:'100%',background:'transparent',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.7)',borderRadius:14,padding:12,cursor:'pointer',font:'inherit'}}>
                              {isAr ? '↻ حدّث الرصيد' : '↻ Refresh balance'}
                            </button>
                          </>
                        )}
                      </>
                    )}
                    {wError && <div style={{color:'#fbbf24',fontSize:13,marginTop:12,textAlign:'center'}}>{wError}</div>}
                  </div>
                )}
              </>
            )}

            {/* ═══ STEP 3: SUCCESS ═══ */}
            {step === 'success' && (
              <div style={{textAlign:'center',padding:'60px 20px'}}>
                <div style={{fontSize:64,marginBottom:20}}>🎉</div>
                <h1 style={{color:'#10B981',fontSize:28,fontWeight:900,margin:'0 0 12px',fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                  {isAr ? 'تم الاشتراك بنجاح!' : 'Payment Successful!'}
                </h1>
                <p style={{color:'rgba(255,255,255,0.5)',fontSize:15,margin:'0 0 32px',fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif'}}>
                  {isAr ? 'مرحباً بك في إليفوري! تفقد إيميلك للتفاصيل.' : 'Welcome to Elyvori! Check your email for details.'}
                </p>
                <button onClick={onClose} style={{
                  background:'linear-gradient(135deg,#10B981,#059669)',color:'#000',
                  border:'none',borderRadius:16,padding:'16px 40px',
                  fontSize:16,fontWeight:900,cursor:'pointer',
                  fontFamily: isAr ? 'Cairo,sans-serif' : 'Inter,sans-serif',
                }}>
                  {isAr ? 'ابدأ الآن 🚀' : 'Get Started 🚀'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

declare global { interface Window { Stripe: any; } }
