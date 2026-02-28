import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function EditEbook() {
  const { id } = useParams();
  const [ebook, setEbook] = useState(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/ebooks/${id}`).then(({ data }) => {
      setEbook(data);
      const first = data.chapters?.find(c => c.chapterNumber === 1);
      if (first) setEditContent(first.content);
    });
  }, [id]);

  useEffect(() => {
    const words = editContent.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [editContent]);

  const generateChapterContent = async (chapterTitle, chapterNumber) => {
    setGenerating(true);
    setEditContent('');
    try {
      const { data } = await API.post('/ai/generate-chapter', {
        topic: ebook.topic,
        chapterTitle,
        chapterNumber,
        tone: ebook.tone,
        language: ebook.language
      });
      setEditContent(data.content);
      await saveChapter(chapterNumber, chapterTitle, data.content);
    } catch { toast.error('Generation failed'); }
    finally { setGenerating(false); }
  };

  const saveChapter = async (chapterNumber, title, content) => {
    setSaving(true);
    try {
      const { data } = await API.put(`/ebooks/${id}/chapter`, { chapterNumber, title, content });
      setEbook(data);
      toast.success('Chapter saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    try {
      toast.loading('Generating PDF...');
      const res = await API.get(`/ebooks/${id}/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ebook.title}.pdf`;
      a.click();
      toast.dismiss();
      toast.success('PDF Downloaded!');
    } catch {
      toast.dismiss();
      toast.error('Export failed');
    }
  };

  const switchChapter = (index) => {
    setActiveChapter(index);
    const saved = ebook.chapters?.find(c => c.chapterNumber === index + 1);
    setEditContent(saved?.content || '');
  };

  if (!ebook) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Loading your eBook...</p>
      </div>
    </div>
  );

  const chapters = ebook.tableOfContents || [];
  const savedChapters = ebook.chapters || [];
  const current = savedChapters.find(c => c.chapterNumber === activeChapter + 1);
  const progress = Math.round((savedChapters.length / chapters.length) * 100);
  const currentTitle = chapters[activeChapter] || '';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        flexShrink: 0
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px'
          }}>☰</button>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 14px',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: '13px'
          }}>← Dashboard</button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <div>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>{ebook.title}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>
              {ebook.topic} • {ebook.tone} • {ebook.language}
            </p>
          </div>
        </div>

        {/* Center - Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            {savedChapters.length}/{chapters.length} chapters
          </span>
          <div style={{ width: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '6px' }}>
            <div style={{
              background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
              width: `${progress}%`,
              height: '6px',
              borderRadius: '10px',
              transition: 'width 0.5s ease'
            }}/>
          </div>
          <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '600' }}>{progress}%</span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => saveChapter(activeChapter + 1, currentTitle, editContent)}
            disabled={saving || !editContent} style={{
            background: saving ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)',
            color: '#a78bfa',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '10px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}>
            {saving ? '⏳ Saving...' : '💾 Save'}
          </button>
          <button onClick={handleExport} style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
          }}>📥 Export PDF</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 60px)' }}>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={{
            width: '280px',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto'
          }}>
            {/* Book Info */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
              <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>
                {ebook.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>
                {chapters.length} Chapters • {ebook.language}
              </p>

              {/* Mini Progress */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '4px' }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                    width: `${progress}%`,
                    height: '4px',
                    borderRadius: '10px'
                  }}/>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '4px 0 0 0' }}>
                  {progress}% Complete
                </p>
              </div>
            </div>

            {/* Chapter List */}
            <div style={{ padding: '12px', flex: 1 }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '600',
                letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px 8px' }}>
                Chapters
              </p>
              {chapters.map((ch, i) => {
                const done = savedChapters.find(c => c.chapterNumber === i + 1);
                const isActive = activeChapter === i;
                return (
                  <button key={i} onClick={() => switchChapter(i)} style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: isActive ? '1px solid rgba(139,92,246,0.5)' : '1px solid transparent',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))'
                      : 'transparent',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      width: '24px', height: '24px',
                      borderRadius: '6px',
                      background: done
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : isActive
                          ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                          : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#fff',
                      flexShrink: 0
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: isActive ? '600' : '400',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {ch.replace(/^Chapter \d+[:.] ?/i, '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Editor Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Chapter Header */}
          <div style={{
            padding: '20px 32px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 4px 0',
                textTransform: 'uppercase', letterSpacing: '1px' }}>
                Chapter {activeChapter + 1} of {chapters.length}
              </p>
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                {currentTitle}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Word Count */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '8px 14px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#a78bfa', fontSize: '16px', fontWeight: '700', margin: 0 }}>{wordCount}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: 0 }}>words</p>
              </div>

              {/* Nav Buttons */}
              <button onClick={() => activeChapter > 0 && switchChapter(activeChapter - 1)}
                disabled={activeChapter === 0} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 14px',
                color: activeChapter === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                cursor: activeChapter === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}>← Prev</button>
              <button onClick={() => activeChapter < chapters.length - 1 && switchChapter(activeChapter + 1)}
                disabled={activeChapter === chapters.length - 1} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 14px',
                color: activeChapter === chapters.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                cursor: activeChapter === chapters.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}>Next →</button>
            </div>
          </div>

          {/* Editor Body */}
          <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
            {!current && !editContent ? (
              /* Empty State */
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '2px dashed rgba(139,92,246,0.3)',
                  borderRadius: '24px',
                  padding: '60px 40px',
                  maxWidth: '480px'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>🤖</div>
                  <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
                    Ready to Write Chapter {activeChapter + 1}?
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
                    Let AI write this chapter for you instantly, or start writing manually below.
                  </p>
                  <button
                    onClick={() => generateChapterContent(currentTitle, activeChapter + 1)}
                    disabled={generating}
                    style={{
                      background: generating
                        ? 'rgba(139,92,246,0.4)'
                        : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '16px 36px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: generating ? 'not-allowed' : 'pointer',
                      boxShadow: generating ? 'none' : '0 8px 25px rgba(139,92,246,0.4)',
                      marginBottom: '14px',
                      display: 'block',
                      width: '100%'
                    }}>
                    {generating ? '⏳ AI is writing...' : '✨ Generate with AI'}
                  </button>
                  <button onClick={() => setEditContent(' ')} style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '12px 36px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    width: '100%'
                  }}>✏️ Write Manually</button>
                </div>
              </div>
            ) : generating ? (
              /* Generating State */
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px',
                  animation: 'pulse 1.5s infinite' }}>⚡</div>
                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
                  AI is Writing...
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '28px' }}>
                  Generating content for "{currentTitle}"
                </p>
                <div style={{
                  display: 'flex', gap: '8px', justifyContent: 'center'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '10px', height: '10px',
                      borderRadius: '50%',
                      background: '#8b5cf6',
                      animation: `bounce 1.2s ${i * 0.2}s infinite`
                    }}/>
                  ))}
                </div>
              </div>
            ) : (
              /* Editor */
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Book-style editor */}
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                  {/* Editor toolbar */}
                  <div style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.03)'
                  }}>
                    {['Bold', 'Italic', 'Underline'].map(tool => (
                      <button key={tool} style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>{tool[0]}</button>
                    ))}
                    <div style={{ flex: 1 }}/>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                      📝 {wordCount} words • Chapter {activeChapter + 1}
                    </span>
                  </div>

                  {/* Text Area */}
                  <textarea
                    style={{
                      width: '100%',
                      minHeight: '500px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '16px',
                      lineHeight: '1.9',
                      padding: '32px',
                      resize: 'none',
                      fontFamily: "'Georgia', serif",
                      boxSizing: 'border-box'
                    }}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Start writing your chapter content here..."
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    onClick={() => saveChapter(activeChapter + 1, currentTitle, editContent)}
                    disabled={saving}
                    style={{
                      flex: 2,
                      background: saving
                        ? 'rgba(139,92,246,0.4)'
                        : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      boxShadow: saving ? 'none' : '0 4px 20px rgba(139,92,246,0.3)'
                    }}>
                    {saving ? '⏳ Saving...' : '💾 Save Chapter'}
                  </button>
                  <button
                    onClick={() => generateChapterContent(currentTitle, activeChapter + 1)}
                    disabled={generating}
                    style={{
                      flex: 1,
                      background: 'rgba(245,158,11,0.15)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: generating ? 'not-allowed' : 'pointer'
                    }}>
                    🔄 Regenerate
                  </button>
                  {activeChapter < chapters.length - 1 && (
                    <button onClick={() => switchChapter(activeChapter + 1)} style={{
                      flex: 1,
                      background: 'rgba(16,185,129,0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>Next Chapter →</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
