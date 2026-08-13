import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const DashboardSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'My Bookings', path: '/dashboard/bookings', icon: <BookmarkBorderIcon /> },
    { label: 'Saved Providers', path: '/dashboard/providers', icon: <FavoriteBorderIcon /> },
    { label: 'Notifications', path: '/dashboard/notifications', icon: <NotificationsNoneIcon /> },
    { label: 'Addresses', path: '/dashboard/addresses', icon: <LocationOnIcon /> },
    { label: 'Wallet', path: '/dashboard/wallet', icon: <AccountBalanceWalletIcon /> },
    { label: 'My Profile', path: '/dashboard/profile', icon: <PersonOutlineIcon /> },
    { label: 'Settings', path: '/dashboard/settings', icon: <SettingsIcon /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#FFFFFF',
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        p: 2.5,
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Profile Info Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 3 }}>
        <Avatar src={user?.avatar} alt={user?.name || 'User'} sx={{ width: 46, height: 46, border: '2px solid #2563EB' }} />
        <Box>
          <Typography variant="subtitle2" fontWeight={800} lineHeight={1.2}>
            {user?.name || 'Aarav Mehta'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {user?.email || 'aarav.mehta@example.com'}
          </Typography>
          <Chip label="Verified Member" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800, mt: 0.5 }} />
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Navigation List */}
      <List disablePadding>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '10px',
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'rgba(37, 99, 235, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#FFFFFF' : 'primary.main', minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Logout Action */}
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            color: 'error.main',
            '&:hover': { bgcolor: '#FEF2F2' },
          }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 38 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}
          />
        </ListItemButton>
      </ListItem>
    </Box>
  );
};

export default DashboardSidebar;
