import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Box, Typography } from '@mui/material';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Function to decode JWT token and validate expiration
const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token is expired
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = new Date().getTime();
      if (currentTime > expirationTime) {
        console.warn('Token has expired');
        return null;
      }
    }
    return payload;
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
};

function App() {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    // Validate token on app load
    if (savedToken && decodeToken(savedToken)) {
      return savedToken;
    }
    localStorage.removeItem('token');
    return null;
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        localStorage.setItem('token', token);
        setUser(decoded);
      } else {
        // Token is invalid or expired
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {!token ? (
          <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
              <Typography variant="h4" gutterBottom align="center">
                Liberia National Police - Case Management System
              </Typography>
              <Login onLogin={setToken} />
            </Box>
          </Container>
        ) : (
          <AdminDashboard token={token} user={user} onLogout={() => setToken(null)} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
