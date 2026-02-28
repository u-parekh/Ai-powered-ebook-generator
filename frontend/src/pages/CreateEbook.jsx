/*import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateEbook() {
  const [form, setForm] = useState({
    title: '', topic: '', language: 'English', tone: 'Formal', totalChapters: 5
  });
  const [toc, setToc] = useState([]);
  const [loadingTOC, setLoadingTOC] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const generateTOC = async () => {
    if (!form.topic) return toast.error('Enter a topic first');
    if (!form.title) return toast.error('Enter a title first');
    setLoadingTOC(true);
    try {
      const { data } = await API.post('/ai/generate-toc', form);
      setToc(data.toc);
      setStep(2);
      toast.success('Table of contents generated!');
    } catch (err) { 
      console.error('FULL ERROR:', err);
      toast.error(err?.response?.data?.message || err.message || 'AI generation failed');
    }
    finally { setLoadingTOC(false); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const { data } = await API.post('/ebooks', { ...form, tableOfContents: toc });
      toast.success('eBook created!');
      navigate(`/edit/${data._id}`);
    } catch { toast.error('Failed to create eBook'); }
    finally { setSaving(false); }
  };

  const tones = ['Formal', 'Casual', 'Academic', 'Creative', 'Professional'];
  const languages = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Chinese', 'Spanish', 'French', 'Arabic'];
  
  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  };

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      {/* Navbar }
      <nav style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '8px 16px',
          fontSize: '13px',
          cursor: 'pointer'
        }}>← Dashboard</button>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
        <span style={{ fontSize: '24px' }}>📚</span>
        <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0 }}>
          Create New eBook
        </h1>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Step Indicator }
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', gap: '0' }}>
          {[
            { num: 1, label: 'eBook Details' },
            { num: 2, label: 'Review & Save' }
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  background: step >= s.num
                    ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                    : 'rgba(255,255,255,0.1)',
                  border: step >= s.num
                    ? 'none'
                    : '2px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxShadow: step >= s.num ? '0 4px 15px rgba(139,92,246,0.4)' : 'none'
                }}>{step > s.num ? '✓' : s.num}</div>
                <span style={{ color: step >= s.num ? '#a78bfa' : 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: '600' }}>
                  {s.label}
                </span>
              </div>
              {i === 0 && (
                <div style={{
                  width: '120px', height: '2px',
                  background: step > 1
                    ? 'linear-gradient(90deg, #8b5cf6, #6366f1)'
                    : 'rgba(255,255,255,0.1)',
                  margin: '0 12px',
                  marginBottom: '24px'
                }}/>
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            {/* Header }
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
              <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: '700', margin: '0 0 8px 0' }}>
                eBook Details
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                Fill in the details and let AI generate your eBook structure
              </p>
            </div>

            {/* Title }
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>📖 eBook Title</label>
              <input
                style={inputStyle}
                placeholder='e.g. Complete Guide to Python Programming'
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                onFocus={e => {
                  e.target.style.border = '1px solid rgba(139,92,246,0.8)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.2)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.15)';
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Topic }
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>🎯 Topic / Subject</label>
              <textarea
                style={{ ...inputStyle, height: '90px', resize: 'none' }}
                placeholder='Describe what your eBook is about in detail...'
                value={form.topic}
                onChange={e => setForm({...form, topic: e.target.value})}
                onFocus={e => {
                  e.target.style.border = '1px solid rgba(139,92,246,0.8)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.2)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.15)';
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Tone Selection }
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>🎨 Writing Tone</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {tones.map(t => (
                  <button key={t} onClick={() => setForm({...form, tone: t})} style={{
                    padding: '10px 20px',
                    borderRadius: '20px',
                    border: form.tone === t
                      ? '1px solid rgba(139,92,246,0.8)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: form.tone === t
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.3))'
                      : 'rgba(255,255,255,0.05)',
                    color: form.tone === t ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                    fontSize: '13px',
                    fontWeight: form.tone === t ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: form.tone === t ? '0 4px 15px rgba(139,92,246,0.2)' : 'none'
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Language & Chapters }
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
              <div>
                <label style={labelStyle}>🌐 Language</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.language}
                  onChange={e => setForm({...form, language: e.target.value})}
                >
                  {languages.map(l => <option key={l} value={l} style={{ background: '#302b63' }}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>📑 Number of Chapters</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setForm({...form, totalChapters: Math.max(1, form.totalChapters - 1)})} style={{
                    width: '42px', height: '42px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}>−</button>
                  <span style={{
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: '700',
                    minWidth: '40px',
                    textAlign: 'center'
                  }}>{form.totalChapters}</span>
                  <button onClick={() => setForm({...form, totalChapters: Math.min(20, form.totalChapters + 1)})} style={{
                    width: '42px', height: '42px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}>+</button>
                </div>
              </div>
            </div>

            {/* Generate Button }
            <button onClick={generateTOC} disabled={loadingTOC} style={{
              width: '100%',
              background: loadingTOC
                ? 'rgba(139,92,246,0.4)'
                : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              padding: '18px',
              fontSize: '17px',
              fontWeight: '700',
              cursor: loadingTOC ? 'not-allowed' : 'pointer',
              boxShadow: loadingTOC ? 'none' : '0 8px 25px rgba(139,92,246,0.4)',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px'
            }}>
              {loadingTOC ? (
                <span>⏳ AI is generating your eBook structure...</span>
              ) : (
                <span>🤖 Generate Table of Contents with AI</span>
              )}
            </button>

            {/* Info Cards }
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '24px' }}>
              {[
                { icon: '⚡', text: 'Instant AI generation' },
                { icon: '✏️', text: 'Fully editable content' },
                { icon: '📥', text: 'Export to PDF' }
              ].map(item => (
                <div key={item.text} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 - Review TOC }
        {step === 2 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
              <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
                Your eBook Structure
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                AI generated {toc.length} chapters for "{form.title}"
              </p>
            </div>

            {/* eBook Info }
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
              gap: '12px', marginBottom: '28px'
            }}>
              {[
                { label: 'Title', value: form.title, icon: '📖' },
                { label: 'Tone', value: form.tone, icon: '🎨' },
                { label: 'Language', value: form.language, icon: '🌐' },
                { label: 'Chapters', value: toc.length, icon: '📑' }
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    {item.label}
                  </p>
                  <p style={{
                    color: '#fff', fontSize: '13px', fontWeight: '600', margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* TOC List }
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', marginBottom: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                📋 Table of Contents
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {toc.map((ch, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      width: '32px', height: '32px',
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>{i + 1}</div>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{ch}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons }
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>← Edit Details</button>
              <button onClick={generateTOC} disabled={loadingTOC} style={{
                flex: 1,
                background: 'rgba(139,92,246,0.15)',
                color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>🔄 Regenerate</button>
              <button onClick={handleCreate} disabled={saving} style={{
                flex: 2,
                background: saving
                  ? 'rgba(16,185,129,0.4)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 8px 25px rgba(16,185,129,0.3)'
              }}>
                {saving ? '⏳ Creating...' : '✅ Create & Start Writing'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}*/

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateEbook() {
  const [form, setForm] = useState({
    title: '', topic: '', language: 'English', tone: 'Formal', totalChapters: 5
  });
  const [toc, setToc] = useState([]);
  const [loadingTOC, setLoadingTOC] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setCoverImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateTOC = async () => {
    if (!form.topic) return toast.error('Enter a topic first');
    if (!form.title) return toast.error('Enter a title first');
    setLoadingTOC(true);
    try {
      const { data } = await API.post('/ai/generate-toc', form);
      setToc(data.toc);
      setStep(2);
      toast.success('Table of contents generated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'AI generation failed, try again');
    } finally { setLoadingTOC(false); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('topic', form.topic);
      formData.append('language', form.language);
      formData.append('tone', form.tone);
      formData.append('totalChapters', form.totalChapters);
      formData.append('tableOfContents', JSON.stringify(toc));
      if (coverImage) formData.append('coverImage', coverImage);

      const { data } = await API.post('/ebooks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('eBook created!');
      navigate(`/edit/${data._id}`);
    } catch { toast.error('Failed to create eBook'); }
    finally { setSaving(false); }
  };

  const tones = ['Formal', 'Casual', 'Academic', 'Creative', 'Professional'];
  const languages = ['English', 'Hindi', 'Spanish', 'French', 'Gujarati', 'Arabic'];

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  };

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  };

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
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '8px 14px',
          fontSize: '13px',
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}>← Dashboard</button>
        <span style={{ color: 'rgba(255,255,255,0.3)', display: 'none' }}>|</span>
        <span style={{ fontSize: '22px' }}>📚</span>
        <h1 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 }}>
          Create New eBook
        </h1>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: '0' }}>
          {[{ num: 1, label: 'eBook Details' }, { num: 2, label: 'Review & Save' }].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: step >= s.num ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.1)',
                  border: step >= s.num ? 'none' : '2px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: '700', fontSize: '15px',
                  boxShadow: step >= s.num ? '0 4px 15px rgba(139,92,246,0.4)' : 'none'
                }}>{step > s.num ? '✓' : s.num}</div>
                <span style={{ color: step >= s.num ? '#a78bfa' : 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '600' }}>
                  {s.label}
                </span>
              </div>
              {i === 0 && (
                <div style={{
                  width: '80px', height: '2px',
                  background: step > 1 ? 'linear-gradient(90deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.1)',
                  margin: '0 10px', marginBottom: '22px'
                }} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '28px 24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>✨</div>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px 0' }}>eBook Details</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
                Fill in the details and let AI generate your eBook structure
              </p>
            </div>

            {/* Cover Image Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>🖼️ Cover Image (Optional)</label>
              {!coverPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(139,92,246,0.4)',
                    borderRadius: '12px',
                    padding: '28px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(139,92,246,0.05)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.8)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
                    Click to upload cover image
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '4px 0 0 0' }}>
                    PNG, JPG up to 5MB
                  </p>
                </div>
              ) : (
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <img src={coverPreview} alt="Cover" style={{
                    width: '100%', maxHeight: '200px', objectFit: 'cover',
                    borderRadius: '12px', border: '1px solid rgba(139,92,246,0.4)'
                  }} />
                  <button onClick={removeCover} style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'rgba(239,68,68,0.9)', color: '#fff',
                    border: 'none', borderRadius: '8px',
                    padding: '4px 10px', fontSize: '12px', cursor: 'pointer'
                  }}>✕ Remove</button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverImage} style={{ display: 'none' }} />
            </div>

            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>📖 eBook Title</label>
              <input style={inputStyle} placeholder='e.g. Complete Guide to Python Programming'
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                onFocus={e => { e.target.style.border = '1px solid rgba(139,92,246,0.8)'; e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.2)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Topic */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>🎯 Topic / Subject</label>
              <textarea style={{ ...inputStyle, height: '80px', resize: 'none' }}
                placeholder='Describe what your eBook is about...'
                value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                onFocus={e => { e.target.style.border = '1px solid rgba(139,92,246,0.8)'; e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.2)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Tone */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>🎨 Writing Tone</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tones.map(t => (
                  <button key={t} onClick={() => setForm({ ...form, tone: t })} style={{
                    padding: '8px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                    background: form.tone === t ? 'linear-gradient(135deg,#8b5cf6,#6366f1)' : 'rgba(255,255,255,0.07)',
                    color: form.tone === t ? '#fff' : 'rgba(255,255,255,0.6)',
                    border: form.tone === t ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    fontWeight: form.tone === t ? '600' : '400',
                    transition: 'all 0.2s'
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Language + Chapters - responsive grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>🌐 Language</label>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  {languages.map(l => <option key={l} value={l} style={{ background: '#302b63' }}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>📑 Number of Chapters</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setForm({ ...form, totalChapters: Math.max(1, form.totalChapters - 1) })} style={{
                    width: '40px', height: '40px', background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                    color: '#fff', fontSize: '18px', cursor: 'pointer', flexShrink: 0
                  }}>−</button>
                  <span style={{ color: '#fff', fontSize: '20px', fontWeight: '700', minWidth: '32px', textAlign: 'center' }}>
                    {form.totalChapters}
                  </span>
                  <button onClick={() => setForm({ ...form, totalChapters: Math.min(20, form.totalChapters + 1) })} style={{
                    width: '40px', height: '40px', background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                    color: '#fff', fontSize: '18px', cursor: 'pointer', flexShrink: 0
                  }}>+</button>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button onClick={generateTOC} disabled={loadingTOC} style={{
              width: '100%',
              background: loadingTOC ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff', border: 'none', borderRadius: '14px', padding: '16px',
              fontSize: '16px', fontWeight: '700', cursor: loadingTOC ? 'not-allowed' : 'pointer',
              boxShadow: loadingTOC ? 'none' : '0 8px 25px rgba(139,92,246,0.4)',
              transition: 'all 0.3s ease'
            }}>
              {loadingTOC ? '⏳ AI is generating...' : '🤖 Generate Table of Contents with AI'}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '20px' }}>
              {[{ icon: '⚡', text: 'Instant AI generation' }, { icon: '✏️', text: 'Fully editable' }, { icon: '📥', text: 'PDF & DOCX export' }].map(item => (
                <div key={item.text} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '10px', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{item.icon}</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
            padding: '28px 24px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>📋</div>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 6px 0' }}>Your eBook Structure</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
                AI generated {toc.length} chapters for "{form.title}"
              </p>
            </div>

            {/* Cover preview if uploaded */}
            {coverPreview && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <img src={coverPreview} alt="Cover" style={{
                  maxHeight: '160px', maxWidth: '100%', objectFit: 'cover',
                  borderRadius: '10px', border: '1px solid rgba(139,92,246,0.4)'
                }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '6px' }}>Cover Image ✓</p>
              </div>
            )}

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Title', value: form.title, icon: '📖' },
                { label: 'Tone', value: form.tone, icon: '🎨' },
                { label: 'Language', value: form.language, icon: '🌐' },
                { label: 'Chapters', value: toc.length, icon: '📑' }
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '12px', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{item.icon}</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{item.label}</p>
                  <p style={{ color: '#fff', fontSize: '12px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* TOC List */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                📋 Table of Contents
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                {toc.map((ch, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '12px 14px'
                  }}>
                    <div style={{
                      width: '28px', height: '28px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '12px', fontWeight: '700'
                    }}>{i + 1}</div>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{ch}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setStep(1)} style={{
                flex: '1 1 120px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>← Edit Details</button>
              <button onClick={generateTOC} disabled={loadingTOC} style={{
                flex: '1 1 120px', background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px',
                padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>🔄 Regenerate</button>
              <button onClick={handleCreate} disabled={saving} style={{
                flex: '2 1 200px',
                background: saving ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: 'none', borderRadius: '12px', padding: '14px',
                fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 8px 25px rgba(16,185,129,0.3)'
              }}>
                {saving ? '⏳ Creating...' : '✅ Create & Start Writing'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}