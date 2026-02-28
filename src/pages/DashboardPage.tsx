import { useQuery } from '@tanstack/react-query';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { FitnessCenter, Restaurant, Flag, TrendingUp } from '@mui/icons-material';
import { analyticsApi } from '../api';

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <Card sx={{ boxShadow: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" fontWeight={700}>{value}</Typography>
        </Box>
        <Box sx={{ color, fontSize: 40 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsApi.myDashboard('week').then((r) => r.data.data),
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Failed to load dashboard</Alert>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Last 7 days overview</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Workouts" value={data?.workoutsSummary?.totalSessions ?? 0} icon={<FitnessCenter fontSize="inherit" />} color="#2563eb" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avg Calories" value={data?.nutritionSummary?.avgDailyCalories ?? 0} icon={<Restaurant fontSize="inherit" />} color="#16a34a" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Goals" value={data?.goalsSummary?.totalActive ?? 0} icon={<Flag fontSize="inherit" />} color="#d97706" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Streak (days)" value={data?.workoutsSummary?.streakDays ?? 0} icon={<TrendingUp fontSize="inherit" />} color="#7c3aed" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Recent Workouts</Typography>
              {data?.recentWorkouts?.length === 0 && <Typography color="text.secondary">No workouts logged yet.</Typography>}
              {data?.recentWorkouts?.map((w: any) => (
                <Box key={w._id} sx={{ py: 1, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant="body1">{w.title || 'Unnamed workout'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(w.date).toLocaleDateString()} · {w.durationMinutes ?? '—'} min
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Nutrition Summary</Typography>
              {[
                { label: 'Avg Protein', value: `${data?.nutritionSummary?.avgProteinG ?? 0}g` },
                { label: 'Avg Carbs', value: `${data?.nutritionSummary?.avgCarbsG ?? 0}g` },
                { label: 'Avg Fat', value: `${data?.nutritionSummary?.avgFatG ?? 0}g` },
                { label: 'Days Logged', value: data?.nutritionSummary?.loggedDays ?? 0 },
              ].map((row) => (
                <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography color="text.secondary">{row.label}</Typography>
                  <Typography fontWeight={600}>{row.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
