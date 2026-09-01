import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  InputBase,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Engineering as ProviderIcon,
  Bookmark as BookingIcon,
  HomeRepairService as ServiceIcon,
  MedicalServices as MedicalServicesIcon,
  LocationCity as LocationIcon,
  ConfirmationNumber as CouponIcon,
  Notifications as NotificationIcon,
  BarChart as ReportIcon,
  Article as CmsIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Search as SearchIcon,
  AccountCircle,
} from '@mui/icons-material';

const drawerWidth = 260;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Providers', icon: <ProviderIcon />, path: '/providers' },
  { text: 'Healthcare Professionals', icon: <MedicalServicesIcon />, path: '/healthcare' },
  { text: 'Bookings', icon: <BookingIcon />, path: '/bookings' },
  { text: 'Services', icon: <ServiceIcon />, path: '/services' },
  { text: 'Locations', icon: <LocationIcon />, path: '/locations' },
  { text: 'Coupons', icon: <CouponIcon />, path: '/coupons' },
  { text: 'Notifications', icon: <NotificationIcon />, path: '/notifications' },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
  { text: 'CMS Content', icon: <CmsIcon />, path: '/cms' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Audit & Security Logs', icon: <SecurityIcon />, path: '/logs' },
];

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const drawerContent = (
    <Box sx={{ bgcolor: '#0f172a', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: '#3b82f6', fontWeight: 700 }}>A</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            Antigravity Admin
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            Enterprise Console
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isSelected ? '#60a5fa' : '#cbd5e1',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? '#60a5fa' : '#94a3b8', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isSelected ? 700 : 500 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          MaidProject Admin v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Global Search input */}
          <Paper
            elevation={0}
            sx={{
              p: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              width: 320,
              bgcolor: '#f1f5f9',
              borderRadius: 2,
            }}
          >
            <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
            <InputBase placeholder="Search users, bookings, cities..." sx={{ flex: 1, fontSize: '0.875rem' }} />
          </Paper>

          <Box sx={{ flexGrow: 1 }} />

          {/* Notification Icon */}
          <IconButton color="inherit" onClick={() => navigate('/notifications')}>
            <Badge badgeContent={4} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>

          {/* User Avatar & Menu */}
          <IconButton onClick={handleProfileMenuOpen} color="inherit" sx={{ ml: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#0f172a' }}>AD</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/logs'); }}>
              <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
              Audit Logs
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                localStorage.removeItem('adminToken');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('adminUser');
                navigate('/login', { replace: true });
              }}
            >
              <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
              Logout Admin
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Side Navigation Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Viewport */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
