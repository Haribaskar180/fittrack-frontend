import { useQuery } from '@tanstack/react-query';
import {
  Box, Grid, Card, CardContent, Typography, Alert, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress,
} from '@mui/material';
import {
  FitnessCenter, Restaurant, Flag, Whatshot,
} from '@mui/icons-material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { analyticsApi } from '../api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import dayjs from 'dayjs';

const COLORS = ['#3F51B5', '#009688', '#FF9800', '#E91E63', '#9C27B0', '#4CAF50'];

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsApi.myDashboard('week').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Alert severity="error">Failed to load dashboard data.</Alert>;

  const weeklyData = data?.weeklyActivity ?? [
    { day: 'Mon', workouts: 1 }, { day: 'Tue', workouts: 0 },
    { day: 'Wed', workouts: 2 }, { day: 'Thu', workouts: 1 },
    { day: 'Fri', workouts: 0 }, { day: 'Sat', workouts: 1 }, { day: 'Sun', workouts: 0 },
  ];

  const caloriesTrend = data?.caloriesTrend ?? Array.from({ length: 14 }, (_, i) => ({
    date: dayjs().subtract(13 - i, 'day').format('MM/DD'),
    calories: Math.floor(Math.random() * 800 + 1600),
  }));

  const muscleGroups = data?.muscleGroups ?? [
    { name: 'Chest', value: 25 }, { name: 'Back', value: 20 },
    { name: 'Legs', value: 30 }, { name: 'Shoulders', value: 10 },
    { name: 'Arms', value: 15 },
  ];

  const recentWorkouts = data?.recentWorkouts ?? [];
  const goals = data?.activeGoals ?? [];

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Your fitness overview for this week" />

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={FitnessCenter}
            value={data?.workoutsSummary?.totalSessions ?? 0}
            label="Total Workouts"
            color="#3F51B5"
            trend={{ value: 12, label: 'vs last week' }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Restaurant}
            value={`${data?.nutritionSummary?.avgDailyCalories ?? 0} kcal`}
            label="Calories This Week"
            color="#009688"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Flag}
            value={data?.goalsSummary?.totalActive ?? 0}
            label="Active Goals"
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Whatshot}
            value={`${data?.workoutsSummary?.streakDays ?? 0} days`}
            label="Current Streak"
            color="#E91E63"
            trend={{ value: 5, label: 'personal best' }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Weekly Activity Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Weekly Activity
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
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

        {/* Calories Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Calorie Trend (14 days)
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={caloriesTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="calories" stroke="#009688" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Goal Progress */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Goal Progress
              </Typography>
              {goals.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No active goals.</Typography>
              ) : (
                goals.map((g: { _id: string; title: string; currentValue: number; targetValue: number }) => {
                  const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                  return (
                    <Box key={g._id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{g.title}</Typography>
                        <Typography variant="body2" fontWeight={600}>{pct}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        color={pct >= 75 ? 'success' : pct >= 40 ? 'warning' : 'error'}
                        sx={{ borderRadius: 4, height: 8 }}
                      />
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Muscle Group Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Muscle Group Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={muscleGroups} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {muscleGroups.map((_: unknown, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Workouts */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Workouts
              </Typography>
              {recentWorkouts.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No workouts logged yet.</Typography>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentWorkouts.slice(0, 5).map((w: { _id: string; title: string; date: string; status: string; durationMinutes?: number }) => (
                        <TableRow key={w._id}>
                          <TableCell>{w.title}</TableCell>
                          <TableCell>{dayjs(w.date).format('MMM D')}</TableCell>
                          <TableCell>
                            <Chip
                              label={w.status}
                              size="small"
                              color={w.status === 'completed' ? 'success' : w.status === 'planned' ? 'default' : 'warning'}
                            />
                          </TableCell>
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
