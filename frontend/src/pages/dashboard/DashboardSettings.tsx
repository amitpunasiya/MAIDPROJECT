import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Alert,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { Button } from '../../components';
import { useAuth } from '../../hooks/useAuth';

export const DashboardSettings: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSaveSettings = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box>
      <DashboardHeader title="Account Settings & Preferences" subtitle="Customize theme, language, notifications, and privacy options." />

      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
        {savedAlert && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
            Settings saved successfully!
          </Alert>
        )}

        {/* Display & Language Settings */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DarkModeIcon color="primary" /> App Interface & Language
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Dark Mode Theme
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enable sleek dark interface for night browsing.
                </Typography>
              </Box>
              <Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} color="primary" />
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Preferred App Language
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Select language for service listings and alerts.
                  </Typography>
                </Box>
              </Box>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select value={language} onChange={(e) => setLanguage(e.target.value)} sx={{ borderRadius: '10px' }}>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Hindi">हिंदी (Hindi)</MenuItem>
                  <MenuItem value="Kannada">ಕನ್ನಡ (Kannada)</MenuItem>
                  <MenuItem value="Tamil">தமிழ் (Tamil)</MenuItem>
                  <MenuItem value="Telugu">తెలుగు (Telugu)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Notifications Preference */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon color="primary" /> Notification Channels
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={<Switch checked={pushNotif} onChange={(e) => setPushNotif(e.target.checked)} color="primary" />}
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>Push Notifications</Typography>
                  <Typography variant="caption" color="text.secondary">Real-time status updates on staff arrival and booking approval.</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={<Switch checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} color="primary" />}
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>Email Invoices & Receipts</Typography>
                  <Typography variant="caption" color="text.secondary">Receive digital GST invoices and monthly booking summaries.</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={<Switch checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} color="primary" />}
              label={
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>SMS Booking Alerts</Typography>
                  <Typography variant="caption" color="text.secondary">Receive OTPs and critical booking notifications via SMS.</Typography>
                </Box>
              }
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Security & Logout */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" /> Security & Account
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSaveSettings} sx={{ borderRadius: '10px', px: 3, fontWeight: 800 }}>
              Save Settings
            </Button>

            <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ borderRadius: '10px', fontWeight: 700 }}>
              Logout Account
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardSettings;
