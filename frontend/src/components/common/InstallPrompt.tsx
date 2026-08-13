import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Button, Slide, IconButton } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 1400,
          p: 2.5,
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          maxWidth: 380,
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <GetAppIcon />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" fontWeight={800} color="text.primary">
            Install MaidProject App
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Fast access, offline search & direct booking alerts.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <IconButton size="small" onClick={handleDismiss} aria-label="Dismiss app install prompt">
            <CloseIcon fontSize="small" />
          </IconButton>
          <Button variant="contained" size="small" onClick={handleInstall} sx={{ borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
            Install
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
};

export default InstallPrompt;
