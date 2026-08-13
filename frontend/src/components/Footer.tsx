import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid2,
  Typography,
  IconButton,
  Divider,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppStore';
import { showSnackbar } from '../store/uiSlice';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    dispatch(showSnackbar({ message: 'Thank you for subscribing to our newsletter!', severity: 'success' }));
    setEmail('');
  };

  const quickLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Find Cooks', path: '/cooks' },
    { label: 'Find Maids', path: '/maids' },
    { label: 'Services', path: '/services' },
    { label: 'Offers & Deals', path: '/offers' },
  ];

  const serviceLinks = [
    { label: 'Full-Time Cook', path: '/cooks' },
    { label: 'Part-Time Maid', path: '/maids' },
    { label: 'Deep Home Cleaning', path: '/services' },
    { label: 'Festive Catering', path: '/cooks' },
    { label: 'Baby & Elderly Care', path: '/maids' },
  ];

  return (
    <Box sx={{ bgcolor: '#0F172A', color: '#94A3B8', pt: 8, pb: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={4}>
          {/* Brand Bio */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                }}
              >
                <SoupKitchenIcon fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={800} color="#FFF">
                Maid & Cook
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 3 }}>
              Connecting households with background-verified, skilled professional home cooks and maids for convenient, flexible hourly or monthly bookings.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" aria-label="Facebook page" sx={{ color: '#94A3B8', '&:hover': { color: '#60A5FA' } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" aria-label="Twitter page" sx={{ color: '#94A3B8', '&:hover': { color: '#60A5FA' } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" aria-label="Instagram page" sx={{ color: '#94A3B8', '&:hover': { color: '#E1306C' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" aria-label="LinkedIn page" sx={{ color: '#94A3B8', '&:hover': { color: '#60A5FA' } }}>
                <LinkedInIcon />
              </IconButton>
            </Stack>
          </Grid2>

          {/* Quick Links */}
          <Grid2 size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#FFF" gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {quickLinks.map((item) => (
                <Typography
                  key={item.label}
                  variant="body2"
                  onClick={() => navigate(item.path)}
                  sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>
          </Grid2>

          {/* Services */}
          <Grid2 size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#FFF" gutterBottom>
              Services
            </Typography>
            <Stack spacing={1}>
              {serviceLinks.map((service) => (
                <Typography
                  key={service.label}
                  variant="body2"
                  onClick={() => navigate(service.path)}
                  sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}
                >
                  {service.label}
                </Typography>
              ))}
            </Stack>
          </Grid2>

          {/* Contact & Newsletter */}
          <Grid2 size={{ xs: 12, sm: 4, md: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#FFF" gutterBottom>
              Newsletter & Contact
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOnIcon fontSize="small" color="primary" />
                <Typography variant="body2">Bengaluru, Karnataka, India</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PhoneIcon fontSize="small" color="primary" />
                <Typography variant="body2">+91 98765 43210</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailIcon fontSize="small" color="primary" />
                <Typography variant="body2">support@maidcook.com</Typography>
              </Box>
            </Stack>
            <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Enter email..."
                size="small"
                variant="outlined"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  bgcolor: '#1E293B',
                  borderRadius: 1,
                  input: { color: '#FFF' },
                  '& fieldset': { borderColor: '#334155' },
                }}
              />
              <Button type="submit" variant="contained" color="primary" size="small">
                Subscribe
              </Button>
            </Box>
          </Grid2>
        </Grid2>

        <Divider sx={{ my: 4, borderColor: '#1E293B' }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption">
            © {new Date().getFullYear()} Maid & Cook Booking Platform. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" onClick={() => navigate('/help')} sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}>
              Privacy Policy
            </Typography>
            <Typography variant="caption" onClick={() => navigate('/help')} sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}>
              Terms of Service
            </Typography>
            <Typography variant="caption" onClick={() => navigate('/support')} sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}>
              Support Center
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
