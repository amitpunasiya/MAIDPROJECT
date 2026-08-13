import React from 'react';
import { Box, Container, Typography, Paper, Stack, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import PaymentIcon from '@mui/icons-material/Payment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../hooks/useAppStore';
import { Button } from '../../components';

export const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();
  const paymentError = useAppSelector((state) => state.payment.error) || 'Payment authorization was declined by your bank.';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 5,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            textAlign: 'center',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08)',
          }}
        >
          {/* Red Warning Icon */}
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              bgcolor: '#FEE2E2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 0 0 12px rgba(254, 226, 226, 0.5)',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 56 }} />
          </Box>

          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Payment Failed
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We could not complete your transaction. No money was deducted from your bank account.
          </Typography>

          <Alert severity="error" sx={{ mb: 4, textAlign: 'left', borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight={800}>Reason:</Typography>
            <Typography variant="caption">{paymentError}</Typography>
          </Alert>

          {/* CTAs */}
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<ReplayIcon />}
              onClick={() => navigate('/payment')}
              sx={{ borderRadius: '12px', fontWeight: 800, py: 1.4 }}
            >
              Retry Payment
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<PaymentIcon />}
              onClick={() => navigate('/payment')}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Choose Another Method
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<SupportAgentIcon />}
              onClick={() => navigate('/support')}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Contact Payment Support
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentFailedPage;
