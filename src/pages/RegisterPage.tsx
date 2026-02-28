import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert,
  MenuItem, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authApi } from '../api';
import { setCredentials } from '../store/slices/authSlice';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Min 8 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password'),
  role: yup.string().oneOf(['athlete', 'coach']).required(),
});

type RegisterForm = yup.InferType<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
    defaultValues: { role: 'athlete' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      const { data: res } = await authApi.register({
        email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName, role: data.role,
      });
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #3F51B5 0%, #009688 100%)',
    }}>
      <Card sx={{ width: 460, mx: 2, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>FitTrack</Typography>
          <Typography variant="h6" gutterBottom>Create Account</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Join FitTrack and start your fitness journey today.</Typography>
          {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Controller name="firstName" control={control} render={({ field }) => (
                <TextField {...field} label="First Name" fullWidth margin="normal" error={!!errors.firstName} helperText={errors.firstName?.message} />
              )} />
              <Controller name="lastName" control={control} render={({ field }) => (
                <TextField {...field} label="Last Name" fullWidth margin="normal" error={!!errors.lastName} helperText={errors.lastName?.message} />
              )} />
            </Box>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Email" type="email" margin="normal" error={!!errors.email} helperText={errors.email?.message} />
            )} />
            <Controller name="password" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Password" type={showPassword ? 'text' : 'password'} margin="normal"
                error={!!errors.password} helperText={errors.password?.message}
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )}}
              />
            )} />
            <Controller name="confirmPassword" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Confirm Password" type="password" margin="normal"
                error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
            )} />
            <Controller name="role" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="I am a..." margin="normal">
                <MenuItem value="athlete">Athlete</MenuItem>
                <MenuItem value="coach">Coach</MenuItem>
              </TextField>
            )} />
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} sx={{ mt: 3, mb: 2, py: 1.5 }} size="large">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
            <Typography align="center" variant="body2">
              Already have an account?{' '}
              <Link href="/login" underline="hover" fontWeight={600}>Sign In</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
