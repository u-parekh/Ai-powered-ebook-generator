import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/ebooks').then(({ data }) => {
      setEbooks(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this eBook?')) return;
    await API.delete(`/ebooks/${id}`);
    setEbooks(ebooks.filter(e => e._id !== id));
    toast.success('eBook deleted');
  };

  const handleExportPDF = async (id, title) => {
    try {
      toast.loading('Generating PDF...');
      const res = await API.get(`/ebooks/${id}/export/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `${title}.pdf`; a.click();
      toast.dismiss(); toast.success('PDF Downloaded!');
    } catch { toast.dismiss(); toast.error('Export failed'); }
  };

  const handleExportDOCX = async (id, title) => {
    try {
      toast.loading('Generating DOCX...');
      const res = await API.get(`/ebooks/${id}/export/docx`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `${title}.docx`; a.click();
      toast.dismiss(); toast.success('DOCX Downloaded!');
    } catch { toast.dismiss(); toast.error('Export failed'); }
  };

  const colors = [
    { bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
    { bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
    { bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
    { bg: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
    { bg: 'linear-gradient(135deg,#fa709a,#fee140)' },
    { bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>📚</span>
          <div>
            <h1 style={{ color: '#fff', fontSize: '17px', fontWeight: '700', margin: 0 }}>eBook Generator</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>AI-Powered Writing Platform</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '18px', padding: '5px 14px', color: 'rgba(255,255,255,0.7)', fontSize: '13px'
          }}>👋 {user?.name}</div>
          <button onClick={() => navigate('/create')} style={{
            background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff',
            border: 'none', borderRadius: '10px', padding: '8px 16px',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(139,92,246,0.4)'
          }}>+ New eBook</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            padding: '8px 14px', fontSize: '13px', cursor: 'pointer'
          }}>Logout</button>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            { icon: '📖', label: 'Total eBooks', value: ebooks.length },
            { icon: '✅', label: 'Completed', value: ebooks.filter(e => e.chapters?.length === e.totalChapters).length },
            { icon: '⏳', label: 'In Progress', value: ebooks.filter(e => (e.chapters?.length || 0) < e.totalChapters).length }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
              padding: '20px', display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <span style={{ fontSize: '30px' }}>{stat.icon}</span>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>{stat.label}</p>
                <p style={{ color: '#fff', fontSize: '26px', fontWeight: '700', margin: 0 }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>My eBooks</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0 0' }}>
              {ebooks.length} eBook{ebooks.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <button onClick={() => navigate('/create')} style={{
            background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
            border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px',
            padding: '9px 18px', fontSize: '13px', cursor: 'pointer', fontWeight: '600'
          }}>✨ Create with AI</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
            <p>Loading your eBooks...</p>
          </div>
        ) : ebooks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'rgba(255,255,255,0.03)',
            border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '12px' }}>📝</div>
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>No eBooks Yet!</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px', fontSize: '14px' }}>
              Create your first AI-powered eBook in minutes
            </p>
            <button onClick={() => navigate('/create')} style={{
              background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff',
              border: 'none', borderRadius: '12px', padding: '13px 28px',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139,92,246,0.4)'
            }}>🚀 Create First eBook</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
            {ebooks.map((ebook, i) => {
              const color = colors[i % colors.length];
              const progress = Math.round(((ebook.chapters?.length || 0) / ebook.totalChapters) * 100);
              return (
                <div key={ebook._id} style={{
                  background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
                  overflow: 'hidden', transition: 'transform 0.2s,box-shadow 0.2s', cursor: 'pointer'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Card Header - cover image or gradient */}
                  <div style={{
                    height: '100px', position: 'relative', overflow: 'hidden',
                    background: color.bg
                  }}>
                    {ebook.coverImage ? (
                      <img src={`http://localhost:5000${ebook.coverImage}`} alt="cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <div style={{
                          position: 'absolute', top: '-15px', right: '-15px',
                          width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%'
                        }} />
                        <span style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '32px' }}>📘</span>
                      </>
                    )}
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                      borderRadius: '14px', padding: '3px 10px',
                      color: '#fff', fontSize: '11px', fontWeight: '600'
                    }}>{ebook.tone}</div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '4px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>{ebook.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '12px',
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>{ebook.topic}</p>

                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {[`📑 ${ebook.totalChapters} Ch.`, `🌐 ${ebook.language}`].map(tag => (
                        <span key={tag} style={{
                          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px', padding: '2px 9px', color: 'rgba(255,255,255,0.6)', fontSize: '11px'
                        }}>{tag}</span>
                      ))}
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Progress</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{progress}%</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '5px' }}>
                        <div style={{ background: color.bg, width: `${progress}%`, height: '5px', borderRadius: '8px', transition: 'width 0.5s' }} />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => navigate(`/edit/${ebook._id}`)} style={{
                        flex: '1 1 60px', background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
                        border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px',
                        padding: '7px 6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                      }}>✏️ Edit</button>
                      <button onClick={() => handleExportPDF(ebook._id, ebook.title)} style={{
                        flex: '1 1 60px', background: 'rgba(16,185,129,0.2)', color: '#34d399',
                        border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px',
                        padding: '7px 6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                      }}>📄 PDF</button>
                      <button onClick={() => handleExportDOCX(ebook._id, ebook.title)} style={{
                        flex: '1 1 60px', background: 'rgba(59,130,246,0.2)', color: '#93c5fd',
                        border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px',
                        padding: '7px 6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                      }}>📝 DOCX</button>
                      <button onClick={() => handleDelete(ebook._id)} style={{
                        background: 'rgba(239,68,68,0.2)', color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
                        padding: '7px 10px', fontSize: '12px', cursor: 'pointer'
                      }}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
