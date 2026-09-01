import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid2,
  Paper,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SERVICE_CATEGORIES } from '../../pages/Register';
import { useAuth } from '../../hooks/useAuth';

interface BecomeProviderModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BecomeProviderModal: React.FC<BecomeProviderModalProps> = ({ open, onClose, onSuccess }) => {
  const { becomeProvider } = useAuth();
  const [selectedServices, setSelectedServices] = useState<string[]>(['cook']);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleService = (catId: string) => {
    if (selectedServices.includes(catId)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== catId));
      }
    } else {
      setSelectedServices([...selectedServices, catId]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await becomeProvider({
        services: selectedServices,
      });
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      setLoading(false);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to upgrade to Provider account');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle fontWeight={800} sx={{ fontSize: '1.25rem' }}>
        Become a Service Provider
        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
          Start receiving booking requests without creating a separate account!
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ borderBottom: 'none' }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main">
              Select Services You Offer
            </Typography>
            <Chip label={`${selectedServices.length} Selected`} size="small" color="primary" sx={{ fontWeight: 800 }} />
          </Box>

          <Grid2 container spacing={1.5}>
            {SERVICE_CATEGORIES.map((cat) => {
              const isSelected = selectedServices.includes(cat.id);
              return (
                <Grid2 key={cat.id} size={{ xs: 6, sm: 4 }}>
                  <Paper
                    onClick={() => handleToggleService(cat.id)}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: isSelected ? 'primary.main' : '#E2E8F0',
                      bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    {isSelected && (
                      <CheckCircleIcon color="primary" sx={{ position: 'absolute', top: 6, right: 6, fontSize: 18 }} />
                    )}
                    <Box sx={{ mb: 0.5 }}>{cat.icon}</Box>
                    <Typography variant="caption" fontWeight={800} display="block" color={isSelected ? 'primary.main' : 'text.primary'}>
                      {cat.title}
                    </Typography>
                  </Paper>
                </Grid2>
              );
            })}
          </Grid2>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || selectedServices.length === 0}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
          sx={{ borderRadius: 2.5, fontWeight: 700, px: 3 }}
        >
          {loading ? 'Upgrading...' : 'Enable Provider Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BecomeProviderModal;
