import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, TextField, MenuItem,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Chip, InputAdornment, FormGroup, FormControlLabel, Checkbox, Drawer,
  Divider, Rating,
} from '@mui/material';
import { Edit, Delete, Search, FilterList, SportsGymnastics } from '@mui/icons-material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { exercisesApi } from '../api';
import { Exercise } from '../types';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Calves', 'Forearms'];
const EQUIPMENT = ['Barbell', 'Dumbbell', 'Bodyweight', 'Machine', 'Cable', 'Resistance Band', 'Kettlebell', 'Other'];
const DIFFICULTY = ['beginner', 'intermediate', 'advanced'];

const schema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string(),
  muscleGroups: yup.array().of(yup.string() as yup.StringSchema).min(1, 'Select at least one muscle group'),
  equipment: yup.string(),
  difficulty: yup.string().oneOf(DIFFICULTY),
  instructions: yup.string(),
});

type ExerciseForm = yup.InferType<typeof schema>;

export default function ExercisesPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { isAdmin, isCoach } = useAuth();
  const [search, setSearch] = useState('');
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [muscleFilter, setMuscleFilter] = useState<string[]>([]);
  const [equipFilter, setEquipFilter] = useState<string[]>([]);
  const [diffFilter, setDiffFilter] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEx, setEditEx] = useState<Exercise | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => exercisesApi.list().then((r) => r.data.data as Exercise[]),
  });

  const { control, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<ExerciseForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: { muscleGroups: [], difficulty: 'beginner' },
  });

  const selectedMuscles = watch('muscleGroups') ?? [];

  const createMutation = useMutation({
    mutationFn: (d: ExerciseForm) => exercisesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises'] }); enqueueSnackbar('Exercise created!', { variant: 'success' }); closeDialog(); },
    onError: () => enqueueSnackbar('Failed to create exercise', { variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExerciseForm }) => exercisesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises'] }); enqueueSnackbar('Exercise updated!', { variant: 'success' }); closeDialog(); },
    onError: () => enqueueSnackbar('Failed to update exercise', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => exercisesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercises'] }); enqueueSnackbar('Exercise deleted', { variant: 'info' }); setDeleteId(null); },
  });

  const openDialog = (ex?: Exercise) => {
    setEditEx(ex ?? null);
    reset(ex ? { name: ex.name, description: ex.description, muscleGroups: ex.muscleGroups, equipment: ex.equipment, difficulty: ex.difficulty, instructions: ex.instructions } : { muscleGroups: [], difficulty: 'beginner' });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditEx(null); };

  const onSubmit: SubmitHandler<ExerciseForm> = (d) => {
    if (editEx) updateMutation.mutate({ id: editEx._id, data: d });
    else createMutation.mutate(d);
  };

  if (isLoading) return <LoadingSpinner />;

  const exercises = (data ?? []).filter((ex: Exercise) => {
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (muscleFilter.length && !muscleFilter.some((m) => ex.muscleGroups?.includes(m))) return false;
    if (equipFilter.length && !equipFilter.includes(ex.equipment ?? '')) return false;
    if (diffFilter.length && !diffFilter.includes(ex.difficulty ?? '')) return false;
    return true;
  });

  const difficultyRating = (d?: string) => d === 'beginner' ? 1 : d === 'intermediate' ? 2 : 3;

  return (
    <Box>
      <PageHeader title="Exercise Library" subtitle="Browse and manage exercises" action={(isAdmin || isCoach) ? { label: '+ Add Exercise', onClick: () => openDialog() } : undefined} />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search exercises..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ flex: 1 }}
          size="small"
        />
        <Button variant="outlined" startIcon={<FilterList />} onClick={() => setFilterDrawer(true)}>
          Filters {(muscleFilter.length + equipFilter.length + diffFilter.length) > 0 && `(${muscleFilter.length + equipFilter.length + diffFilter.length})`}
        </Button>
      </Box>

      {exercises.length === 0 ? (
        <EmptyState icon={SportsGymnastics} message="No exercises found." />
      ) : (
        <Grid container spacing={2}>
          {exercises.map((ex: Exercise) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={ex._id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{ex.name}</Typography>
                    {(isAdmin || isCoach) && (
                      <Box>
                        <IconButton size="small" onClick={() => openDialog(ex)}><Edit fontSize="small" /></IconButton>
                        {isAdmin && <IconButton size="small" color="error" onClick={() => setDeleteId(ex._id)}><Delete fontSize="small" /></IconButton>}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {ex.muscleGroups?.map((m) => <Chip key={m} label={m} size="small" color="primary" variant="outlined" />)}
                  </Box>
                  {ex.equipment && <Chip label={ex.equipment} size="small" sx={{ mb: 1 }} />}
                  {ex.difficulty && <Rating value={difficultyRating(ex.difficulty)} max={3} size="small" readOnly />}
                  {ex.description && <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>{ex.description}</Typography>}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filter Drawer */}
      <Drawer anchor="right" open={filterDrawer} onClose={() => setFilterDrawer(false)}>
        <Box sx={{ width: 280, p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Filters</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>Muscle Group</Typography>
          <FormGroup sx={{ mb: 2 }}>
            {MUSCLE_GROUPS.map((m) => (
              <FormControlLabel key={m} label={m} control={
                <Checkbox checked={muscleFilter.includes(m)} size="small"
                  onChange={(e) => setMuscleFilter(e.target.checked ? [...muscleFilter, m] : muscleFilter.filter((x) => x !== m))} />
              } />
            ))}
          </FormGroup>
          <Typography variant="subtitle2" gutterBottom>Equipment</Typography>
          <FormGroup sx={{ mb: 2 }}>
            {EQUIPMENT.map((eq) => (
              <FormControlLabel key={eq} label={eq} control={
                <Checkbox checked={equipFilter.includes(eq)} size="small"
                  onChange={(e) => setEquipFilter(e.target.checked ? [...equipFilter, eq] : equipFilter.filter((x) => x !== eq))} />
              } />
            ))}
          </FormGroup>
          <Typography variant="subtitle2" gutterBottom>Difficulty</Typography>
          <FormGroup>
            {DIFFICULTY.map((d) => (
              <FormControlLabel key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} control={
                <Checkbox checked={diffFilter.includes(d)} size="small"
                  onChange={(e) => setDiffFilter(e.target.checked ? [...diffFilter, d] : diffFilter.filter((x) => x !== d))} />
              } />
            ))}
          </FormGroup>
          <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={() => { setMuscleFilter([]); setEquipFilter([]); setDiffFilter([]); }}>Clear Filters</Button>
        </Box>
      </Drawer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editEx ? 'Edit Exercise' : 'Add Exercise'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} label="Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )} />
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} label="Description" fullWidth multiline rows={2} />
            )} />
            <Box>
              <Typography variant="subtitle2" gutterBottom>Muscle Groups *</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {MUSCLE_GROUPS.map((m) => (
                  <Chip key={m} label={m} clickable
                    color={selectedMuscles.includes(m) ? 'primary' : 'default'}
                    onClick={() => {
                      const curr = selectedMuscles;
                      setValue('muscleGroups', curr.includes(m) ? curr.filter((x) => x !== m) : [...curr, m]);
                    }}
                  />
                ))}
              </Box>
              {errors.muscleGroups && <Typography variant="caption" color="error">{errors.muscleGroups.message}</Typography>}
            </Box>
            <Controller name="equipment" control={control} render={({ field }) => (
              <TextField {...field} select label="Equipment" fullWidth>
                {EQUIPMENT.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
              </TextField>
            )} />
            <Controller name="difficulty" control={control} render={({ field }) => (
              <TextField {...field} select label="Difficulty" fullWidth>
                {DIFFICULTY.map((d) => <MenuItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>)}
              </TextField>
            )} />
            <Controller name="instructions" control={control} render={({ field }) => (
              <TextField {...field} label="Instructions" fullWidth multiline rows={3} />
            )} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editEx ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Exercise"
        message="Are you sure you want to delete this exercise?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
