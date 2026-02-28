import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert,
  MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '../api';
import { setCredentials } from '../store/slices/authSlice';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'athlete' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    setForm({ ...form, [e.target.name as string]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      dispatch(setCredentials({ user: data.data.user, accessToken: data.data.accessToken }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Card sx={{ width: 450, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>FitTrack</Typography>
          <Typography variant="h6" gutterBottom>Create Account</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} fullWidth margin="normal" required />
              <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} fullWidth margin="normal" required />
            </Box>
            <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} margin="normal" required helperText="Min 8 characters" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select name="role" value={form.role} label="Role" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <MenuItem value="athlete">Athlete</MenuItem>
                <MenuItem value="coach">Coach</MenuItem>
              </Select>
            </FormControl>
            <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 3, mb: 2, py: 1.5 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <Typography align="center">
              Already have an account?{' '}
              <Link href="/login" underline="hover">Sign In</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
