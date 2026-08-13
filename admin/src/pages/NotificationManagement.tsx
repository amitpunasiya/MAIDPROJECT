import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';

export const NotificationManagement: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'customer' | 'cook' | 'maid' | 'provider'>('all');
  const [loading, setLoading] = useState(false);
  const [sentAlert, setSentAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [history, setHistory] = useState<any[]>([]);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please enter both title and message.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await adminApi.broadcastNotification({
        title: title.trim(),
        body: message.trim(),
        targetRole: targetAudience,
      });

      setHistory([
        {
          id: String(Date.now()),
          title: title.trim(),
          message: message.trim(),
          audience: targetAudience,
          sentAt: new Date().toLocaleString(),
        },
        ...history,
      ]);
      setTitle('');
      setMessage('');
      setSentAlert(true);
      setTimeout(() => setSentAlert(false), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch broadcast notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Notification Broadcast & Engagement
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Send push notifications, SMS announcements, and in-app alerts to customers and service staff.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Send Broadcast Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Broadcast New Notification
            </Typography>

            {sentAlert && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Broadcast notification dispatched successfully to targets!
              </Alert>
            )}

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="Target Audience"
                fullWidth
                size="small"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
              >
                <MenuItem value="all">All Users (Customers & Providers)</MenuItem>
                <MenuItem value="customer">Customers Only</MenuItem>
                <MenuItem value="cook">Cooks Only</MenuItem>
                <MenuItem value="maid">Maids Only</MenuItem>
                <MenuItem value="provider">All Providers Only</MenuItem>
              </TextField>

              <TextField
                label="Notification Title"
                fullWidth
                size="small"
                placeholder="e.g. Weekend Discount Offer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <TextField
                label="Notification Message"
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="Enter push notification body..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSendNotification}
                disabled={loading}
              >
                {loading ? 'Dispatching...' : 'Send Broadcast Now'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Sent History */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Recent Sent Broadcasts
            </Typography>
            {history.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No recent broadcast sessions recorded in current session.
              </Typography>
            ) : (
              <List>
                {history.map((item) => (
                  <ListItem key={item.id} sx={{ borderBottom: '1px solid #f1f5f9', py: 1.5 }}>
                    <ListItemText
                      primary={item.title}
                      secondary={`${item.message} • ${item.sentAt}`}
                    />
                    <Chip label={item.audience.toUpperCase()} size="small" color="info" />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NotificationManagement;
