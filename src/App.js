import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const SUGGESTIONS = [
  'Summarize this document',
  'What are the key concepts?',
  'Explain backpropagation',
  'List all chapter topics',
];

const SparkleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor" opacity="0.9"/>
    <path d="M19 15L19.8 18L22 19L19.8 20L19 23L18.2 20L16 19L18.2 18L19 15Z" fill="currentColor" opacity="0.6"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const ThinkingDots = () => (
  <div style={styles.thinking}>
    <span style={{...styles.dot, animationDelay: '0ms'}} />
    <span style={{...styles.dot, animationDelay: '200ms'}} />
    <span style={{...styles.dot, animationDelay: '400ms'}} />
  </div>
);

export default function App() {
  const [doc, setDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const fileRef = useRef();
  const chatRef = useRef();
  const inputRef = useRef();

  // Check if backend already has a doc loaded
  useEffect(() => {
    fetch(`${API}/status`)
      .then(r => r.json())
      .then(d => { if (d.ready && d.filename) setDoc({ name: d.filename }); })
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length) scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    if (!chatRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
  };

  const processFile = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      setUploadError('Please upload a PDF file.');
      return;
    }
    setUploadError('');
    setUploading(true);
    setDoc(null);
    setMessages([]);

    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      setDoc({ name: data.filename, pages: data.pages, size: data.size_mb });
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Query failed');
      setMessages(m => [...m, { role: 'ai', content: data.answer }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'ai', content: `⚠️ ${e.message}`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={styles.root}>
      <style>{keyframes}</style>

      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoText}>RAG<span style={styles.logoDot}>.chat</span></span>
          <span style={styles.modelBadge}>mistral-medium-3.5</span>
        </div>

        <div
          style={{
            ...styles.dropzone,
            ...(dragOver ? styles.dropzoneActive : {}),
            ...(uploading ? styles.dropzoneUploading : {}),
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
            onChange={e => processFile(e.target.files[0])} />
          <div style={styles.uploadIcon}>
            {uploading
              ? <div style={styles.spinner} />
              : <UploadIcon />}
          </div>
          <span style={styles.uploadTitle}>{uploading ? 'Processing…' : 'Upload PDF'}</span>
          <span style={styles.uploadSub}>{uploading ? 'Building vector store' : 'drag & drop or click'}</span>
        </div>

        {uploadError && <div style={styles.errorBanner}>{uploadError}</div>}

        {doc && (
          <div style={styles.docSection}>
            <span style={styles.docLabel}>DOCUMENTS</span>
            <div style={styles.docItem}>
              <span style={styles.docItemIcon}><DocIcon /></span>
              <div style={styles.docItemInfo}>
                <span style={styles.docItemName}>{doc.name}</span>
                {doc.pages && (
                  <span style={styles.docItemMeta}>{doc.size} MB · {doc.pages} pages</span>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Chat ── */}
      <main style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <SparkleIcon />
            <span style={styles.headerTitle}>Ask your document</span>
          </div>
          {doc && (
            <span style={styles.docLoadedBadge}>
              <span style={styles.docLoadedDot} />
              1 doc loaded
            </span>
          )}
        </header>

        {/* Chat Area */}
        <div style={styles.chatWrap} ref={chatRef} onScroll={handleScroll}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}><SparkleIcon /></div>
              <h2 style={styles.emptyTitle}>What do you want to know?</h2>
              <p style={styles.emptySub}>Upload a PDF, then ask anything about it.</p>
              {doc && (
                <div style={styles.suggestions}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} style={styles.suggBtn} onClick={() => sendMessage(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={styles.messageList}>
              {messages.map((m, i) => (
                <div key={i} style={{ ...styles.msgRow, ...(m.role === 'user' ? styles.msgRowUser : {}) }}>
                  {m.role === 'ai' && (
                    <div style={styles.aiAvatar}><SparkleIcon /></div>
                  )}
                  <div style={{
                    ...styles.bubble,
                    ...(m.role === 'user' ? styles.bubbleUser : styles.bubbleAi),
                    ...(m.error ? styles.bubbleError : {}),
                  }}>
                    {m.role === 'ai'
                      ? <ReactMarkdown>{m.content}</ReactMarkdown>
                      : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={styles.msgRow}>
                  <div style={styles.aiAvatar}><SparkleIcon /></div>
                  <div style={{...styles.bubble, ...styles.bubbleAi}}><ThinkingDots /></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll to bottom */}
        {showScrollBtn && (
          <button style={styles.scrollBtn} onClick={scrollToBottom}>↓</button>
        )}

        {/* Input */}
        <div style={styles.inputBar}>
          <div style={styles.inputWrap}>
            <textarea
              ref={inputRef}
              style={styles.textarea}
              placeholder={doc ? 'Ask anything about your document…' : 'Upload a PDF to start chatting…'}
              value={input}
              disabled={!doc || loading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              style={{
                ...styles.sendBtn,
                ...((!input.trim() || !doc || loading) ? styles.sendBtnDisabled : {}),
              }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || !doc || loading}
            >
              <SendIcon />
            </button>
          </div>
          <p style={styles.inputHint}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      </main>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  root: {
    display: 'flex', height: '100vh', overflow: 'hidden',
    background: 'var(--bg)', fontFamily: 'var(--font-sans)',
  },
  sidebar: {
    width: 280, minWidth: 280, background: 'var(--sidebar-bg)',
    borderRight: '1px solid var(--border)', display: 'flex',
    flexDirection: 'column', gap: 16, padding: '20px 16px', overflowY: 'auto',
  },
  logo: { display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 4 },
  logoText: { fontSize: 20, fontWeight: 600, letterSpacing: '-0.5px', color: 'var(--text)' },
  logoDot: { color: 'var(--accent)' },
  modelBadge: {
    display: 'inline-block', width: 'fit-content',
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)',
    background: 'rgba(0,200,150,0.1)', color: 'var(--accent)',
    border: '1px solid rgba(0,200,150,0.2)',
  },
  dropzone: {
    border: '1.5px dashed var(--border-light)', borderRadius: 10,
    padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    transition: 'all 0.2s', background: 'var(--panel-bg)',
  },
  dropzoneActive: { borderColor: 'var(--accent)', background: 'var(--accent-dim)' },
  dropzoneUploading: { borderColor: 'var(--accent)', opacity: 0.8, cursor: 'wait' },
  uploadIcon: { color: 'var(--accent)', marginBottom: 4 },
  uploadTitle: { fontSize: 13, fontWeight: 500, color: 'var(--text)' },
  uploadSub: { fontSize: 11, color: 'var(--text-muted)' },
  spinner: {
    width: 28, height: 28, border: '2.5px solid var(--border)',
    borderTopColor: 'var(--accent)', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBanner: {
    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
    background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
    color: '#ff8080', fontSize: 12,
  },
  docSection: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 },
  docLabel: { fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: 'var(--text-muted)', textTransform: 'uppercase' },
  docItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 'var(--radius-sm)', background: 'var(--accent-dim)',
    border: '1px solid rgba(0,200,150,0.2)',
  },
  docItemIcon: { color: 'var(--accent)', flexShrink: 0 },
  docItemInfo: { display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' },
  docItemName: { fontSize: 12, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  docItemMeta: { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },

  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', borderBottom: '1px solid var(--border)',
    background: 'var(--sidebar-bg)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)' },
  headerTitle: { fontSize: 15, fontWeight: 500 },
  docLoadedBadge: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
    borderRadius: 20, background: 'var(--accent-dim)', border: '1px solid rgba(0,200,150,0.25)',
    fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
  },
  docLoadedDot: {
    width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent)', animation: 'pulse 2s ease infinite',
  },

  chatWrap: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' },

  emptyState: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 12, textAlign: 'center', padding: '40px 24px',
    animation: 'fadeIn 0.4s ease',
  },
  emptyIcon: { color: 'var(--accent)', opacity: 0.5, marginBottom: 4 },
  emptyTitle: { fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.3px' },
  emptySub: { fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' },
  suggestions: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 },
  suggBtn: {
    padding: '8px 16px', borderRadius: 20, border: '1px solid var(--border-light)',
    background: 'transparent', color: 'var(--text-dim)', fontSize: 12,
    cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.18s',
  },

  messageList: { display: 'flex', flexDirection: 'column', gap: 20 },
  msgRow: { display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'fadeIn 0.25s ease' },
  msgRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 30, height: 30, borderRadius: 8, background: 'var(--accent-dim)',
    border: '1px solid rgba(0,200,150,0.2)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: 'var(--accent)', flexShrink: 0,
  },
  bubble: {
    maxWidth: '72%', padding: '12px 16px', borderRadius: 12,
    fontSize: 13.5, lineHeight: 1.65, wordBreak: 'break-word',
  },
  bubbleUser: {
    background: 'var(--user-bubble)', border: '1px solid rgba(0,200,150,0.15)',
    borderBottomRightRadius: 4, color: 'var(--text)',
  },
  bubbleAi: {
    background: 'var(--ai-bubble)', border: '1px solid var(--border)',
    borderBottomLeftRadius: 4, color: 'var(--text)',
  },
  bubbleError: { borderColor: 'rgba(255,80,80,0.3)', color: '#ff8080' },

  thinking: { display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' },
  dot: {
    width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)',
    display: 'inline-block', animation: 'bounce 1s ease infinite',
    opacity: 0.7,
  },

  scrollBtn: {
    position: 'absolute', bottom: 88, right: 28, width: 36, height: 36,
    borderRadius: '50%', border: '1px solid var(--border-light)',
    background: 'var(--panel-bg)', color: 'var(--text)', cursor: 'pointer',
    fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
  },

  inputBar: {
    padding: '14px 24px 16px', borderTop: '1px solid var(--border)',
    background: 'var(--sidebar-bg)',
  },
  inputWrap: {
    display: 'flex', gap: 10, alignItems: 'flex-end',
    background: 'var(--panel-bg)', border: '1px solid var(--border-light)',
    borderRadius: 12, padding: '10px 12px', transition: 'border-color 0.2s',
  },
  textarea: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13.5,
    resize: 'none', lineHeight: 1.6, minHeight: 22, maxHeight: 120,
  },
  sendBtn: {
    width: 34, height: 34, borderRadius: 8, border: 'none',
    background: 'var(--accent)', color: '#000', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.18s',
  },
  sendBtnDisabled: { background: 'var(--border-light)', color: 'var(--text-muted)', cursor: 'not-allowed' },
  inputHint: { fontSize: 10.5, color: 'var(--text-muted)', marginTop: 6, paddingLeft: 2, fontFamily: 'var(--font-mono)' },
};

const keyframes = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
  .suggBtn:hover { border-color: var(--accent) !important; color: var(--accent) !important; background: var(--accent-dim) !important; }
  .inputWrap:focus-within { border-color: var(--accent) !important; }
`;
