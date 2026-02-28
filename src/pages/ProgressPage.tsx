import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper,
} from '@mui/material';
import { Edit, Delete, FitnessCenter } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { progressApi } from '../api';
import { ProgressEntry } from '../types';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import dayjs from 'dayjs';

const schema = yup.object({
  date: yup.string().required('Date is required'),
  weight: yup.number().min(0).nullable(),
  bodyFatPercentage: yup.number().min(0).max(100).nullable(),
  muscleMass: yup.number().min(0).nullable(),
  chest: yup.number().min(0).nullable(),
  waist: yup.number().min(0).nullable(),
  hips: yup.number().min(0).nullable(),
  bicep: yup.number().min(0).nullable(),
  thigh: yup.number().min(0).nullable(),
  notes: yup.string(),
});

type ProgressForm = yup.InferType<typeof schema>;

export default function ProgressPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<ProgressEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: () => progressApi.list().then((r) => r.data.data as ProgressEntry[]),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProgressForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: { date: dayjs().format('YYYY-MM-DD') },
  });

  const createMutation = useMutation({
    mutationFn: (d: ProgressForm) => progressApi.create({
      date: d.date, weight: d.weight ?? undefined, bodyFatPercentage: d.bodyFatPercentage ?? undefined,
      muscleMass: d.muscleMass ?? undefined, notes: d.notes,
      measurements: { chest: d.chest ?? undefined, waist: d.waist ?? undefined, hips: d.hips ?? undefined, bicep: d.bicep ?? undefined, thigh: d.thigh ?? undefined },
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['progress'] }); enqueueSnackbar('Entry added!', { variant: 'success' }); closeDialog(); },
    onError: () => enqueueSnackbar('Failed to save entry', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => progressApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['progress'] }); enqueueSnackbar('Entry deleted', { variant: 'info' }); setDeleteId(null); },
  });

  const openDialog = (entry?: ProgressEntry) => {
    setEditEntry(entry ?? null);
    reset(entry ? {
      date: dayjs(entry.date).format('YYYY-MM-DD'),
      weight: entry.weight, bodyFatPercentage: entry.bodyFatPercentage, muscleMass: entry.muscleMass, notes: entry.notes,
      chest: entry.measurements?.chest, waist: entry.measurements?.waist, hips: entry.measurements?.hips,
      bicep: entry.measurements?.bicep, thigh: entry.measurements?.thigh,
    } : { date: dayjs().format('YYYY-MM-DD') });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditEntry(null); };

  if (isLoading) return <LoadingSpinner />;

  const entries = (data ?? []).sort((a: ProgressEntry, b: ProgressEntry) => dayjs(a.date).diff(dayjs(b.date)));

  const chartData = entries
    .filter((e: ProgressEntry) => e.weight)
    .map((e: ProgressEntry) => ({ date: dayjs(e.date).format('MM/DD'), weight: e.weight }));

  return (
    <Box>
      <PageHeader title="Progress" subtitle="Track your body metrics over time" action={{ label: '+ Log Entry', onClick: () => openDialog() }} />

      {chartData.length > 1 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Weight Over Time</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#3F51B5" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 ? (
        <EmptyState icon={FitnessCenter} message="No progress entries yet." action={{ label: 'Log Entry', onClick: () => openDialog() }} />
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>All Entries</Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Weight (kg)</TableCell>
                    <TableCell>Body Fat %</TableCell>
                    <TableCell>Muscle Mass</TableCell>
                    <TableCell>Waist</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...entries].reverse().map((entry: ProgressEntry) => (
                    <TableRow key={entry._id}>
                      <TableCell>{dayjs(entry.date).format('MMM D, YYYY')}</TableCell>
                      <TableCell>{entry.weight ?? '—'}</TableCell>
                      <TableCell>{entry.bodyFatPercentage != null ? `${entry.bodyFatPercentage}%` : '—'}</TableCell>
                      <TableCell>{entry.muscleMass ?? '—'}</TableCell>
                      <TableCell>{entry.measurements?.waist ?? '—'}</TableCell>
                      <TableCell><Typography variant="caption" noWrap>{entry.notes ?? '—'}</Typography></TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openDialog(entry)}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(entry._id)}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editEntry ? 'Edit Entry' : 'Log Progress Entry'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit((d) => createMutation.mutate(d as ProgressForm))}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller name="date" control={control} render={({ field }) => (
              <TextField {...field} label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.date} helperText={errors.date?.message} />
            )} />
            <Grid container spacing={2}>
              {(['weight', 'bodyFatPercentage', 'muscleMass'] as const).map((key) => (
                <Grid item xs={4} key={key}>
                  <Controller name={key} control={control} render={({ field }) => (
                    <TextField {...field} label={key === 'bodyFatPercentage' ? 'Body Fat %' : key === 'muscleMass' ? 'Muscle Mass' : 'Weight (kg)'} type="number" fullWidth inputProps={{ step: '0.1' }} />
                  )} />
                </Grid>
              ))}
            </Grid>
            <Typography variant="subtitle2" color="text.secondary">Measurements (cm)</Typography>
            <Grid container spacing={2}>
              {(['chest', 'waist', 'hips', 'bicep', 'thigh'] as const).map((key) => (
                <Grid item xs={4} key={key}>
                  <Controller name={key} control={control} render={({ field }) => (
                    <TextField {...field} label={key.charAt(0).toUpperCase() + key.slice(1)} type="number" fullWidth inputProps={{ step: '0.1' }} />
                  )} />
                </Grid>
              ))}
            </Grid>
            <Controller name="notes" control={control} render={({ field }) => (
              <TextField {...field} label="Notes" fullWidth multiline rows={2} />
            )} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>Save</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Entry"
        message="Delete this progress entry?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
