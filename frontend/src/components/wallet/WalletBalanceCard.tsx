import React from 'react';
import { Paper, Box, Typography, Grid2 } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';

import { Button } from '../';

export interface WalletBalanceCardProps {
  balance: number;
  onAddMoney: () => void;
  isLoading?: boolean;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  balance,
  onAddMoney,
  isLoading = false,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #2563EB 100%)',
        color: '#FFFFFF',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
      }}
    >
      <Grid2 container spacing={3} alignItems="center">
        <Grid2 size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <AccountBalanceWalletIcon sx={{ color: '#60A5FA', fontSize: 28 }} />
            <Typography variant="subtitle2" color="#94A3B8" fontWeight={700} letterSpacing={0.5}>
              CURRENT WALLET BALANCE
            </Typography>
          </Box>
          <Typography variant="h2" fontWeight={900} color="#FFF" gutterBottom>
            ₹{isLoading ? '...' : balance.toLocaleString('en-IN')}.00
          </Typography>
          <Typography variant="caption" color="#CBD5E1" sx={{ opacity: 0.9 }}>
            ⚡ Zero transaction fee, 1-click instant checkout, and instant cancellation refunds.
          </Typography>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 5 }} sx={{ textAlign: { md: 'right' } }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AddIcon />}
            onClick={onAddMoney}
            disabled={isLoading}
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              px: 3.5,
              py: 1.3,
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
            }}
          >
            Recharge Wallet
          </Button>
        </Grid2>
      </Grid2>
    </Paper>
  );
};

export default WalletBalanceCard;
