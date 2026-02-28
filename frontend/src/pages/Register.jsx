import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputStyle = (name) => ({
    width: '100%',
    background: focused === name ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
    border: focused === name ? '1px solid rgba(139,92,246,0.8)' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    boxShadow: focused === name ? '0 0 20px rgba(139,92,246,0.2)' : 'none'
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif", padding: '20px'
    }}>
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '8px' }}>✨</div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '6px' }}>
            Create Account
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textAlign: 'center', marginBottom: '36px' }}>
            Start generating eBooks with AI today
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500', marginBottom: '8px', letterSpacing: '0.5px' }}>
                FULL NAME
              </label>
              <input type='text' placeholder='Username'
                style={inputStyle('name')}
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')} />
              {errors.name && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.name}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500', marginBottom: '8px', letterSpacing: '0.5px' }}>
                EMAIL ADDRESS
              </label>
              <input type='email' placeholder='you@example.com'
                style={inputStyle('email')}
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')} />
              {errors.email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500', marginBottom: '8px', letterSpacing: '0.5px' }}>
                PASSWORD
              </label>
              <input type='password' placeholder='Min 6 characters'
                style={inputStyle('password')}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')} />
              {errors.password && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>⚠ {errors.password}</p>}
            </div>

            <button type='submit' disabled={loading} style={{
              width: '100%',
              background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff', border: 'none', borderRadius: '12px',
              padding: '15px', fontSize: '16px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
              transition: 'all 0.3s ease'
            }}>
              {loading ? '⏳ Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}/>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}/>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to='/login' style={{ color: '#a78bfa', fontWeight: '600', textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

