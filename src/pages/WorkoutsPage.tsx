import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button, Chip, MenuItem, Fab,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { workoutsApi } from '../api';
import { Workout } from '../types';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import dayjs from 'dayjs';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  date: yup.string().required('Date is required'),
  durationMinutes: yup.number().min(0).nullable(),
  notes: yup.string(),
  status: yup.string().oneOf(['planned', 'completed', 'skipped']).required(),
});

type WorkoutForm = yup.InferType<typeof schema>;

export default function WorkoutsPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editWorkout, setEditWorkout] = useState<Workout | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutsApi.list().then((r) => r.data.data as Workout[]),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<WorkoutForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: { date: dayjs().format('YYYY-MM-DD'), status: 'planned' },
  });

  const createMutation = useMutation({
    mutationFn: (d: WorkoutForm) => workoutsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workouts'] }); enqueueSnackbar('Workout created!', { variant: 'success' }); closeDialog(); },
    onError: () => enqueueSnackbar('Failed to create workout', { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkoutForm }) => workoutsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workouts'] }); enqueueSnackbar('Workout updated!', { variant: 'success' }); closeDialog(); },
    onError: () => enqueueSnackbar('Failed to update workout', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workoutsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workouts'] }); enqueueSnackbar('Workout deleted', { variant: 'info' }); setDeleteId(null); },
  });

  const openDialog = (workout?: Workout) => {
    setEditWorkout(workout ?? null);
    reset(workout
      ? { title: workout.title, date: dayjs(workout.date).format('YYYY-MM-DD'), durationMinutes: workout.durationMinutes, notes: workout.notes, status: workout.status }
      : { date: dayjs().format('YYYY-MM-DD'), status: 'planned' }
    );
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditWorkout(null); };

  const onSubmit: SubmitHandler<WorkoutForm> = (d) => {
    if (editWorkout) updateMutation.mutate({ id: editWorkout._id, data: d });
    else createMutation.mutate(d);
  };

  if (isLoading) return <LoadingSpinner />;

  const workouts = (data ?? []).filter((w: Workout) => statusFilter === 'all' || w.status === statusFilter)
    .sort((a: Workout, b: Workout) => dayjs(b.date).diff(dayjs(a.date)));

  const statusColor = (s: string) => s === 'completed' ? 'success' : s === 'planned' ? 'default' : 'warning';

  return (
    <Box>
      <PageHeader title="Workouts" subtitle="Log and track your workout sessions" />

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        {['all', 'completed', 'planned', 'skipped'].map((s) => (
          <Chip key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} clickable
            color={statusFilter === s ? 'primary' : 'default'}
            onClick={() => setStatusFilter(s)}
            variant={statusFilter === s ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      {workouts.length === 0 ? (
        <EmptyState message="No workouts found." action={{ label: 'Add Workout', onClick: () => openDialog() }} />
      ) : (
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Exercises</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workouts.map((w: Workout) => (
                    <TableRow key={w._id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{w.title}</Typography>
                        {w.notes && <Typography variant="caption" color="text.secondary">{w.notes}</Typography>}
                      </TableCell>
                      <TableCell>{dayjs(w.date).format('MMM D, YYYY')}</TableCell>
                      <TableCell>{w.durationMinutes ? `${w.durationMinutes} min` : '—'}</TableCell>
                      <TableCell>{w.exercises?.length ?? 0}</TableCell>
                      <TableCell><Chip label={w.status} size="small" color={statusColor(w.status)} /></TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openDialog(w)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(w._id)}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => openDialog()}>
        <Add />
      </Fab>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editWorkout ? 'Edit Workout' : 'Add Workout'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} label="Workout Name" fullWidth error={!!errors.title} helperText={errors.title?.message} />
            )} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="date" control={control} render={({ field }) => (
                <TextField {...field} label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.date} helperText={errors.date?.message} />
              )} />
              <Controller name="durationMinutes" control={control} render={({ field }) => (
                <TextField {...field} label="Duration (min)" type="number" fullWidth />
              )} />
            </Box>
            <Controller name="status" control={control} render={({ field }) => (
              <TextField {...field} select label="Status" fullWidth>
                {['planned', 'completed', 'skipped'].map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
              </TextField>
            )} />
            <Controller name="notes" control={control} render={({ field }) => (
              <TextField {...field} label="Notes" fullWidth multiline rows={3} />
            )} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editWorkout ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Workout"
        message="Are you sure you want to delete this workout?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
