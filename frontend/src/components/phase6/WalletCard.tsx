import React from 'react';
import { Paper, Box, Typography, Button as MuiButton, Chip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';

interface WalletCardProps {
  balance: number;
  onAddMoney: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ balance, onAddMoney }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#FFFFFF',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.2)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AccountBalanceWalletIcon color="secondary" />
          <Typography variant="caption" color="#94A3B8" fontWeight={800} sx={{ letterSpacing: '0.05em' }}>
            MAIDPROJECT WALLET BALANCE
          </Typography>
          <Chip label="1-Click Checkout" color="success" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
        </Box>
        <Typography variant="h3" fontWeight={800} color="#FFFFFF">
          ₹{balance.toLocaleString('en-IN')}.00
        </Typography>
      </Box>

      <MuiButton
        variant="contained"
        color="secondary"
        startIcon={<AddIcon />}
        onClick={onAddMoney}
        sx={{ borderRadius: '12px', fontWeight: 800, px: 3, py: 1.2 }}
      >
        Top Up Money
      </MuiButton>
    </Paper>
  );
};

export default WalletCard;
