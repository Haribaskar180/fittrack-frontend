import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Dashboard, FitnessCenter, Restaurant,
  Flag, TrendingUp, People, SportsGymnastics } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../../store/slices/authSlice';
import { authApi } from '../../api';
import { RootState } from '../../store';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Workouts', icon: <FitnessCenter />, path: '/workouts' },
  { label: 'Nutrition', icon: <Restaurant />, path: '/nutrition' },
  { label: 'Goals', icon: <Flag />, path: '/goals' },
  { label: 'Progress', icon: <TrendingUp />, path: '/progress' },
  { label: 'Exercises', icon: <SportsGymnastics />, path: '/exercises' },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) { /* ignore */ }
    dispatch(clearCredentials());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ px: 2, mb: 1, fontWeight: 700, color: 'primary.main' }}>
        FitTrack
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {user?.role === 'admin' && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/users')}>
              <ListItemIcon><People /></ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)} edge="start" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>FitTrack Enterprise</Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.profile?.firstName} ({user?.role})
          </Typography>
          <ListItemButton onClick={handleLogout} sx={{ width: 'auto', color: 'inherit' }}>
            Logout
          </ListItemButton>
        </Toolbar>
      </AppBar>

      <Drawer variant={isMobile ? 'temporary' : 'permanent'} open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}>
        <Toolbar />
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
