import { useState } from 'react';
import { Language } from '../types';
import { ProjectFilesExplorer } from './ProjectFilesExplorer';

export interface CertificateData {
  clientName: string;
  clientEmail: string;
  agentType: string;
  projectDetails: string;
  contractId: string;
  completedAt: string;
  certificateId: string;
}

const AGENT_INFO: Record<string, { titleEn: string; titleAr: string; icon: string; colorFrom: string; colorTo: string }> = {
  'web-app-building':   { titleEn: 'Website & App Development',    titleAr: 'تطوير المواقع والتطبيقات', icon: '💻', colorFrom: '#00E5FF', colorTo: '#7C3AED' },
  'digital-products':  { titleEn: 'Digital Product Creation',      titleAr: 'إنشاء المنتجات الرقمية',  icon: '📦', colorFrom: '#F59E0B', colorTo: '#EF4444' },
  'recruitment-crm':   { titleEn: 'Recruitment & Talent',          titleAr: 'التوظيف واستقطاب المواهب',icon: '👥', colorFrom: '#10B981', colorTo: '#059669' },
  'marketing-agent':   { titleEn: 'Bilingual Marketing Campaign',  titleAr: 'حملة تسويقية ثنائية اللغة',icon: '📢', colorFrom: '#F59E0B', colorTo: '#D97706' },
  'content-agent':     { titleEn: 'Content Creation Package',      titleAr: 'حزمة إنشاء المحتوى',      icon: '✍️', colorFrom: '#8B5CF6', colorTo: '#7C3AED' },
  'lead-finder':       { titleEn: 'Lead Discovery & Outreach',     titleAr: 'اكتشاف العملاء المحتملين', icon: '🎯', colorFrom: '#00E5FF', colorTo: '#0099BB' },
  'career-agent':      { titleEn: 'Career Matching & Job Search',  titleAr: 'مطابقة الوظائف',           icon: '💼', colorFrom: '#10B981', colorTo: '#0D9488' },
  'contract-analyzer': { titleEn: 'Contract Analysis',             titleAr: 'تحليل العقود',             icon: '⚖️', colorFrom: '#EF4444', colorTo: '#DC2626' },
  'customer-support':  { titleEn: 'Customer Support AI',           titleAr: 'دعم العملاء بالذكاء الاصطناعي', icon: '🤝', colorFrom: '#00E5FF', colorTo: '#7C3AED' },
  'negotiation':       { titleEn: 'AI Negotiation Training',       titleAr: 'تدريب التفاوض',            icon: '🤜', colorFrom: '#F59E0B', colorTo: '#EF4444' },
  'default':           { titleEn: 'AI Services',                   titleAr: 'خدمات الذكاء الاصطناعي',  icon: '🤖', colorFrom: '#00E5FF', colorTo: '#7C3AED' },
};

interface CompletionCertificateProps {
  lang: Language;
  data: CertificateData;
  onClose: () => void;
  onDownload?: () => void;
  token?: string;
  taskId?: string;
}

