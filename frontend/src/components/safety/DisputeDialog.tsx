import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GavelIcon from '@mui/icons-material/Gavel';
import { Button } from '../Button';
import api from '../../services/api';

interface DisputeDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
}

export const DisputeDialog: React.FC<DisputeDialogProps> = ({
  open,
  onClose,
  bookingId,
}) => {
  const [reason, setReason] = useState('Task Not Completed');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe your dispute details');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/safety/disputes', {
        bookingId,
        reason,
        description: description.trim(),
      });
      setSuccessMsg('Dispute opened successfully. Our resolution team will contact you.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to open dispute. An active dispute may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon color="warning" />
          <Typography variant="h6" fontWeight={800}>
            Open Booking Dispute
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {successMsg ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {successMsg}
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <TextField
              label="Dispute Reason"
              select
              fullWidth
              size="small"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Task Not Completed">Task Not Completed</MenuItem>
              <MenuItem value="Worker Did Not Arrive">Worker Did Not Arrive</MenuItem>
              <MenuItem value="Poor Service Quality">Poor Service Quality</MenuItem>
              <MenuItem value="Property Damage">Property Damage</MenuItem>
              <MenuItem value="Incorrect Charge">Incorrect Charge / Refund Claim</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              label="Detailed Explanation"
              multiline
              rows={4}
              fullWidth
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the dispute issue clearly for support review..."
            />
          </Box>
        )}
      </DialogContent>

      {!successMsg && (
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button variant="text" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Submit Dispute'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default DisputeDialog;
