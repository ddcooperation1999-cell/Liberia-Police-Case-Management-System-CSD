import React, { useState } from 'react';
import { TextField, Button, Box, Alert, CircularProgress, Paper, Typography } from '@mui/material';
import axios from 'axios';

const apiUrl = 'http://localhost:3001';

// Liberia National Police Badge Component (Official Badge Design)
const PoliceBadge = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
    <svg width="180" height="220" viewBox="0 0 180 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="badgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#e8d4a2', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#d4af37', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#b8860b', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="badgeDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2c3e50', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1a252f', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Wings */}
      <g>
        {/* Left wing */}
        <path d="M 60 50 Q 20 35 10 55 Q 15 45 40 50 Q 50 48 60 50" fill="#d4af37" stroke="#8b6914" strokeWidth="1"/>
        {/* Right wing */}
        <path d="M 120 50 Q 160 35 170 55 Q 165 45 140 50 Q 130 48 120 50" fill="#d4af37" stroke="#8b6914" strokeWidth="1"/>
      </g>

      {/* Hexagonal/Octagonal outer shield */}
      <path d="M 90 30 L 130 50 L 145 95 L 130 150 L 90 170 L 50 150 L 35 95 L 50 50 Z" 
            fill="url(#badgeGold)" stroke="#8b6914" strokeWidth="2"/>

      {/* Inner shield with darker color */}
      <path d="M 90 45 L 125 60 L 135 100 L 125 145 L 90 160 L 55 145 L 45 100 L 55 60 Z" 
            fill="url(#badgeDark)" stroke="#d4af37" strokeWidth="1.5"/>

      {/* Ornate border circle */}
      <circle cx="90" cy="102" r="38" fill="none" stroke="#d4af37" strokeWidth="2" opacity="0.7"/>

      {/* Scales of Justice - Center emblem */}
      <g transform="translate(90, 95)">
        {/* Left pan */}
        <ellipse cx="-12" cy="8" rx="7" ry="5" fill="#d4af37" stroke="#8b6914" strokeWidth="1.2"/>
        {/* Right pan */}
        <ellipse cx="12" cy="8" rx="7" ry="5" fill="#d4af37" stroke="#8b6914" strokeWidth="1.2"/>
        {/* Left lever */}
        <line x1="-12" y1="0" x2="-20" y2="-8" stroke="#d4af37" strokeWidth="2"/>
        {/* Right lever */}
        <line x1="12" y1="0" x2="20" y2="-8" stroke="#d4af37" strokeWidth="2"/>
        {/* Center post */}
        <circle cx="0" cy="0" r="4" fill="#d4af37"/>
        {/* Vertical post */}
        <line x1="0" y1="-2" x2="0" y2="8" stroke="#d4af37" strokeWidth="2"/>
      </g>

      {/* Top text curved */}
      <path id="topCurve" d="M 55 50 A 45 45 0 0 1 125 50" fill="none"/>
      <text fontSize="12" fontWeight="bold" fill="#d4af37" letterSpacing="3" fontFamily="Arial, sans-serif">
        <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
          LIBERIA
        </textPath>
      </text>

      {/* Bottom text curved */}
      <path id="bottomCurve" d="M 125 154 A 45 45 0 0 1 55 154" fill="none"/>
      <text fontSize="11" fontWeight="bold" fill="#d4af37" letterSpacing="2" fontFamily="Arial, sans-serif">
        <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
          NATIONAL POLICE
        </textPath>
      </text>

      {/* Badge identifier at bottom */}
      <text x="90" y="190" fontSize="10" fontWeight="bold" fill="#d4af37" textAnchor="middle" fontFamily="Arial, sans-serif">
        OFFICIAL BADGE
      </text>
    </svg>
  </Box>
);


export default function Login({ onLogin }) {
  const [username, setUsername] = useState('dortusnimely');
  const [password, setPassword] = useState('dortusnimely');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { username: trimmedUsername });
      const res = await axios.post(`${apiUrl}/api/auth/login`, { 
        username: trimmedUsername, 
        password: trimmedPassword 
      });
      console.log('Login successful:', res.data);
      setSuccess('Login successful! Redirecting...');
      localStorage.setItem('token', res.data.token);
      setTimeout(() => {
        onLogin(res.data.token);
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      
      // Fallback: Allow demo login if backend is unavailable
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        console.log('[FALLBACK] Backend unavailable, attempting demo login...');
        
        // Mock credentials for demo
        const mockCredentials = {
          'dortusnimely': 'dortusnimely',
          'admin': 'admin123',
          'user': 'user123'
        };
        
        if (mockCredentials[trimmedUsername] === trimmedPassword) {
          console.log('[FALLBACK] Demo login successful for:', trimmedUsername);
          const demoToken = 'demo-token-' + Date.now();
          setSuccess('Demo login successful! Redirecting...');
          localStorage.setItem('token', demoToken);
          localStorage.setItem('isDemoMode', 'true');
          localStorage.setItem('user', JSON.stringify({
            username: trimmedUsername,
            role: trimmedUsername === 'dortusnimely' ? 'admin' : 'user'
          }));
          setTimeout(() => {
            onLogin(demoToken);
          }, 1000);
          return;
        }
      }
      
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to backend. Try: Username: dortusnimely, Password: dortusnimely';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ maxWidth: 420, mx: 'auto', mt: 2, p: 2 }}>
      <PoliceBadge />
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>CSD Police - Login</h2>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField 
        label="Username" 
        fullWidth 
        margin="normal" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <TextField 
        label="Password" 
        type="password" 
        fullWidth 
        margin="normal" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <Button 
        variant="contained" 
        type="submit" 
        fullWidth
        disabled={loading} 
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Login'}
      </Button>
      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
        <p><strong>Demo Credentials:</strong></p>
        <p>Username: <code>dortusnimely</code></p>
        <p>Password: <code>dortusnimely</code></p>
      </Box>
    </Box>
  );
}