export function CompletionCertificate({ lang, data, onClose, token, taskId }: CompletionCertificateProps) {
  const isAr = lang === 'ar';
  const [showFiles, setShowFiles] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const agent = AGENT_INFO[data.agentType] || AGENT_INFO['default'];

  const completedDate = new Date(data.completedAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      if (!(window as any).jspdf) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          s.onload = () => resolve();
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = 297; const H = 210;

      doc.setFillColor(4, 6, 15); doc.rect(0, 0, W, H, 'F');
      doc.setDrawColor(0, 229, 255); doc.setLineWidth(1.5); doc.rect(8, 8, W-16, H-16, 'S');
      doc.setDrawColor(124, 58, 237); doc.setLineWidth(0.5); doc.rect(12, 12, W-24, H-24, 'S');
      doc.setFillColor(0, 229, 255); doc.rect(8, 8, W-16, 1.5, 'F');

      doc.setTextColor(0, 229, 255); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
      doc.text('ELYVORI TECHNOLOGIES', W/2, 28, { align: 'center' });

      doc.setTextColor(180, 180, 180); doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL CERTIFICATE OF COMPLETION', W/2, 37, { align: 'center' });

      doc.setDrawColor(0, 229, 255); doc.setLineWidth(0.3); doc.line(50, 42, W-50, 42);

      doc.setTextColor(0, 229, 255); doc.setFontSize(15); doc.setFont('helvetica', 'bold');
      doc.text(agent.titleEn, W/2, 53, { align: 'center' });
      doc.setTextColor(140, 140, 160); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text('Successfully completed by Elyvori AI', W/2, 61, { align: 'center' });

      doc.setFillColor(8, 12, 28); doc.setDrawColor(0, 229, 255); doc.setLineWidth(0.5);
      doc.roundedRect(55, 68, W-110, 40, 4, 4, 'FD');
      doc.setTextColor(140, 140, 160); doc.setFontSize(8);
      doc.text('THIS CERTIFICATE IS AWARDED TO', W/2, 78, { align: 'center' });
      doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
      doc.text(data.clientName, W/2, 92, { align: 'center' });
      doc.setTextColor(0, 229, 255); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(data.clientEmail, W/2, 101, { align: 'center' });

      const boxes = [
        { x: 25, label: 'COMPLETION DATE', val: completedDate, col: [255,255,255] },
        { x: 110, label: 'CONTRACT ID', val: data.contractId, col: [0,229,255] },
        { x: 195, label: 'CERTIFICATE ID', val: 'CERT-'+data.certificateId, col: [0,229,255] },
      ];
      boxes.forEach(b => {
        doc.setFillColor(12, 16, 35); doc.setDrawColor(40, 40, 70);
        doc.roundedRect(b.x, 120, 72, 20, 3, 3, 'FD');
        doc.setTextColor(120, 120, 150); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.text(b.label, b.x+36, 127, { align: 'center' });
        doc.setTextColor(b.col[0], b.col[1], b.col[2]); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
        doc.text(b.val, b.x+36, 135, { align: 'center' });
      });

      doc.setFillColor(16, 185, 129, 15); doc.setDrawColor(16, 185, 129); doc.setLineWidth(0.4);
      doc.roundedRect(70, 152, W-140, 12, 3, 3, 'FD');
      doc.setTextColor(16, 185, 129); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.text('VERIFIED — elyvori.com/verify/CERT-'+data.certificateId, W/2, 160, { align: 'center' });

      doc.setTextColor(60, 60, 80); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      doc.text('© '+new Date().getFullYear()+' Elyvori Technologies — AI-Powered Platform', W/2, H-12, { align: 'center' });
      doc.setFillColor(124, 58, 237); doc.rect(8, H-9.5, W-16, 1.5, 'F');

      doc.save('Elyvori-Certificate-'+data.certificateId+'.pdf');
    } catch(e) { console.error(e); }
    finally { setDownloading(false); }
  };

  return (
    <>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(0,0,0,0.9)',backdropFilter:'blur(10px)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'20px 20px 40px',fontFamily:"'Cairo','Inter',sans-serif",direction:isAr?'rtl':'ltr',overflowY:'auto'}}>
        <button onClick={onClose} style={{position:'fixed',top:16,right:16,zIndex:10001,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',color:'white',borderRadius:'50%',width:44,height:44,cursor:'pointer',fontSize:20,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        <div style={{background:'linear-gradient(135deg,#060912,#080c1a)',border:'1px solid rgba(0,229,255,0.25)',borderRadius:24,maxWidth:560,width:'100%',boxShadow:'0 0 80px rgba(0,229,255,0.12)',overflow:'hidden',marginTop:20,animation:'fadeIn 0.4s ease'}}>
          <div style={{height:3,background:'linear-gradient(90deg,#00E5FF,#7C3AED)'}} />
          <div style={{padding:'28px 28px 24px'}}>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{display:'inline-block',background:'linear-gradient(135deg,#00E5FF,#7C3AED)',borderRadius:12,padding:'8px 20px'}}>
                <span style={{color:'#000',fontSize:16,fontWeight:900}}>ELYVORI</span>
              </div>
            </div>
            <div style={{textAlign:'center',marginBottom:8}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(0,229,255,0.08)',border:'1px solid rgba(0,229,255,0.25)',borderRadius:100,padding:'6px 18px'}}>
                <span style={{fontSize:16}}>🏆</span>
                <span style={{color:'#00E5FF',fontSize:11,fontWeight:700,letterSpacing:2}}>OFFICIAL CERTIFICATE OF COMPLETION</span>
              </div>
            </div>
            <div style={{textAlign:'center',marginBottom:4}}><span style={{fontSize:28}}>{agent.icon}</span></div>
            <h2 style={{color:'#00E5FF',fontSize:18,fontWeight:900,textAlign:'center',margin:'0 0 4px'}}>{isAr?agent.titleAr:agent.titleEn}</h2>
            <p style={{color:'rgba(255,255,255,0.35)',fontSize:12,textAlign:'center',margin:'0 0 20px'}}>Successfully completed by Elyvori AI</p>
            <div style={{background:'rgba(0,229,255,0.04)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:16,padding:'20px',textAlign:'center',marginBottom:16}}>
              <div style={{color:'rgba(255,255,255,0.3)',fontSize:10,letterSpacing:2,marginBottom:8}}>THIS CERTIFICATE IS AWARDED TO</div>
              <div style={{color:'#fff',fontSize:24,fontWeight:900,fontFamily:'Georgia,serif',marginBottom:4}}>{data.clientName}</div>
              <div style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>{data.clientEmail}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              {[{label:'COMPLETION DATE',value:completedDate,color:'#fff'},{label:'CONTRACT ID',value:data.contractId,color:'#00E5FF'},{label:'CERTIFICATE ID',value:'CERT-'+data.certificateId,color:'#00E5FF'},{label:'POWERED BY',value:'Elyvori AI',color:'#7C3AED'}].map((item,i)=>(
                <div key={i} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,padding:12}}>
                  <div style={{color:'rgba(255,255,255,0.3)',fontSize:9,letterSpacing:1,marginBottom:4}}>{item.label}</div>
                  <div style={{color:item.color,fontSize:11,fontWeight:700}}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{textAlign:'center',padding:12,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:12,marginBottom:20}}>
              <span style={{color:'#10b981',fontWeight:700,fontSize:12}}>✓ VERIFIED — elyvori.com/verify/CERT-{data.certificateId}</span>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowFiles(!showFiles)} style={{flex:1,padding:'13px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:14,color:'#00E5FF',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                {showFiles?'✕ Hide Files':'📁 View Files'}
              </button>
              <button onClick={handleDownloadPDF} disabled={downloading} style={{flex:1,padding:'13px',background:downloading?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#00E5FF,#7C3AED)',border:'none',borderRadius:14,color:downloading?'rgba(255,255,255,0.3)':'#000',fontSize:13,fontWeight:800,cursor:downloading?'not-allowed':'pointer',boxShadow:downloading?'none':'0 0 20px rgba(0,229,255,0.3)'}}>
                {downloading?'⏳ Generating...':'⬇️ Certificate PDF'}
              </button>
            </div>
            {showFiles && token && taskId && (
              <div style={{marginTop:16}}><ProjectFilesExplorer token={token} taskId={taskId} lang={lang} /></div>
            )}
          </div>
          <div style={{height:2,background:'linear-gradient(90deg,#7C3AED,#00E5FF)'}} />
        </div>
      </div>
    </>
  );
}

declare global { interface Window { jspdf: any; } }
