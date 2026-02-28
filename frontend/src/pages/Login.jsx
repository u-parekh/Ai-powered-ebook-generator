import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '20px'
    },
    card: {
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '24px',
      padding: '48px 40px',
      width: '100%',
      maxWidth: '420px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
    },
    logo: {
      fontSize: '48px',
      textAlign: 'center',
      marginBottom: '8px'
    },
    title: {
      color: '#ffffff',
      fontSize: '28px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '6px'
    },
    subtitle: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '36px'
    },
    label: {
      display: 'block',
      color: 'rgba(255,255,255,0.7)',
      fontSize: '13px',
      fontWeight: '500',
      marginBottom: '8px',
      letterSpacing: '0.5px'
    },
    inputWrapper: {
      marginBottom: '20px'
    },
    input: (name) => ({
      width: '100%',
      background: focused === name
        ? 'rgba(255,255,255,0.12)'
        : 'rgba(255,255,255,0.07)',
      border: focused === name
        ? '1px solid rgba(139,92,246,0.8)'
        : '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '14px 16px',
      color: '#ffffff',
      fontSize: '15px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      boxShadow: focused === name ? '0 0 20px rgba(139,92,246,0.2)' : 'none'
    }),
    error: {
      color: '#f87171',
      fontSize: '12px',
      marginTop: '6px'
    },
    button: {
      width: '100%',
      background: loading
        ? 'rgba(139,92,246,0.5)'
        : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      padding: '15px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      marginTop: '8px',
      boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
      transition: 'all 0.3s ease',
      letterSpacing: '0.5px'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '24px 0'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: 'rgba(255,255,255,0.1)'
    },
    dividerText: {
      color: 'rgba(255,255,255,0.3)',
      fontSize: '12px'
    },
    registerText: {
      textAlign: 'center',
      color: 'rgba(255,255,255,0.5)',
      fontSize: '14px'
    },
    registerLink: {
      color: '#a78bfa',
      fontWeight: '600',
      textDecoration: 'none'
    },
    floatingOrbs: {
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 0
    }
  };

  return (
    <div style={styles.page}>
      {/* Floating background orbs */}
      <div style={styles.floatingOrbs}>
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%'
        }}/>
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }}/>
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        <div style={styles.card}>
          <div style={styles.logo}>📚</div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your eBook Generator</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                type='email'
                placeholder='you@example.com'
                style={styles.input('email')}
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
              />
              {errors.email && <p style={styles.error}>⚠ {errors.email}</p>}
            </div>

            <div style={styles.inputWrapper}>
              <label style={styles.label}>PASSWORD</label>
              <input
                type='password'
                placeholder='Enter your password'
                style={styles.input('password')}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
              />
              {errors.password && <p style={styles.error}>⚠ {errors.password}</p>}
            </div>

            <button type='submit' style={styles.button} disabled={loading}>
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}/>
            <span style={styles.dividerText}>OR</span>
            <div style={styles.dividerLine}/>
          </div>

          <p style={styles.registerText}>
            Don't have an account?{' '}
            <Link to='/register' style={styles.registerLink}>Create one free →</Link>
          </p>
        </div>

        {/* Feature badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
          {['🤖 AI Powered', '📥 PDF Export', '✏️ Easy Editing'].map(f => (
            <span key={f} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '6px 14px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px'
            }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
