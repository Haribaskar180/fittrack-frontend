import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authApi } from '../api';
import { setCredentials } from '../store/slices/authSlice';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(1, 'Password is required').required('Password is required'),
});

type LoginForm = yup.InferType<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const { data: res } = await authApi.login(data);
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #3F51B5 0%, #009688 100%)',
    }}>
      <Card sx={{ width: 420, mx: 2, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>FitTrack</Typography>
          <Typography variant="h6" gutterBottom>Sign In</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Welcome back! Enter your credentials to continue.</Typography>
          {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Email" type="email" margin="normal" autoFocus
                error={!!errors.email} helperText={errors.email?.message} />
            )} />
            <Controller name="password" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Password" type={showPassword ? 'text' : 'password'} margin="normal"
                error={!!errors.password} helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )} />
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} sx={{ mt: 3, mb: 2, py: 1.5 }} size="large">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
            <Typography align="center" variant="body2">
              Don't have an account?{' '}
              <Link href="/register" underline="hover" fontWeight={600}>Register</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
