import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, LinearProgress, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button, MenuItem, List, ListItem,
  ListItemText, ListItemSecondaryAction, Divider, Card, CardContent, Chip,
} from '@mui/material';
import { Delete, Edit, NavigateBefore, NavigateNext, Add } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { nutritionApi } from '../api';
import { NutritionLog } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import dayjs from 'dayjs';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const schema = yup.object({
  foodName: yup.string().required('Food name is required'),
  calories: yup.number().min(0).required('Calories required'),
  protein: yup.number().min(0).required(),
  carbs: yup.number().min(0).required(),
  fat: yup.number().min(0).required(),
  mealType: yup.string().oneOf(MEAL_TYPES).required(),
  servingSize: yup.string(),
  date: yup.string().required(),
});

type NutritionForm = yup.InferType<typeof schema>;

const DAILY_TARGETS = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

export default function NutritionPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLog, setEditLog] = useState<NutritionLog | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['nutrition', selectedDate],
    queryFn: () => nutritionApi.list({ date: selectedDate }).then((r) => r.data.data as NutritionLog[]),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<NutritionForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: { mealType: 'breakfast', calories: 0, protein: 0, carbs: 0, fat: 0, date: selectedDate },
  });

  const createMutation = useMutation({
    mutationFn: (d: NutritionForm) => nutritionApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['nutrition'] }); enqueueSnackbar('Log added!', { variant: 'success' }); closeDialog(); },
    onError: () => enqueueSnackbar('Failed to save', { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => nutritionApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['nutrition'] }); enqueueSnackbar('Log deleted', { variant: 'info' }); setDeleteId(null); },
  });

  const openDialog = (meal: string, log?: NutritionLog) => {
    setEditLog(log ?? null);
    reset(log
      ? { foodName: log.foodName, calories: log.calories, protein: log.protein, carbs: log.carbs, fat: log.fat, mealType: log.mealType, servingSize: log.servingSize, date: selectedDate }
      : { mealType: meal as typeof MEAL_TYPES[number], calories: 0, protein: 0, carbs: 0, fat: 0, date: selectedDate }
    );
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditLog(null); };

  const logs = data ?? [];

  const totals = logs.reduce((acc: typeof DAILY_TARGETS, l: NutritionLog) => ({
    calories: acc.calories + l.calories,
    protein: acc.protein + l.protein,
    carbs: acc.carbs + l.carbs,
    fat: acc.fat + l.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const macros = [
    { key: 'calories', label: 'Calories', unit: 'kcal', color: '#3F51B5' },
    { key: 'protein', label: 'Protein', unit: 'g', color: '#009688' },
    { key: 'carbs', label: 'Carbs', unit: 'g', color: '#FF9800' },
    { key: 'fat', label: 'Fat', unit: 'g', color: '#E91E63' },
  ] as const;

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Date navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => setSelectedDate(dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD'))}>
          <NavigateBefore />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          {dayjs(selectedDate).isSame(dayjs(), 'day') ? 'Today' : dayjs(selectedDate).format('ddd, MMM D YYYY')}
        </Typography>
        <IconButton onClick={() => setSelectedDate(dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD'))} disabled={dayjs(selectedDate).isSame(dayjs(), 'day')}>
          <NavigateNext />
        </IconButton>
        <Button variant="outlined" size="small" onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}>Today</Button>
      </Box>

      {/* Macro Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Daily Summary</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
            {macros.map(({ key, label, unit, color }) => {
              const val = totals[key];
              const target = DAILY_TARGETS[key];
              const pct = Math.min(100, Math.round((val / target) * 100));
              return (
                <Box key={key}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{val}{unit} / {target}{unit}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={pct} sx={{ borderRadius: 4, height: 8, '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Meals by type */}
      {MEAL_TYPES.map((mealType) => {
        const mealLogs = logs.filter((l: NutritionLog) => l.mealType === mealType);
        return (
          <Card key={mealType} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{mealType}</Typography>
                  {mealLogs.length > 0 && (
                    <Chip label={`${mealLogs.reduce((s: number, l: NutritionLog) => s + l.calories, 0)} kcal`} size="small" />
                  )}
                </Box>
                <IconButton size="small" color="primary" onClick={() => openDialog(mealType)}>
                  <Add />
                </IconButton>
              </Box>
              {mealLogs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Nothing logged for {mealType}.</Typography>
              ) : (
                <List dense disablePadding>
                  {mealLogs.map((log: NutritionLog, i: number) => (
                    <Box key={log._id}>
                      {i > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={log.foodName}
                          secondary={`${log.calories} kcal · P: ${log.protein}g · C: ${log.carbs}g · F: ${log.fat}g${log.servingSize ? ` · ${log.servingSize}` : ''}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton size="small" onClick={() => openDialog(mealType, log)}><Edit fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteId(log._id)}><Delete fontSize="small" /></IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        );
      })}

      {logs.length === 0 && (
        <EmptyState message="No nutrition logged for this day." action={{ label: 'Log Food', onClick: () => openDialog('breakfast') }} />
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editLog ? 'Edit Log' : 'Add Food'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit((d) => createMutation.mutate(d as NutritionForm))}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller name="foodName" control={control} render={({ field }) => (
              <TextField {...field} label="Food Name" fullWidth error={!!errors.foodName} helperText={errors.foodName?.message} />
            )} />
            <Controller name="mealType" control={control} render={({ field }) => (
              <TextField {...field} select label="Meal Type" fullWidth>
                {MEAL_TYPES.map((m) => <MenuItem key={m} value={m} sx={{ textTransform: 'capitalize' }}>{m}</MenuItem>)}
              </TextField>
            )} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => (
                <Controller key={key} name={key} control={control} render={({ field }) => (
                  <TextField {...field} label={`${key.charAt(0).toUpperCase() + key.slice(1)} (${key === 'calories' ? 'kcal' : 'g'})`} type="number" fullWidth error={!!errors[key]} helperText={(errors[key] as { message?: string })?.message} />
                )} />
              ))}
            </Box>
            <Controller name="servingSize" control={control} render={({ field }) => (
              <TextField {...field} label="Serving Size" fullWidth placeholder="e.g. 100g, 1 cup" />
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
        title="Delete Log"
        message="Delete this nutrition log entry?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
