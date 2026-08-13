import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
  width?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open = true,
  onClose,
  variant = 'permanent',
  width = 240,
}) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/home' },
    { label: 'My Bookings', icon: <EventNoteIcon />, path: '/home' },
    { label: 'Services', icon: <RoomServiceIcon />, path: '/home' },
    { label: 'Profile', icon: <PersonIcon />, path: '/home' },
  ];

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid #E2E8F0',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight={800} color="primary.main">
          {user ? user.name : 'Chef & Maid'}
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: 'auto', flexGrow: 1, py: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (onClose) onClose();
                }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => {
            logout();
            navigate('/login');
          }}
          sx={{ borderRadius: 2, color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
