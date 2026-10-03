import { useState, useEffect } from 'react';
import { Language } from '../types';

const API = 'https://elyvori-api.onrender.com';

interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface ProjectFilesViewerProps {
  lang: Language;
  token: string;
  taskId?: string;
  projectPath?: string;
  onClose: () => void;
}

function detectLanguage(path: string): string {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
  if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
  if (path.endsWith('.html')) return 'html';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.py')) return 'python';
  if (path.endsWith('.dart')) return 'dart';
  if (path.endsWith('.md')) return 'markdown';
  return 'text';
}

const DEMO_FILES: ProjectFile[] = [
  { path: 'src/index.html', language: 'html', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Restaurant</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav>
      <h1>Al-Asal Restaurant</h1>
      <ul>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main id="app"></main>
  <script src="app.js"></script>
</body>
</html>` },
  { path: 'src/styles.css', language: 'css', content: `/* Al-Asal Restaurant Styles */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Cairo', sans-serif;
  background: #0a0a0a;
  color: #fff;
}

header {
  background: linear-gradient(135deg, #1a0a00, #2d1a00);
  padding: 20px 40px;
  border-bottom: 2px solid #f59e0b;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

nav h1 { color: #f59e0b; font-size: 24px; }

nav ul { list-style: none; display: flex; gap: 24px; }
nav ul li a { color: #fff; text-decoration: none; transition: color 0.3s; }
nav ul li a:hover { color: #f59e0b; }` },
  { path: 'src/app.js', language: 'javascript', content: `// Al-Asal Restaurant - Main App
const API_URL = 'https://api.al-asal-restaurant.com';

class RestaurantApp {
  constructor() {
    this.menu = [];
    this.cart = [];
    this.init();
  }

  async init() {
    await this.loadMenu();
    this.renderMenu();
    this.setupCart();
  }

  async loadMenu() {
    try {
      const res = await fetch(\`\${API_URL}/menu\`);
      this.menu = await res.json();
    } catch (e) {
      console.error('Failed to load menu:', e);
    }
  }

  renderMenu() {
    const app = document.getElementById('app');
    app.innerHTML = this.menu.map(item => \`
      <div class="menu-item">
        <img src="\${item.image}" alt="\${item.name}">
        <h3>\${item.name}</h3>
        <p>\${item.description}</p>
        <span class="price">\${item.price} SAR</span>
        <button onclick="app.addToCart(\${item.id})">Add to Cart</button>
      </div>
    \`).join('');
  }

  addToCart(id) {
    const item = this.menu.find(m => m.id === id);
    if (item) {
      this.cart.push(item);
      this.updateCartUI();
    }
  }
}

const app = new RestaurantApp();` },
  { path: 'backend/server.js', language: 'javascript', content: `const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/restaurant');

// Menu Schema
const menuSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  available: { type: Boolean, default: true }
});

const Menu = mongoose.model('Menu', menuSchema);

// Routes
app.get('/menu', async (req, res) => {
  const items = await Menu.find({ available: true });
  res.json(items);
});

app.post('/orders', async (req, res) => {
  const { items, total, customerInfo } = req.body;
  // Process order...
  res.json({ success: true, orderId: Date.now() });
});

app.listen(3000, () => console.log('Server running on port 3000'));` },
  { path: 'README.md', language: 'markdown', content: `# Al-Asal Restaurant Website

Built by **Elyvori AI** — Full-stack web application

## Features
- 🍽️ Dynamic menu display
- 🛒 Shopping cart
- 📱 Responsive design
- 🔗 REST API backend
- 🗄️ MongoDB database

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Hosting: Vercel + Railway

## Getting Started
\`\`\`bash
npm install
npm start
\`\`\`

Built with ❤️ by Elyvori Technologies
Certificate: CERT-ELV2026` },
];

export function ProjectFilesExplorer({ lang, token, taskId, projectPath, onClose }: ProjectFilesViewerProps) {
  const [files, setFiles] = useState<ProjectFile[]>(DEMO_FILES);
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(DEMO_FILES[0]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editRequest, setEditRequest] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const isAr = lang === 'ar';

  useEffect(() => {
    if (taskId && token) loadFiles();
  }, [taskId]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/code-agent/project-files/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.files?.length > 0) {
          setFiles(data.files);
          setSelectedFile(data.files[0]);
        }
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleEdit = async () => {
    if (!editRequest.trim()) return;
    setEditLoading(true);
    setEditSuccess(false);
    try {
      const res = await fetch(`${API}/code-agent/edit-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          taskId, filePath: selectedFile.path,
          currentContent: selectedFile.content,
          editRequest: editRequest.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedContent = data.newContent || selectedFile.content;
        setFiles(prev => prev.map(f => f.path === selectedFile.path ? { ...f, content: updatedContent } : f));
        setSelectedFile(prev => ({ ...prev, content: updatedContent }));
        setEditRequest('');
        setEditMode(false);
        setEditSuccess(true);
        setTimeout(() => setEditSuccess(false), 3000);
      }
    } catch (e) {}
    finally { setEditLoading(false); }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const res = await fetch(`${API}/code-agent/download-project/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'project.zip'; a.click();
        URL.revokeObjectURL(url);
      } else {
        alert(isAr ? 'التحميل غير متاح حتى الآن' : 'Download not available yet');
      }
    } catch (e) {
      alert(isAr ? 'التحميل غير متاح حتى الآن' : 'Download not available yet');
    }
    finally { setDownloadLoading(false); }
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.html')) return '🌐';
    if (path.endsWith('.css')) return '🎨';
    if (path.endsWith('.js') || path.endsWith('.ts')) return '⚡';
    if (path.endsWith('.json')) return '📋';
    if (path.endsWith('.md')) return '📝';
    if (path.endsWith('.py')) return '🐍';
    if (path.endsWith('.dart')) return '💙';
    return '📄';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: "'Cairo','Inter',sans-serif",
      direction: isAr ? 'rtl' : 'ltr',
    }}>
      <div style={{
        width: '100%', maxWidth: 1100, height: '85vh',
        background: '#0a0c14', border: '1px solid rgba(0,229,255,0.2)',
        borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 60px rgba(0,229,255,0.1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', background: '#0f1120',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>📁</span>
            <div>
              <div style={{ color: '#00E5FF', fontWeight: 700, fontSize: 15 }}>
                {isAr ? 'ملفات المشروع' : 'Project Files'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                {files.length} {isAr ? 'ملف' : 'files'} · {isAr ? 'مبني بواسطة Elyvori AI' : 'Built by Elyvori AI'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {editSuccess && (
              <span style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}>
                ✅ {isAr ? 'تم التعديل!' : 'Edit applied!'}
              </span>
            )}
            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              style={{
                background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
                border: 'none', borderRadius: 10, padding: '8px 16px',
                color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {downloadLoading ? '⏳' : '⬇️'} {isAr ? 'تحميل ZIP' : 'Download ZIP'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, width: 32, height: 32, color: 'white',
                cursor: 'pointer', fontSize: 16,
              }}
            >✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* File tree */}
          <div style={{
            width: 220, background: '#080a12', borderRight: '1px solid rgba(255,255,255,0.05)',
            overflowY: 'auto', flexShrink: 0,
          }}>
            <div style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 2, fontWeight: 700 }}>
              FILES
            </div>
            {files.map((file, i) => (
              <button
                key={i}
                onClick={() => { setSelectedFile(file); setEditMode(false); }}
                style={{
                  width: '100%', padding: '10px 16px',
                  background: selectedFile.path === file.path ? 'rgba(0,229,255,0.08)' : 'transparent',
                  border: 'none', borderLeft: selectedFile.path === file.path ? '2px solid #00E5FF' : '2px solid transparent',
                  color: selectedFile.path === file.path ? '#00E5FF' : 'rgba(255,255,255,0.6)',
                  fontSize: 12, textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                <span>{getFileIcon(file.path)}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.path.split('/').pop()}
                </span>
              </button>
            ))}
          </div>

          {/* Code viewer */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* File path bar */}
            <div style={{
              padding: '8px 16px', background: '#0d0f1c',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{selectedFile.path}</span>
                <span style={{
                  background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)',
                  color: '#7C3AED', fontSize: 10, padding: '2px 8px', borderRadius: 999,
                }}>
                  {selectedFile.language}
                </span>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  background: editMode ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${editMode ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8, padding: '5px 12px',
                  color: editMode ? '#00E5FF' : 'rgba(255,255,255,0.6)',
                  fontSize: 12, cursor: 'pointer', fontWeight: 600,
                }}
              >
                ✏️ {isAr ? 'تعديل' : 'Edit'}
              </button>
            </div>

            {/* Edit panel */}
            {editMode && (
              <div style={{
                padding: 16, background: 'rgba(0,229,255,0.04)',
                borderBottom: '1px solid rgba(0,229,255,0.1)',
              }}>
                <div style={{ color: '#00E5FF', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                  ✏️ {isAr ? 'اطلب التعديل:' : 'Describe your edit:'}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    value={editRequest}
                    onChange={e => setEditRequest(e.target.value)}
                    placeholder={isAr ? 'مثال: غيّر اللون الأساسي للأزرق...' : 'e.g. Change the primary color to blue...'}
                    style={{
                      flex: 1, padding: '10px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(0,229,255,0.2)',
                      borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none',
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleEdit()}
                  />
                  <button
                    onClick={handleEdit}
                    disabled={editLoading || !editRequest.trim()}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
                      border: 'none', borderRadius: 10,
                      color: '#000', fontWeight: 700, fontSize: 13,
                      cursor: editRequest.trim() ? 'pointer' : 'not-allowed',
                      opacity: editRequest.trim() ? 1 : 0.5,
                    }}
                  >
                    {editLoading ? '⏳' : (isAr ? 'طبّق' : 'Apply')}
                  </button>
                </div>
              </div>
            )}

            {/* Code content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <pre style={{
                color: '#e2e8f0', fontSize: 13, lineHeight: 1.7,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
              }}>
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
