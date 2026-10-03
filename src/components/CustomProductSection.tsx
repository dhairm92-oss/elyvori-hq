import { useState } from 'react';
import { Language } from '../types';

interface CustomProductSectionProps {
  lang: Language;
}

type Step = 'form' | 'generating' | 'ready' | 'success';

const INTERESTS = [
  { en: 'Mindfulness & Meditation', ar: 'اليقظة والتأمل', emoji: '🧘' },
  { en: 'Nature & Flowers', ar: 'الطبيعة والأزهار', emoji: '🌸' },
  { en: 'Animals & Pets', ar: 'الحيوانات والحيوانات الأليفة', emoji: '🐾' },
  { en: 'Fantasy & Magic', ar: 'الخيال والسحر', emoji: '✨' },
  { en: 'Travel & Adventure', ar: 'السفر والمغامرة', emoji: '🌍' },
  { en: 'Stress Relief', ar: 'تخفيف التوتر', emoji: '💆' },
  { en: 'Kids & Family', ar: 'الأطفال والعائلة', emoji: '👨‍👩‍👧' },
  { en: 'Art & Creativity', ar: 'الفن والإبداع', emoji: '🎨' },
];

const PRODUCT_TYPES = [
  { id: 'coloring_book', en: 'Coloring Book', ar: 'كتاب تلوين', emoji: '🖍️' },
  { id: 'guide', en: 'Personal Guide', ar: 'دليل شخصي', emoji: '📖' },
  { id: 'planner', en: 'Custom Planner', ar: 'مخطط مخصص', emoji: '📅' },
  { id: 'activity_kit', en: 'Activity Kit', ar: 'مجموعة أنشطة', emoji: '🎯' },
];

const API = 'https://elyvori-api.onrender.com';

const STEPS_EN = [
  'Analyzing your interests...',
  'Designing your personalized cover...',
  'Writing your unique content...',
  'Building your PDF...',
  'Adding finishing touches...',
];

const STEPS_AR = [
  'تحليل اهتماماتك...',
  'تصميم غلافك المخصص...',
  'كتابة محتواك الفريد...',
  'بناء ملف PDF الخاص بك...',
  'إضافة اللمسات الأخيرة...',
];

