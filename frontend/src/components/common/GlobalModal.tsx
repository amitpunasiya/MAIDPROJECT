import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { closeGlobalModal } from '../../store/uiSlice';

export const GlobalModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { open, title, content } = useAppSelector((state) => state.ui.modal);

  return (
    <Dialog open={open} onClose={() => dispatch(closeGlobalModal())} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button variant="contained" onClick={() => dispatch(closeGlobalModal())} sx={{ fontWeight: 800 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalModal;
