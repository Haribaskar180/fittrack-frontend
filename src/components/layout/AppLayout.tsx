import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useContext } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, useTheme,
  useMediaQuery, Avatar, Divider, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, FitnessCenter, Restaurant,
  Flag, TrendingUp, People, SportsGymnastics, Analytics, Person,
  Brightness4, Brightness7, Logout,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../../store/slices/authSlice';
import { authApi } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { ColorModeContext } from '../../main';

const DRAWER_WIDTH = 250;

const navItems = [
  { label: 'Dashboard', icon: Dashboard, path: '/dashboard' },
  { label: 'Workouts', icon: FitnessCenter, path: '/workouts' },
  { label: 'Nutrition', icon: Restaurant, path: '/nutrition' },
  { label: 'Goals', icon: Flag, path: '/goals' },
  { label: 'Progress', icon: TrendingUp, path: '/progress' },
  { label: 'Exercises', icon: SportsGymnastics, path: '/exercises' },
  { label: 'Analytics', icon: Analytics, path: '/analytics' },
  { label: 'Profile', icon: Person, path: '/profile' },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, fullName, isAdmin } = useAuth();
  const colorMode = useContext(ColorModeContext);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) { /* ignore */ }
    dispatch(clearCredentials());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2, py: 2.5 }}>
        <Typography variant="h5" fontWeight={800} color="primary">
          FitTrack
        </Typography>
        <Typography variant="caption" color="text.secondary">Enterprise</Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <ListItem key={label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(path); setMobileOpen(false); }}
                sx={{
                  mx: 1, borderRadius: 2,
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'white' : 'text.primary',
                  '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: active ? 'white' : 'text.secondary' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ fontWeight: active ? 700 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
        {isAdmin && (
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => { navigate('/users'); setMobileOpen(false); }}
              sx={{
                mx: 1, borderRadius: 2,
                bgcolor: location.pathname === '/users' ? 'primary.main' : 'transparent',
                color: location.pathname === '/users' ? 'white' : 'text.primary',
                '&:hover': { bgcolor: location.pathname === '/users' ? 'primary.dark' : 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: location.pathname === '/users' ? 'white' : 'text.secondary' }}>
                <People fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Users" primaryTypographyProps={{ fontWeight: location.pathname === '/users' ? 700 : 400 }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
          {fullName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight={600} noWrap>{fullName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {user?.role}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={handleLogout} color="inherit">
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: 'text.primary',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(!mobileOpen)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: 'text.primary' }}>
            {navItems.find((n) => n.path === location.pathname)?.label ??
              (location.pathname === '/users' ? 'Users' : 'FitTrack')}
          </Typography>
          <Tooltip title="Toggle dark/light mode">
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Toolbar />
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: 8, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