export function CustomProductSection({ lang }: CustomProductSectionProps) {
  const isAr = lang === 'ar';
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('');
  const [productType, setProductType] = useState('coloring_book');
  const [genStep, setGenStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!name.trim() || !email.trim() || !interest) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    setError('');
    setStep('generating');
    setGenStep(0);

    // Animate steps
    const steps = isAr ? STEPS_AR : STEPS_EN;
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 3500));
      setGenStep(i + 1);
    }

    try {
      const res = await fetch(`${API}/public/custom-product/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, customerEmail: email, interest, productType, lang }),
      });
      const data = await res.json() as any;
      if (data.success) {
        setResult(data);
        setStep('ready');
      } else {
        setError(data.error || 'Something went wrong');
        setStep('form');
      }
    } catch {
      setError(isAr ? 'تعذر الاتصال بالخادم' : 'Could not connect to server');
      setStep('form');
    }
  };

  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(180deg, #020408 0%, #050810 50%, #020408 100%)',
      direction: isAr ? 'rtl' : 'ltr',
      fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* BG decoration */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: 100, padding: '6px 20px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ color: '#00E5FF', fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
              {isAr ? 'منتج مخصص لك وحدك' : 'MADE JUST FOR YOU'}
            </span>
          </div>
          <h2 style={{
            color: '#fff', fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 900, margin: '0 0 16px', lineHeight: 1.2,
          }}>
            {isAr ? 'منتجك الرقمي الخاص' : 'Your Own Digital Product'}
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {isAr ? 'في 60 ثانية' : 'In 60 Seconds'}
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            {isAr
              ? 'أخبرنا عن اهتمامك وسيبني الذكاء الاصطناعي لك منتجاً رقمياً باسمك على الغلاف'
              : 'Tell us what you love and our AI builds a digital product with your name on the cover'}
          </p>
        </div>

        {/* FORM */}
        {step === 'form' && (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: 'clamp(24px, 5vw, 40px)',
          }}>
            {/* Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8, letterSpacing: 1 }}>
                  {isAr ? 'الاسم' : 'YOUR NAME'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={isAr ? 'محمد' : 'Alex'}
                  style={{
                    width: '100%', padding: '14px 16px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none',
                    fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                  }}
                />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8, letterSpacing: 1 }}>
                  {isAr ? 'الإيميل' : 'YOUR EMAIL'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '14px 16px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none',
                    fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
                  }}
                />
              </div>
            </div>

            {/* Interest */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 12, letterSpacing: 1 }}>
                {isAr ? 'اهتمامك' : 'YOUR INTEREST'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {INTERESTS.map(i => (
                  <button key={i.en} onClick={() => setInterest(i.en)} style={{
                    padding: '10px 8px',
                    background: interest === i.en ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${interest === i.en ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ fontSize: 18 }}>{i.emoji}</span>
                    <span style={{ color: interest === i.en ? '#00E5FF' : 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center', fontWeight: 600 }}>
                      {isAr ? i.ar : i.en}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Type */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 12, letterSpacing: 1 }}>
                {isAr ? 'نوع المنتج' : 'PRODUCT TYPE'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {PRODUCT_TYPES.map(p => (
                  <button key={p.id} onClick={() => setProductType(p.id)} style={{
                    padding: '12px 8px',
                    background: productType === p.id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${productType === p.id ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ fontSize: 20 }}>{p.emoji}</span>
                    <span style={{ color: productType === p.id ? '#A78BFA' : 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center', fontWeight: 600 }}>
                      {isAr ? p.ar : p.en}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                color: '#f87171', fontSize: 13, textAlign: 'center',
              }}>{error}</div>
            )}

            <button onClick={handleGenerate} style={{
              width: '100%', padding: '18px',
              background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
              border: 'none', borderRadius: 16,
              color: '#000', fontSize: 17, fontWeight: 900,
              cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,229,255,0.25)',
              fontFamily: 'inherit',
            }}>
              {isAr ? `✨ ابنِ منتجي الخاص — $9.99` : `✨ Build My Personalized Product — $9.99`}
            </button>

            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 12 }}>
              {isAr ? 'PDF مخصص باسمك — يوصلك على إيميلك فوراً بعد الدفع' : 'Personalized PDF with your name — delivered to your inbox after payment'}
            </p>
          </div>
        )}

        {/* GENERATING */}
        {step === 'generating' && (
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: 48, textAlign: 'center',
          }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                background: 'conic-gradient(#00E5FF, #7C3AED, #00E5FF)',
                animation: 'spin 1.5s linear infinite',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 66, height: 66, borderRadius: '50%',
                  background: '#050810',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>✨</div>
              </div>
              <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
                {isAr ? `جارٍ بناء منتج ${name}...` : `Building ${name}'s product...`}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                {isAr ? STEPS_AR[genStep] || STEPS_AR[STEPS_AR.length-1] : STEPS_EN[genStep] || STEPS_EN[STEPS_EN.length-1]}
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, height: 6, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{
                height: '100%',
                width: `${Math.round((genStep / STEPS_EN.length) * 100)}%`,
                background: 'linear-gradient(90deg, #00E5FF, #7C3AED)',
                borderRadius: 8, transition: 'width 0.5s ease',
              }} />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {(isAr ? STEPS_AR : STEPS_EN).map((s, i) => (
                <div key={i} style={{
                  fontSize: 11, padding: '4px 12px', borderRadius: 20,
                  background: i < genStep ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.04)',
                  color: i < genStep ? '#00E5FF' : 'rgba(255,255,255,0.3)',
                  border: `1px solid ${i < genStep ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.3s',
                }}>
                  {i < genStep ? '✓ ' : ''}{i + 1}
                </div>
              ))}
            </div>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* READY */}
        {step === 'ready' && result && (
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 0 60px rgba(0,229,255,0.08)',
          }}>
            {/* Top bar */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #00E5FF, #7C3AED)' }} />

            <div style={{ padding: 'clamp(24px, 5vw, 40px)' }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <h3 style={{ color: '#00E5FF', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
                  {isAr ? 'منتجك جاهز!' : 'Your Product is Ready!'}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontStyle: 'italic' }}>
                  "{result.dedication}"
                </p>
              </div>

              {/* Product card */}
              <div style={{
                background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)',
                borderRadius: 16, padding: 20, marginBottom: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>
                      {isAr ? 'منتجك الشخصي' : 'YOUR PERSONALIZED PRODUCT'}
                    </div>
                    <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                      {result.productTitle}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                      {result.pages} {isAr ? 'صفحة' : 'pages'} · PDF {isAr ? 'جاهز للتحميل' : 'ready to download'}
                    </div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
                    borderRadius: 12, padding: '8px 16px', textAlign: 'center', flexShrink: 0,
                  }}>
                    <div style={{ color: '#000', fontSize: 20, fontWeight: 900 }}>${result.price}</div>
                    <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 10 }}>one-time</div>
                  </div>
                </div>
              </div>

              {/* Info row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { icon: '✅', label: isAr ? 'مخصص لك' : 'Personalized', val: isAr ? `باسم ${name}` : `For ${name}` },
                  { icon: '📧', label: isAr ? 'يوصلك فوراً' : 'Instant delivery', val: isAr ? 'على إيميلك' : 'To your inbox' },
                  { icon: '🔒', label: isAr ? 'دفع آمن' : 'Secure pay', val: 'Stripe' },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, padding: '12px 10px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{item.val}</div>
                  </div>
                ))}
              </div>

              <a href={result.paymentUrl} target="_blank" rel="noreferrer" style={{
                display: 'block', width: '100%', padding: '18px',
                background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
                border: 'none', borderRadius: 16,
                color: '#000', fontSize: 17, fontWeight: 900,
                cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,229,255,0.25)',
                textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box',
              }}>
                {isAr ? `💳 اشترِ منتجي — $${result.price}` : `💳 Get My Product — $${result.price}`}
              </a>

              <button onClick={() => { setStep('form'); setResult(null); }} style={{
                width: '100%', marginTop: 12, padding: '12px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, color: 'rgba(255,255,255,0.4)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {isAr ? 'أريد منتجاً مختلفاً' : 'Build a different product'}
              </button>
            </div>
          </div>
        )}

        {/* Proof bar */}
        {step === 'form' && (
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            {[
              { n: '60s', l: isAr ? 'وقت البناء' : 'Build time' },
              { n: '100%', l: isAr ? 'مخصص' : 'Personalized' },
              { n: '0', l: isAr ? 'نسخ متشابهة' : 'Duplicates' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: '#00E5FF', fontSize: 22, fontWeight: 900 }}>{item.n}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{item.l}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
