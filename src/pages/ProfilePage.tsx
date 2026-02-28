import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Avatar,
  Divider, MenuItem, Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useMutation } from '@tanstack/react-query';
import { usersApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import PageHeader from '../components/common/PageHeader';

const profileSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  bio: yup.string(),
  height: yup.number().min(0).nullable(),
  weight: yup.number().min(0).nullable(),
  dateOfBirth: yup.string(),
  fitnessLevel: yup.string().oneOf(['beginner', 'intermediate', 'advanced', '']),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'Min 8 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

type ProfileForm = yup.InferType<typeof profileSchema>;
type PasswordForm = yup.InferType<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, fullName } = useAuth();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [profileSuccess, setProfileSuccess] = useState(false);

  const { control: pc, handleSubmit: phs, formState: { errors: pe } } = useForm<ProfileForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      firstName: user?.profile?.firstName ?? '',
      lastName: user?.profile?.lastName ?? '',
      bio: user?.profile?.bio ?? '',
      height: user?.profile?.height ?? undefined,
      weight: user?.profile?.weight ?? undefined,
      dateOfBirth: user?.profile?.dateOfBirth ? user.profile.dateOfBirth.slice(0, 10) : '',
      fitnessLevel: (user?.profile?.fitnessLevel as '' | 'beginner' | 'intermediate' | 'advanced') ?? '',
    },
  });

  const { control: pwc, handleSubmit: pwhs, reset: pwreset, formState: { errors: pwe } } = useForm<PasswordForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(passwordSchema) as any,
  });

  const profileMutation = useMutation({
    mutationFn: (d: ProfileForm) => usersApi.update(user!._id, { profile: d }),
    onSuccess: (res) => {
      dispatch(setCredentials({ user: res.data.data, accessToken: localStorage.getItem('accessToken')! }));
      enqueueSnackbar('Profile updated!', { variant: 'success' });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: () => enqueueSnackbar('Failed to update profile', { variant: 'error' }),
  });

  const passwordMutation = useMutation({
    mutationFn: (d: PasswordForm) => usersApi.update(user!._id, { currentPassword: d.currentPassword, newPassword: d.newPassword }),
    onSuccess: () => { enqueueSnackbar('Password changed!', { variant: 'success' }); pwreset(); },
    onError: () => enqueueSnackbar('Failed to change password', { variant: 'error' }),
  });

  return (
    <Box>
      <PageHeader title="Profile" subtitle="Manage your account information" />

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 72, height: 72, fontSize: 28, bgcolor: 'primary.main' }}>
                  {fullName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                  <Typography variant="caption" sx={{ textTransform: 'capitalize', color: 'primary.main' }}>
                    {user?.role}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}
              <Box component="form" onSubmit={phs((d) => profileMutation.mutate(d as ProfileForm))}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller name="firstName" control={pc} render={({ field }) => (
                      <TextField {...field} label="First Name" fullWidth error={!!pe.firstName} helperText={pe.firstName?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="lastName" control={pc} render={({ field }) => (
                      <TextField {...field} label="Last Name" fullWidth error={!!pe.lastName} helperText={pe.lastName?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="bio" control={pc} render={({ field }) => (
                      <TextField {...field} label="Bio" fullWidth multiline rows={3} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="height" control={pc} render={({ field }) => (
                      <TextField {...field} label="Height (cm)" type="number" fullWidth inputProps={{ step: '0.1' }} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="weight" control={pc} render={({ field }) => (
                      <TextField {...field} label="Weight (kg)" type="number" fullWidth inputProps={{ step: '0.1' }} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="dateOfBirth" control={pc} render={({ field }) => (
                      <TextField {...field} label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="fitnessLevel" control={pc} render={({ field }) => (
                      <TextField {...field} select label="Fitness Level" fullWidth>
                        <MenuItem value="">Not specified</MenuItem>
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                      </TextField>
                    )} />
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={profileMutation.isPending}>
                  {profileMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Change Password</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box component="form" onSubmit={pwhs((d) => passwordMutation.mutate(d as PasswordForm))} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller name="currentPassword" control={pwc} render={({ field }) => (
                  <TextField {...field} label="Current Password" type="password" fullWidth error={!!pwe.currentPassword} helperText={pwe.currentPassword?.message} />
                )} />
                <Controller name="newPassword" control={pwc} render={({ field }) => (
                  <TextField {...field} label="New Password" type="password" fullWidth error={!!pwe.newPassword} helperText={pwe.newPassword?.message} />
                )} />
                <Controller name="confirmPassword" control={pwc} render={({ field }) => (
                  <TextField {...field} label="Confirm Password" type="password" fullWidth error={!!pwe.confirmPassword} helperText={pwe.confirmPassword?.message} />
                )} />
                <Button type="submit" variant="outlined" disabled={passwordMutation.isPending}>
                  {passwordMutation.isPending ? 'Updating...' : 'Change Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
