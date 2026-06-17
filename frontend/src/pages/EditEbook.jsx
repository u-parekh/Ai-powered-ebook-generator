import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

// Render markdown markers as styled HTML for the live preview
function renderMarkdown(text) {
  if (!text) return '';
  const escaped = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = escaped.split('\n');
  const blocks = [];
  let buf = [];

  const flushBuf = () => {
    if (!buf.length) return;
    const joined = buf.join('<br/>');
    blocks.push(`<p style="margin:0 0 18px 0;text-align:justify;">${joined}</p>`);
    buf = [];
  };

  for (const line of lines) {
    if (line.trim() === '') { flushBuf(); continue; }
    const hMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (hMatch) {
      flushBuf();
      const lvl = hMatch[1].length + 1;
      const txt = applyInline(hMatch[2]);
      blocks.push(`<h${lvl} style="font-family:Arial,sans-serif;color:#a78bfa;margin:20px 0 10px;">${txt}</h${lvl}>`);
    } else {
      buf.push(applyInline(line));
    }
  }
  flushBuf();
  return blocks.join('');
}

function applyInline(text) {
  return text
    .replace(/==(.+?)==/g, '<mark style="background:#fef08a;color:#111;padding:1px 3px;border-radius:2px;">$1</mark>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/(?<![_])_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
}

export default function EditEbook() {
  const { id } = useParams();
  const [ebook, setEbook]               = useState(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [generating, setGenerating]     = useState(false);
  const [editContent, setEditContent]   = useState('');
  const [saving, setSaving]             = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingDOCX, setExportingDOCX] = useState(false);
  const [fontSize, setFontSize]         = useState(16);
  const [viewMode, setViewMode]         = useState('edit'); // 'edit' | 'preview'
  const textareaRef = useRef(null);
  const navigate    = useNavigate();

  useEffect(() => {
    API.get(`/ebooks/${id}`)
      .then(({ data }) => {
        setEbook(data);
        const first = data.chapters?.find(c => c.chapterNumber === 1);
        setEditContent(first?.content || '');
      })
      .catch(() => toast.error('Failed to load ebook'));
  }, [id]);

  const switchChapter = (index) => {
    setActiveChapter(index);
    const saved = ebook?.chapters?.find(c => c.chapterNumber === index + 1);
    setEditContent(saved?.content || '');
    setViewMode('edit');
  };

  const generateChapterContent = async (chapterTitle, chapterNumber) => {
    setGenerating(true);
    try {
      const { data } = await API.post('/ai/generate-chapter', {
        topic: ebook.topic, chapterTitle, chapterNumber,
        tone: ebook.tone, language: ebook.language
      });
      const content = data.content || '';
      setEditContent(content);
      await saveChapterDirect(chapterNumber, chapterTitle, content);
    } catch (err) {
      console.error('Generate error:', err);
      toast.error(err?.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const saveChapterDirect = async (chapterNumber, title, content) => {
    setSaving(true);
    try {
      const { data } = await API.put(`/ebooks/${id}/chapter`, { chapterNumber, title, content });
      setEbook(data);
      toast.success('Chapter saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleSave = () => saveChapterDirect(activeChapter + 1, currentTitle, editContent);

  // Wrap selected text with a formatting marker
  const applyFormat = (open, close) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start    = ta.selectionStart;
    const end      = ta.selectionEnd;
    const selected = editContent.slice(start, end);
    if (!selected) { toast.error('Select some text first'); return; }
    const newContent = editContent.slice(0, start) + open + selected + close + editContent.slice(end);
    setEditContent(newContent);
    const cursor = start + open.length + selected.length + close.length;
    setTimeout(() => { ta.focus(); ta.setSelectionRange(cursor, cursor); }, 0);
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    const t = toast.loading('Generating PDF...');
    try {
      const res = await API.get(`/ebooks/${id}/export/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `${ebook.title}.pdf`; a.click();
      toast.dismiss(t); toast.success('PDF Downloaded!');
    } catch { toast.dismiss(t); toast.error('PDF export failed'); }
    finally { setExportingPDF(false); }
  };

  const handleExportDOCX = async () => {
    setExportingDOCX(true);
    const t = toast.loading('Generating DOCX...');
    try {
      const res = await API.get(`/ebooks/${id}/export/docx`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `${ebook.title}.docx`; a.click();
      toast.dismiss(t); toast.success('DOCX Downloaded!');
    } catch { toast.dismiss(t); toast.error('DOCX export failed'); }
    finally { setExportingDOCX(false); }
  };

  if (!ebook) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>⏳</div>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px' }}>Loading your eBook...</p>
      </div>
    </div>
  );

  const chapters      = ebook.tableOfContents || [];
  const savedChapters = ebook.chapters || [];
  const progress      = chapters.length ? Math.round((savedChapters.length / chapters.length) * 100) : 0;
  const currentTitle  = chapters[activeChapter] || '';
  const wordCount     = editContent.trim().split(/\s+/).filter(Boolean).length;

  const toolbarBtn = (label, onClick, title, extraStyle = {}) => (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
        borderRadius:'6px', padding:'5px 10px', color:'rgba(255,255,255,0.9)',
        fontSize:'13px', cursor:'pointer', transition:'all 0.15s', ...extraStyle }}
    >{label}</button>
  );

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      fontFamily:"'Segoe UI',sans-serif", display:'flex', flexDirection:'column' }}>

      {/* ── Navbar ── */}
      <nav style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.1)', padding:'10px 16px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        flexWrap:'wrap', gap:'8px', zIndex:100, flexShrink:0 }}>

        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background:'rgba(255,255,255,0.08)',
            border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'7px 11px',
            color:'#fff', cursor:'pointer', fontSize:'15px' }}>☰</button>
          <button onClick={() => navigate('/dashboard')} style={{ background:'rgba(255,255,255,0.08)',
            border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'7px 12px',
            color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:'12px' }}>← Dashboard</button>
          <div>
            <p style={{ color:'#fff', fontSize:'14px', fontWeight:'700', margin:0,
              maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ebook.title}</p>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'10px', margin:0 }}>{ebook.tone} · {ebook.language}</p>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', whiteSpace:'nowrap' }}>
            {savedChapters.length}/{chapters.length}
          </span>
          <div style={{ width:'100px', background:'rgba(255,255,255,0.1)', borderRadius:'10px', height:'5px' }}>
            <div style={{ background:'linear-gradient(90deg,#8b5cf6,#6366f1)',
              width:`${progress}%`, height:'5px', borderRadius:'10px', transition:'width 0.5s' }}/>
          </div>
          <span style={{ color:'#a78bfa', fontSize:'12px', fontWeight:'600' }}>{progress}%</span>
        </div>

        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={handleSave} disabled={saving} style={{ background:'rgba(139,92,246,0.2)',
            color:'#a78bfa', border:'1px solid rgba(139,92,246,0.3)', borderRadius:'8px',
            padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor: saving ? 'not-allowed' : 'pointer'
          }}>{saving ? '⏳' : '💾 Save'}</button>
          <button onClick={handleExportPDF} disabled={exportingPDF} style={{ background:'linear-gradient(135deg,#10b981,#059669)',
            color:'#fff', border:'none', borderRadius:'8px', padding:'7px 14px',
            fontSize:'12px', fontWeight:'600', cursor: exportingPDF ? 'not-allowed' : 'pointer'
          }}>{exportingPDF ? '⏳' : '📄 PDF'}</button>
          <button onClick={handleExportDOCX} disabled={exportingDOCX} style={{ background:'linear-gradient(135deg,#3b82f6,#2563eb)',
            color:'#fff', border:'none', borderRadius:'8px', padding:'7px 14px',
            fontSize:'12px', fontWeight:'600', cursor: exportingDOCX ? 'not-allowed' : 'pointer'
          }}>{exportingDOCX ? '⏳' : '📝 DOCX'}</button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', height:'calc(100vh - 58px)' }}>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={{ width:'230px', minWidth:'230px', background:'rgba(0,0,0,0.3)',
            borderRight:'1px solid rgba(255,255,255,0.07)', overflowY:'auto',
            padding:'14px 10px', display:'flex', flexDirection:'column', gap:'5px' }}>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'10px', fontWeight:'700',
              letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 8px 4px' }}>CHAPTERS</p>
            {chapters.map((ch, i) => {
              const isSaved  = savedChapters.some(c => c.chapterNumber === i + 1);
              const isActive = activeChapter === i;
              return (
                <button key={i} onClick={() => switchChapter(i)} style={{
                  background: isActive ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.03)',
                  border: isActive ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius:'10px', padding:'10px', cursor:'pointer',
                  textAlign:'left', transition:'all 0.2s', width:'100%' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'8px' }}>
                    <div style={{ width:'22px', height:'22px', flexShrink:0, borderRadius:'6px', marginTop:'1px',
                      background: isSaved ? 'linear-gradient(135deg,#10b981,#059669)'
                        : isActive ? 'linear-gradient(135deg,#8b5cf6,#6366f1)' : 'rgba(255,255,255,0.1)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:'#fff', fontSize:'10px', fontWeight:'700'
                    }}>{isSaved ? '✓' : i + 1}</div>
                    <p style={{ color: isActive ? '#e9d5ff' : 'rgba(255,255,255,0.6)',
                      fontSize:'11px', margin:0, fontWeight: isActive ? '600' : '400', lineHeight:'1.4',
                      display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'
                    }}>{ch}</p>
                  </div>
                </button>
              );
            })}
          </aside>
        )}

        {/* ── Editor / Preview ── */}
        <main style={{ flex:1, overflowY:'auto', padding:'20px 16px' }}>
          <div style={{ maxWidth:'820px', margin:'0 auto' }}>

            <div style={{ marginBottom:'14px' }}>
              <h2 style={{ color:'#fff', fontSize:'18px', fontWeight:'700', margin:0 }}>
                Chapter {activeChapter + 1}
              </h2>
              <p style={{ color:'#a78bfa', fontSize:'13px', margin:'4px 0 0' }}>{currentTitle}</p>
            </div>

            {/* Editor card */}
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
              borderRadius:'16px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>

              {/* ── Toolbar ── */}
              <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)',
                display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap',
                background:'rgba(255,255,255,0.03)' }}>

                {/* Formatting buttons */}
                {toolbarBtn('B',  () => applyFormat('**','**'),   'Bold',      { fontWeight:'800' })}
                {toolbarBtn('I',  () => applyFormat('_','_'),     'Italic',    { fontStyle:'italic' })}
                {toolbarBtn('U̲', () => applyFormat('__','__'),   'Underline', { textDecoration:'underline' })}
                {toolbarBtn('▓',  () => applyFormat('==','=='),   'Highlight', { color:'#fef08a' })}

                <div style={{ width:'1px', height:'22px', background:'rgba(255,255,255,0.15)', margin:'0 2px' }}/>

                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>Size:</span>
                <select value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{
                  background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
                  borderRadius:'6px', color:'rgba(255,255,255,0.8)', padding:'3px 6px',
                  fontSize:'12px', cursor:'pointer', outline:'none' }}>
                  {[12,14,16,18,20,24].map(s => (
                    <option key={s} value={s} style={{ background:'#302b63' }}>{s}px</option>
                  ))}
                </select>

                <div style={{ flex:1 }}/>

                {/* Edit / Preview toggle */}
                <div style={{ display:'flex', background:'rgba(255,255,255,0.06)',
                  borderRadius:'8px', padding:'2px', border:'1px solid rgba(255,255,255,0.1)' }}>
                  {['edit','preview'].map(mode => (
                    <button key={mode} onClick={() => setViewMode(mode)} style={{
                      background: viewMode === mode ? 'rgba(139,92,246,0.5)' : 'transparent',
                      border:'none', borderRadius:'6px', padding:'4px 12px',
                      color: viewMode === mode ? '#fff' : 'rgba(255,255,255,0.5)',
                      fontSize:'12px', cursor:'pointer', fontWeight: viewMode === mode ? '600' : '400',
                      transition:'all 0.2s', textTransform:'capitalize'
                    }}>{mode === 'edit' ? '✏️ Edit' : '👁 Preview'}</button>
                  ))}
                </div>

                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'11px', whiteSpace:'nowrap' }}>
                  📝 {wordCount} words
                </span>
              </div>

              {/* AI generating banner */}
              {generating && (
                <div style={{ padding:'32px 24px', display:'flex', flexDirection:'column',
                  alignItems:'center', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize:'44px', marginBottom:'10px' }}>⚡</div>
                  <h3 style={{ color:'#fff', fontSize:'16px', fontWeight:'700', marginBottom:'6px' }}>AI is Writing...</h3>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', marginBottom:'16px' }}>
                    Generating "{currentTitle}"
                  </p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:'10px', height:'10px', borderRadius:'50%',
                        background:'#8b5cf6', animation:`bounce 1.2s ${i*0.2}s infinite` }}/>
                    ))}
                  </div>
                </div>
              )}

              {/* ── EDIT MODE: raw textarea ── */}
              {viewMode === 'edit' && (
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  disabled={generating}
                  placeholder="Click '🤖 Generate with AI' below, or type here manually...
                  Use **bold**, _italic_, __underline__, ==highlight==, ## Heading"
                  style={{ display:'block', width:'100%', minHeight: generating ? '80px' : '520px',
                    background:'transparent', border:'none', outline:'none',
                    color:'rgba(255,255,255,0.87)', fontSize:`${fontSize}px`,
                    lineHeight:'1.9', padding:'28px 32px', resize:'vertical',
                    fontFamily:"'Georgia',serif", boxSizing:'border-box', whiteSpace:'pre-wrap',
                    opacity: generating ? 0.3 : 1, transition:'opacity 0.3s' }}
                />
              )}

              {/* ── PREVIEW MODE: rendered markdown ── */}
              {viewMode === 'preview' && (
                <div
                  style={{ minHeight:'520px', padding:'28px 32px',
                    fontFamily:"'Georgia',serif", fontSize:`${fontSize}px`,
                    lineHeight:'1.9', color:'rgba(255,255,255,0.87)',
                    background:'rgba(255,255,255,0.02)' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) || '<p style="color:rgba(255,255,255,0.2);font-style:italic;">Nothing to preview yet.</p>' }}
                />
              )}
            </div>

            {/* Format hint */}
            <div style={{ marginTop:'10px', padding:'10px 14px',
              background:'rgba(139,92,246,0.08)', borderRadius:'10px',
              border:'1px solid rgba(139,92,246,0.2)', display:'flex', gap:'16px', flexWrap:'wrap' }}>
              <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>Formatting:</span>
              {[['**bold**','font-weight:800'],['_italic_','font-style:italic'],
                ['__underline__','text-decoration:underline'],['==highlight==','background:#fef08a;color:#111;padding:0 3px;border-radius:2px']
              ].map(([label, style]) => (
                <span key={label} style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px' }}>
                  <code style={{ ...Object.fromEntries(style.split(';').filter(Boolean).map(s => {
                    const [k,v]=s.split(':'); return [k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()), v?.trim()];
                  })), fontFamily:'monospace', fontSize:'11px' }}>{label}</code>
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:'10px', marginTop:'14px', flexWrap:'wrap' }}>
              <button onClick={handleSave} disabled={saving || generating} style={{
                flex:'2 1 140px',
                background: saving ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                color:'#fff', border:'none', borderRadius:'12px', padding:'13px',
                fontSize:'14px', fontWeight:'700', cursor:(saving||generating) ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 4px 20px rgba(139,92,246,0.3)'
              }}>{saving ? '⏳ Saving...' : '💾 Save Chapter'}</button>

              <button onClick={() => generateChapterContent(currentTitle, activeChapter + 1)} disabled={generating} style={{
                flex:'1 1 140px',
                background: generating ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.15)',
                color: generating ? 'rgba(255,200,0,0.35)' : '#fbbf24',
                border:'1px solid rgba(245,158,11,0.3)', borderRadius:'12px', padding:'13px',
                fontSize:'14px', fontWeight:'600', cursor: generating ? 'not-allowed' : 'pointer'
              }}>{generating ? '⏳ Generating...' : '🤖 Generate with AI'}</button>

              {activeChapter < chapters.length - 1 && (
                <button onClick={() => switchChapter(activeChapter + 1)} disabled={generating} style={{
                  flex:'1 1 80px', background:'rgba(16,185,129,0.15)', color:'#34d399',
                  border:'1px solid rgba(16,185,129,0.3)', borderRadius:'12px', padding:'13px',
                  fontSize:'14px', fontWeight:'600', cursor: generating ? 'not-allowed' : 'pointer'
                }}>Next →</button>
              )}
            </div>

            {/* Export row */}
            <div style={{ display:'flex', gap:'10px', marginTop:'10px', flexWrap:'wrap' }}>
              <button onClick={handleExportPDF} disabled={exportingPDF} style={{
                flex:'1 1 120px', background:'rgba(16,185,129,0.1)', color:'#34d399',
                border:'1px solid rgba(16,185,129,0.3)', borderRadius:'12px', padding:'11px',
                fontSize:'13px', fontWeight:'600', cursor: exportingPDF ? 'not-allowed' : 'pointer'
              }}>{exportingPDF ? '⏳ Exporting...' : '📄 Export PDF'}</button>
              <button onClick={handleExportDOCX} disabled={exportingDOCX} style={{
                flex:'1 1 120px', background:'rgba(59,130,246,0.1)', color:'#93c5fd',
                border:'1px solid rgba(59,130,246,0.3)', borderRadius:'12px', padding:'11px',
                fontSize:'13px', fontWeight:'600', cursor: exportingDOCX ? 'not-allowed' : 'pointer'
              }}>{exportingDOCX ? '⏳ Exporting...' : '📝 Export DOCX'}</button>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform:scale(0); opacity:0.3; }
          40%          { transform:scale(1); opacity:1; }
        }
        textarea::placeholder { color:rgba(255,255,255,0.2); font-style:italic; }
        textarea::-webkit-scrollbar { width:6px; }
        textarea::-webkit-scrollbar-track { background:transparent; }
        textarea::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15); border-radius:3px; }
        select option { background:#302b63; color:#fff; }
      `}</style>
    </div>
  );
}
