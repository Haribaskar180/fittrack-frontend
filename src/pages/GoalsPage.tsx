import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, LinearProgress,
  Tooltip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { goalsApi } from '../api';
import { Goal } from '../types';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import dayjs from 'dayjs';

const goalSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  type: yup.string().oneOf(['weight_loss', 'muscle_gain', 'endurance', 'strength', 'custom']).required(),
  targetValue: yup.number().min(0).required('Target value is required'),
  currentValue: yup.number().min(0).required('Current value is required'),
  unit: yup.string(),
  deadline: yup.string(),
});

type GoalForm = yup.InferType<typeof goalSchema>;

const TYPE_LABELS: Record<string, string> = {
  weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain',
  endurance: 'Endurance', strength: 'Strength', custom: 'Custom',
};

function getGoalColor(pct: number) {
  if (pct >= 70) return 'success';
  if (pct >= 40) return 'warning';
  return 'error';
}

export default function GoalsPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.list().then((r) => r.data.data as Goal[]),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<GoalForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(goalSchema) as any,
    defaultValues: { type: 'custom', targetValue: 0, currentValue: 0 },
  });

  const createMutation = useMutation({
    mutationFn: (d: GoalForm) => goalsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); enqueueSnackbar('Goal created!', { variant: 'success' }); closeDialog(); },
    onError: () => enqueueSnackbar('Failed to create goal', { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GoalForm }) => goalsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); enqueueSnackbar('Goal updated!', { variant: 'success' }); closeDialog(); },
    onError: () => enqueueSnackbar('Failed to update goal', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['goals'] }); enqueueSnackbar('Goal deleted', { variant: 'info' }); setDeleteId(null); },
  });

  const openDialog = (goal?: Goal) => {
    setEditGoal(goal ?? null);
    reset(goal ? { title: goal.title, description: goal.description, type: goal.type, targetValue: goal.targetValue, currentValue: goal.currentValue, unit: goal.unit, deadline: goal.deadline ? dayjs(goal.deadline).format('YYYY-MM-DD') : '' } : { type: 'custom', targetValue: 0, currentValue: 0 });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditGoal(null); };

  const onSubmit: SubmitHandler<GoalForm> = (d) => {
    if (editGoal) updateMutation.mutate({ id: editGoal._id, data: d });
    else createMutation.mutate(d);
  };

  if (isLoading) return <LoadingSpinner />;

  const goals = data ?? [];

  return (
    <Box>
      <PageHeader title="Goals" subtitle="Track your fitness objectives" action={{ label: '+ Add Goal', onClick: () => openDialog() }} />

      {goals.length === 0 ? (
        <EmptyState message="No goals yet. Set your first fitness goal!" action={{ label: 'Add Goal', onClick: () => openDialog() }} />
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
            const color = getGoalColor(pct);
            return (
              <Grid item xs={12} sm={6} md={4} key={goal._id}>
                <Card sx={{ height: '100%', borderTop: 4, borderColor: color === 'success' ? 'success.main' : color === 'warning' ? 'warning.main' : 'error.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" fontWeight={600}>{goal.title}</Typography>
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openDialog(goal)}><Edit fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(goal._id)}><Delete fontSize="small" /></IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Chip label={TYPE_LABELS[goal.type] ?? goal.type} size="small" sx={{ mb: 1.5 }} />
                    {goal.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{goal.description}</Typography>}
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2" fontWeight={600}>{goal.currentValue} / {goal.targetValue} {goal.unit ?? ''}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={pct} color={color} sx={{ borderRadius: 4, height: 10 }} />
                    </Box>
                    {goal.deadline && (
                      <Typography variant="caption" color="text.secondary">
                        Deadline: {dayjs(goal.deadline).format('MMM D, YYYY')}
                      </Typography>
                    )}
                    <Chip label={`${pct}%`} size="small" color={color} sx={{ ml: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editGoal ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} label="Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />
            )} />
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} label="Description" fullWidth multiline rows={2} />
            )} />
            <Controller name="type" control={control} render={({ field }) => (
              <TextField {...field} select label="Type" fullWidth>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </TextField>
            )} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="targetValue" control={control} render={({ field }) => (
                <TextField {...field} label="Target Value" type="number" fullWidth error={!!errors.targetValue} helperText={errors.targetValue?.message} />
              )} />
              <Controller name="currentValue" control={control} render={({ field }) => (
                <TextField {...field} label="Current Value" type="number" fullWidth error={!!errors.currentValue} helperText={errors.currentValue?.message} />
              )} />
              <Controller name="unit" control={control} render={({ field }) => (
                <TextField {...field} label="Unit" fullWidth placeholder="kg, lbs, min..." />
              )} />
            </Box>
            <Controller name="deadline" control={control} render={({ field }) => (
              <TextField {...field} label="Deadline" type="date" fullWidth InputLabelProps={{ shrink: true }} />
            )} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editGoal ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
