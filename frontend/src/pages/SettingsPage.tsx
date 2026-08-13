import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';

import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { setThemeMode, showSnackbar } from '../store/uiSlice';
import { Button } from '../components';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.ui.themeMode);

  const [language, setLanguage] = useState('en');
  const [emailNotif, setEmailNotif] = useState(true);
  const [whatsappNotif, setWhatsappNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [promoNotif, setPromoNotif] = useState(true);

  const handleSaveSettings = () => {
    dispatch(showSnackbar({ message: 'Settings & Preferences saved successfully!', severity: 'success' }));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={800} color="text.primary">
            Account & Application Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage theme preferences, languages, notification channels, and privacy controls.
          </Typography>
        </Box>

        <Stack spacing={4}>
          {/* Appearance & Theme */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <DarkModeIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                Appearance & Dark Mode
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select theme mode for MaidProject application.
            </Typography>

            <Stack direction="row" spacing={2}>
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={themeMode === mode ? 'contained' : 'outlined'}
                  onClick={() => dispatch(setThemeMode(mode))}
                  sx={{ borderRadius: '10px', fontWeight: 800, textTransform: 'capitalize' }}
                >
                  {mode} Mode
                </Button>
              ))}
            </Stack>
          </Paper>

          {/* Regional & Language */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <LanguageIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                Language & Region
              </Typography>
            </Box>

            <Select
              fullWidth
              size="small"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              sx={{ borderRadius: '10px', maxWidth: 300 }}
            >
              <MenuItem value="en">English (India)</MenuItem>
              <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
              <MenuItem value="kn">ಕನ್ನಡ (Kannada)</MenuItem>
              <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
              <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
              <MenuItem value="mr">मराठी (Marathi)</MenuItem>
            </Select>
          </Paper>

          {/* Notification Preferences */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <NotificationsActiveIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                Notification Channels
              </Typography>
            </Box>

            <Stack spacing={1}>
              <FormControlLabel
                control={<Switch checked={whatsappNotif} onChange={(e) => setWhatsappNotif(e.target.checked)} color="success" />}
                label={<Typography variant="body2" fontWeight={700}>WhatsApp Staff & Booking Status Alerts</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} color="primary" />}
                label={<Typography variant="body2" fontWeight={700}>Email Invoice & Payment Receipts</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} color="primary" />}
                label={<Typography variant="body2" fontWeight={700}>SMS OTP & Security Alerts</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={promoNotif} onChange={(e) => setPromoNotif(e.target.checked)} color="primary" />}
                label={<Typography variant="body2" fontWeight={700}>Promotional Offers & Festive Discounts</Typography>}
              />
            </Stack>
          </Paper>

          {/* Privacy & Security */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                Privacy & Data Controls
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your phone number and exact address are protected under 256-bit SSL encryption.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Button variant="contained" color="primary" onClick={handleSaveSettings} sx={{ borderRadius: '12px', fontWeight: 800, px: 4 }}>
              Save Preference Changes
            </Button>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default SettingsPage;
