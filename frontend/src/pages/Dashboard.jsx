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

  const handleExport = async (id, title) => {
    try {
      const res = await API.get(`/ebooks/${id}/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.pdf`;
      a.click();
      toast.success('PDF Downloaded!');
    } catch { toast.error('Export failed'); }
  };

  const colors = [
    { bg: 'linear-gradient(135deg, #667eea, #764ba2)', light: 'rgba(102,126,234,0.15)' },
    { bg: 'linear-gradient(135deg, #f093fb, #f5576c)', light: 'rgba(240,147,251,0.15)' },
    { bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', light: 'rgba(79,172,254,0.15)' },
    { bg: 'linear-gradient(135deg, #43e97b, #38f9d7)', light: 'rgba(67,233,123,0.15)' },
    { bg: 'linear-gradient(135deg, #fa709a, #fee140)', light: 'rgba(250,112,154,0.15)' },
    { bg: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', light: 'rgba(161,140,209,0.15)' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>📚</span>
          <div>
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: 0 }}>
              eBook Generator
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
              AI-Powered Writing Platform
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '6px 16px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '14px'
          }}>
            👋 Hello, {user?.name}
          </div>
          <button onClick={() => navigate('/create')} style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(139,92,246,0.4)'
          }}>
            + New eBook
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {[
            { icon: '📖', label: 'Total eBooks', value: ebooks.length },
            { icon: '✅', label: 'Completed', value: ebooks.filter(e => e.chapters?.length === e.totalChapters).length },
            { icon: '⏳', label: 'In Progress', value: ebooks.filter(e => (e.chapters?.length || 0) < e.totalChapters).length }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{ fontSize: '36px' }}>{stat.icon}</span>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>{stat.label}</p>
                <p style={{ color: '#fff', fontSize: '28px', fontWeight: '700', margin: 0 }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: 0 }}>My eBooks</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '4px 0 0 0' }}>
              {ebooks.length} eBook{ebooks.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <button onClick={() => navigate('/create')} style={{
            background: 'rgba(139,92,246,0.2)',
            color: '#a78bfa',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '12px',
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            ✨ Create with AI
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>Loading your eBooks...</p>
          </div>
        ) : ebooks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            background: 'rgba(255,255,255,0.03)',
            border: '2px dashed rgba(255,255,255,0.1)',
            borderRadius: '24px'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ color: '#fff', fontSize: '22px', marginBottom: '8px' }}>No eBooks Yet!</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '28px', fontSize: '15px' }}>
              Create your first AI-powered eBook in minutes
            </p>
            <button onClick={() => navigate('/create')} style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139,92,246,0.4)'
            }}>
              🚀 Create First eBook
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {ebooks.map((ebook, i) => {
              const color = colors[i % colors.length];
              const progress = Math.round(((ebook.chapters?.length || 0) / ebook.totalChapters) * 100);
              return (
                <div key={ebook._id} style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Card Header */}
                  <div style={{
                    background: color.bg,
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute', top: '-20px', right: '-20px',
                      width: '100px', height: '100px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%'
                    }}/>
                    <span style={{ fontSize: '40px' }}>📘</span>
                    <div style={{
                      position: 'absolute', top: '16px', right: '16px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {ebook.tone}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      color: '#fff',
                      fontSize: '17px',
                      fontWeight: '700',
                      marginBottom: '6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {ebook.title}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>
                      {ebook.topic}
                    </p>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      {[
                        `📑 ${ebook.totalChapters} Chapters`,
                        `🌐 ${ebook.language}`
                      ].map(tag => (
                        <span key={tag} style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '20px',
                          padding: '3px 10px',
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '12px'
                        }}>{tag}</span>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Progress</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{progress}%</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', height: '6px' }}>
                        <div style={{
                          background: color.bg,
                          width: `${progress}%`,
                          height: '6px',
                          borderRadius: '10px',
                          transition: 'width 0.5s ease'
                        }}/>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/edit/${ebook._id}`)} style={{
                        flex: 1,
                        background: 'rgba(139,92,246,0.2)',
                        color: '#a78bfa',
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: '10px',
                        padding: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>✏️ Edit</button>
                      <button onClick={() => handleExport(ebook._id, ebook.title)} style={{
                        flex: 1,
                        background: 'rgba(16,185,129,0.2)',
                        color: '#34d399',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '10px',
                        padding: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>📥 PDF</button>
                      <button onClick={() => handleDelete(ebook._id)} style={{
                        background: 'rgba(239,68,68,0.2)',
                        color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        cursor: 'pointer'
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
