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
  Rating as MuiRating,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { Button } from '../Button';
import bookingApi from '../../services/api/booking.api';

interface BookingReviewDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  workerName?: string;
  taskName?: string;
  onSuccess?: () => void;
}

export const BookingReviewDialog: React.FC<BookingReviewDialogProps> = ({
  open,
  onClose,
  bookingId,
  workerName = 'Helper',
  taskName = 'Household Service',
  onSuccess,
}) => {
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setErrorMsg('Please select a star rating');
      return;
    }
    if (comment.trim().length < 10) {
      setErrorMsg('Please write a review comment (minimum 10 characters)');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await bookingApi.submitReview(bookingId, comment.trim(), {
        overall: rating,
        punctuality: rating,
        quality: rating,
        professionalism: rating,
      });

      setSuccessMsg('Thank you! Your review has been submitted.');
      setTimeout(() => {
        setSuccessMsg(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to submit review. You may have already reviewed this booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Rate & Review
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {taskName} with {workerName}
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

            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                How was your experience?
              </Typography>
              <MuiRating
                value={rating}
                onChange={(_, val) => setRating(val)}
                precision={1}
                size="large"
                emptyIcon={<StarIcon style={{ opacity: 0.35 }} fontSize="inherit" />}
              />
            </Box>

            <TextField
              label="Write your feedback..."
              multiline
              rows={3}
              fullWidth
              size="small"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Very professional, completed task quickly and thoroughly!"
              sx={{ mt: 1 }}
            />
          </Box>
        )}
      </DialogContent>

      {!successMsg && (
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button variant="text" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Submit Review'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BookingReviewDialog;
