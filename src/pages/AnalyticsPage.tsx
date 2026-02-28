import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert,
} from '@mui/material';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsApi } from '../api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#3F51B5', '#009688', '#FF9800', '#E91E63', '#9C27B0'];

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsApi.myDashboard().then((r) => r.data.data),
  });

  const exportCSV = () => {
    if (!data) return;
    const rows = [['Metric', 'Value'],
      ['Total Workouts', data?.workoutsSummary?.totalSessions ?? 0],
      ['Avg Daily Calories', data?.nutritionSummary?.avgDailyCalories ?? 0],
      ['Active Goals', data?.goalsSummary?.totalActive ?? 0],
      ['Streak Days', data?.workoutsSummary?.streakDays ?? 0],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fittrack-analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Alert severity="error">Failed to load analytics.</Alert>;

  const macroData = [
    { name: 'Protein', value: data?.nutritionSummary?.avgProteinG ?? 0 },
    { name: 'Carbs', value: data?.nutritionSummary?.avgCarbsG ?? 0 },
    { name: 'Fat', value: data?.nutritionSummary?.avgFatG ?? 0 },
  ];

  const weeklyData = data?.weeklyActivity ?? [
    { day: 'Mon', workouts: 1 }, { day: 'Tue', workouts: 0 },
    { day: 'Wed', workouts: 2 }, { day: 'Thu', workouts: 1 },
    { day: 'Fri', workouts: 1 }, { day: 'Sat', workouts: 0 }, { day: 'Sun', workouts: 3 },
  ];

  const topExercises = data?.topExercises ?? [
    { name: 'Bench Press', volume: 12000 },
    { name: 'Squat', volume: 18000 },
    { name: 'Deadlift', volume: 15000 },
    { name: 'Pull-up', volume: 5000 },
    { name: 'OHP', volume: 7000 },
  ];

  const personalRecords = data?.personalRecords ?? [];

  return (
    <Box>
      <PageHeader
        title="Analytics"
        subtitle="Detailed performance analytics"
        action={{ label: 'Export CSV', onClick: exportCSV }}
      />

      <Grid container spacing={3}>
        {/* Workout Frequency */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Workout Frequency
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="workouts" fill="#3F51B5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Nutrition Macros */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Avg Daily Macros
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={macroData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {macroData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}g`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Exercises by Volume */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top Exercises by Volume
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topExercises} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={90} />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#009688" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Records */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Personal Records
              </Typography>
              {personalRecords.length === 0 ? (
                <Typography color="text.secondary">No personal records yet. Start logging workouts!</Typography>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Exercise</TableCell>
                        <TableCell>Weight</TableCell>
                        <TableCell>Reps</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {personalRecords.map((pr: { exercise: string; weight: number; reps: number; date: string }, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{pr.exercise}</TableCell>
                          <TableCell>{pr.weight} kg</TableCell>
                          <TableCell>{pr.reps}</TableCell>
                          <TableCell>{new Date(pr.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
