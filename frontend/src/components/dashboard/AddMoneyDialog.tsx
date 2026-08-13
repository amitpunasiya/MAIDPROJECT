import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Button, Input } from '../';

interface AddMoneyDialogProps {
  open: boolean;
  onClose: () => void;
  onAddMoney: (amount: number) => void;
}

const quickAmounts = [500, 1000, 2000, 5000];

export const AddMoneyDialog: React.FC<AddMoneyDialogProps> = ({
  open,
  onClose,
  onAddMoney,
}) => {
  const [amount, setAmount] = useState<number>(1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) {
      onAddMoney(amount);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#0F172A', color: '#FFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWalletIcon color="secondary" />
          <Typography variant="h6" fontWeight={800}>
            Add Money to Wallet
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#FFF' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Instant wallet top-up for zero transaction fees & faster 1-click booking checkout.
          </Typography>

          <Input
            label="Enter Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              },
            }}
          />

          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Or Select Quick Amount:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {quickAmounts.map((amt) => (
              <Chip
                key={amt}
                label={`+ ₹${amt}`}
                onClick={() => setAmount(amt)}
                color={amount === amt ? 'primary' : 'default'}
                variant={amount === amt ? 'filled' : 'outlined'}
                sx={{ fontWeight: 800, borderRadius: '8px' }}
              />
            ))}
          </Stack>

          <DialogActions sx={{ px: 0, pt: 1 }}>
            <Button variant="outlined" onClick={onClose} sx={{ borderRadius: '10px' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="secondary" sx={{ borderRadius: '10px', px: 3, fontWeight: 800 }}>
              Top Up ₹{amount}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddMoneyDialog;
