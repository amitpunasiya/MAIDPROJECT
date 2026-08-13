import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';
import { AdminLoading } from '../components/common/AdminStateComponents';

export const SettingsManagement: React.FC = () => {
  const [savedAlert, setSavedAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    platformName: 'MaidProject Enterprise',
    supportEmail: 'admin@maidproject.com',
    supportPhone: '+91 80 4000 8000',
    taxPercentage: 5,
    platformCommissionPercentage: 10,
    cancellationFee: 50,
    autoAssignProviders: false,
    maxSearchRadiusKm: 25,
    enableRazorpay: true,
    enableStripe: false,
    enableCod: true,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getPlatformSettings();
      const s = res.data?.settings || res.settings || res.data || res;
      setSettings((prev) => ({
        ...prev,
        platformName: s.platformName || prev.platformName,
        supportEmail: s.supportEmail || prev.supportEmail,
        supportPhone: s.supportPhone || prev.supportPhone,
        taxPercentage: s.taxPercentage ?? prev.taxPercentage,
        platformCommissionPercentage: s.platformCommissionPercentage ?? prev.platformCommissionPercentage,
        cancellationFee: s.cancellationFee ?? prev.cancellationFee,
        autoAssignProviders: typeof s.autoAssignProviders === 'boolean' ? s.autoAssignProviders : prev.autoAssignProviders,
        maxSearchRadiusKm: s.maxSearchRadiusKm ?? prev.maxSearchRadiusKm,
        enableRazorpay: typeof s.paymentGateways?.razorpayEnabled === 'boolean' ? s.paymentGateways.razorpayEnabled : prev.enableRazorpay,
        enableStripe: typeof s.paymentGateways?.stripeEnabled === 'boolean' ? s.paymentGateways.stripeEnabled : prev.enableStripe,
        enableCod: typeof s.paymentGateways?.codEnabled === 'boolean' ? s.paymentGateways.codEnabled : prev.enableCod,
        emailNotifications: typeof s.notifications?.emailEnabled === 'boolean' ? s.notifications.emailEnabled : prev.emailNotifications,
        smsNotifications: typeof s.notifications?.smsEnabled === 'boolean' ? s.notifications.smsEnabled : prev.smsNotifications,
        pushNotifications: typeof s.notifications?.pushEnabled === 'boolean' ? s.notifications.pushEnabled : prev.pushNotifications,
      }));
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch platform settings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await adminApi.updatePlatformSettings({
        platformName: settings.platformName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        taxPercentage: Number(settings.taxPercentage),
        platformCommissionPercentage: Number(settings.platformCommissionPercentage),
        cancellationFee: Number(settings.cancellationFee),
        autoAssignProviders: settings.autoAssignProviders,
        maxSearchRadiusKm: Number(settings.maxSearchRadiusKm),
        paymentGateways: {
          razorpayEnabled: settings.enableRazorpay,
          stripeEnabled: settings.enableStripe,
          codEnabled: settings.enableCod,
        },
        notifications: {
          emailEnabled: settings.emailNotifications,
          smsEnabled: settings.smsNotifications,
          pushEnabled: settings.pushNotifications,
        },
      });

      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update platform settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoading message="Loading platform configuration..." />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Global System Settings & Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure payment gateways, notification channels, platform commission fees, and operational limits.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Box>

      {savedAlert && (
        <Alert severity="success" sx={{ mb: 3 }}>
          System Settings updated successfully on server!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              General Platform Settings
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Application Name"
                fullWidth
                size="small"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              />
              <TextField
                label="Admin Support Email"
                fullWidth
                size="small"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
              <TextField
                label="Support Contact Phone"
                fullWidth
                size="small"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              />
              <TextField
                label="Platform Commission (%)"
                type="number"
                fullWidth
                size="small"
                value={settings.platformCommissionPercentage}
                onChange={(e) => setSettings({ ...settings, platformCommissionPercentage: Number(e.target.value) })}
              />
              <TextField
                label="GST / Tax Rate (%)"
                type="number"
                fullWidth
                size="small"
                value={settings.taxPercentage}
                onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })}
              />
              <TextField
                label="Cancellation Fee (₹)"
                type="number"
                fullWidth
                size="small"
                value={settings.cancellationFee}
                onChange={(e) => setSettings({ ...settings, cancellationFee: Number(e.target.value) })}
              />
              <TextField
                label="Max Search Radius (KM)"
                type="number"
                fullWidth
                size="small"
                value={settings.maxSearchRadiusKm}
                onChange={(e) => setSettings({ ...settings, maxSearchRadiusKm: Number(e.target.value) })}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Payment Gateways & Notification Channels
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableRazorpay}
                    onChange={(e) => setSettings({ ...settings, enableRazorpay: e.target.checked })}
                    color="primary"
                  />
                }
                label="Enable Razorpay Payment Gateway"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableCod}
                    onChange={(e) => setSettings({ ...settings, enableCod: e.target.checked })}
                    color="primary"
                  />
                }
                label="Enable Cash on Delivery (COD)"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoAssignProviders}
                    onChange={(e) => setSettings({ ...settings, autoAssignProviders: e.target.checked })}
                    color="primary"
                  />
                }
                label="Enable Auto-Assign Providers on Booking"
              />

              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2 }}>
                Notification Channels
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                    color="primary"
                  />
                }
                label="In-App Push Notifications"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                    color="primary"
                  />
                }
                label="SMS Alerts Channel"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    color="primary"
                  />
                }
                label="Email Alerts Channel"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsManagement;
