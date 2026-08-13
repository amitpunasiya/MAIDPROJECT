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
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { Button } from '../Button';
import api from '../../services/api';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId?: string;
  targetUserName?: string;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onClose,
  bookingId,
  targetUserName = 'User',
}) => {
  const [category, setCategory] = useState('Safety Concern');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the issue or safety concern');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/safety/reports', {
        bookingId,
        category,
        description: description.trim(),
      });
      setSuccessMsg('Safety report submitted to admin for immediate review.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportProblemIcon color="error" />
          <Typography variant="h6" fontWeight={800}>
            Report {targetUserName}
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
              label="Report Category"
              select
              fullWidth
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Safety Concern">Safety Concern / Threat</MenuItem>
              <MenuItem value="Unprofessional Behavior">Unprofessional Behavior</MenuItem>
              <MenuItem value="Property Damage">Property Damage</MenuItem>
              <MenuItem value="Harassment">Harassment</MenuItem>
              <MenuItem value="Fraud/Payment Issue">Fraud / Payment Issue</MenuItem>
              <MenuItem value="Worker Did Not Arrive">Worker Did Not Arrive</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              label="Detailed Description"
              multiline
              rows={4}
              fullWidth
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details about what occurred..."
            />
          </Box>
        )}
      </DialogContent>

      {!successMsg && (
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button variant="text" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Submit Safety Report'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReportDialog;
