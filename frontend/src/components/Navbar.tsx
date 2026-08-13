import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  InputBase,
  Paper,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './common/ThemeToggle';
import { SearchableCitySelector } from './common/SearchableCitySelector';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [navSearchQuery, setNavSearchQuery] = useState<string>('');

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Services', path: '/services' },
    { label: 'Categories', path: '/categories' },
    { label: 'Providers', path: '/providers' },
    { label: 'Find Cooks', path: '/cooks' },
    { label: 'Find Maids', path: '/maids' },
    { label: 'Offers', path: '/offers' },
    { label: 'Support', path: '/support' },
  ];

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/cooks?search=${encodeURIComponent(navSearchQuery)}`);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        top: 0,
        zIndex: 1100,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 74, gap: 2 }}>
          {/* 1. Brand Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1.5 }}
            onClick={() => navigate('/home')}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              <SoupKitchenIcon />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Maid & Cook
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', display: 'block', letterSpacing: '0.05em' }}>
                HOME SERVICES
              </Typography>
            </Box>
          </Box>

          {/* 2. Location Selector */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <SearchableCitySelector
              variant="navbar"
              value={selectedCity}
              onChange={(val) => setSelectedCity(val.cityName)}
            />
          </Box>

          {/* 3. Search Box in Navbar (Desktop) */}
          <Paper
            component="form"
            onSubmit={handleNavSearch}
            elevation={0}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              width: 240,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '24px',
              px: 1.5,
              py: 0.5,
              transition: 'all 0.2s ease',
              '&:focus-within': {
                borderColor: '#2563EB',
                bgcolor: 'background.paper',
                boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
              },
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Search cook, maid..."
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              sx={{ fontSize: '0.85rem', flex: 1 }}
            />
          </Paper>

          {/* 4. Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {navLinks.slice(0, 5).map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.875rem',
                    px: 1.5,
                    py: 0.8,
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>

          {/* 5. Theme Toggle & Auth Actions */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            <ThemeToggle />

            {isAuthenticated && user ? (
              <>
                <Box
                  onClick={handleOpenUserMenu}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    cursor: 'pointer',
                    p: 0.6,
                    pr: 1.5,
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Avatar src={user.avatar} alt={user.name} sx={{ width: 34, height: 34, border: '2px solid #2563EB' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                      {user.name}
                    </Typography>
                    <Chip label={user.role} size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem', textTransform: 'capitalize', fontWeight: 700 }} />
                  </Box>
                  <KeyboardArrowDownIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    sx: { mt: 1.5, borderRadius: 3, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', minWidth: 190 },
                  }}
                >
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/dashboard'); }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} /> My Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/dashboard/profile'); }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} /> Profile Info
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/dashboard/bookings'); }}>
                    <BookmarkBorderIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} /> My Bookings
                  </MenuItem>
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
                    <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} /> Settings
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button variant="text" color="primary" onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>
                  Log In
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  Book Now
                </Button>
              </>
            )}
          </Box>

          {/* 6. Mobile Hamburger Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <ThemeToggle />
            <IconButton
              sx={{ color: 'text.primary' }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open Mobile Menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 290, p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={800} color="primary.main">
              Maid & Cook
            </Typography>
            <IconButton onClick={() => setMobileOpen(false)} size="small">
              ✕
            </IconButton>
          </Box>

          {/* Mobile City Selector */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block' }}>
              LOCATION
            </Typography>
            <SearchableCitySelector
              variant="hero"
              fullWidth
              value={selectedCity}
              onChange={(val) => {
                setSelectedCity(val.cityName);
                setMobileOpen(false);
              }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <List sx={{ py: 0 }}>
            {navLinks.map((link) => (
              <ListItem key={link.label} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(link.path);
                    setMobileOpen(false);
                  }}
                  sx={{ borderRadius: 2, py: 1 }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 'auto', pt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {isAuthenticated && user ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Avatar src={user.avatar} alt={user.name} />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                <Button variant="outlined" color="error" fullWidth onClick={handleLogout} startIcon={<LogoutIcon />}>
                  Logout
                </Button>
              </Box>
            ) : (
              <>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    navigate('/login');
                    setMobileOpen(false);
                  }}
                  sx={{ fontWeight: 700, borderRadius: '10px' }}
                >
                  Log In
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    navigate('/register');
                    setMobileOpen(false);
                  }}
                  sx={{ fontWeight: 700, borderRadius: '10px' }}
                >
                  Register / Book Now
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
