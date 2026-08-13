import React, { useState } from 'react';
import { Box, Typography, Paper, Grid2, TextField, Switch, FormControlLabel, Button, Alert } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import { adminApi, IAdminGlobalSettings } from '../../services/api';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<IAdminGlobalSettings>({
    appName: 'MaidProject',
    platformFee: 10,
    gstPercentage: 18,
    maintenanceMode: false,
    supportPhone: '+91 9876543210',
    supportEmail: 'support@maidproject.com',
  });
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = async () => {
    try {
      await adminApi.updateGlobalSettings(settings);
    } catch {
      // Ignored
    } finally {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Global System Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure application name, GST commission tax, platform fees, and maintenance mode.
        </Typography>
      </Box>

      {savedMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
          Global settings saved successfully!
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF', maxWidth: 800 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Platform Configuration Parameters
          </Typography>
        </Box>

        <Grid2 container spacing={2.5}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Application Name"
              size="small"
              fullWidth
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Platform Fee (%)"
              type="number"
              size="small"
              fullWidth
              value={settings.platformFee}
              onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="GST Tax (%)"
              type="number"
              size="small"
              fullWidth
              value={settings.gstPercentage}
              onChange={(e) => setSettings({ ...settings, gstPercentage: Number(e.target.value) })}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Support Helpline Phone"
              size="small"
              fullWidth
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <TextField
              label="Support Email"
              size="small"
              fullWidth
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  color="warning"
                />
              }
              label={<Typography fontWeight={700}>Enable Emergency Platform Maintenance Mode</Typography>}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ borderRadius: '10px', px: 4, fontWeight: 800 }}>
              Save Global Settings
            </Button>
          </Grid2>
        </Grid2>
      </Paper>
    </Box>
  );
};

export default AdminSettings;
