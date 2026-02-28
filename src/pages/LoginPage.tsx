import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '../api';
import { setCredentials } from '../store/slices/authSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      dispatch(setCredentials({ user: data.data.user, accessToken: data.data.accessToken }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Card sx={{ width: 400, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>FitTrack</Typography>
          <Typography variant="h6" gutterBottom>Sign In</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} margin="normal" required autoFocus />
            <TextField fullWidth label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} margin="normal" required />
            <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 3, mb: 2, py: 1.5 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Typography align="center">
              Don't have an account?{' '}
              <Link href="/register" underline="hover">Register</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
