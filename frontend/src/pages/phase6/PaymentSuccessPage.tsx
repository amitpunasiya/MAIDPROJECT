import React from 'react';
import { Box, Container, Typography, Paper, Stack, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../hooks/useAppStore';
import { InvoiceCard, Button } from '../../components';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const lastPayment = useAppSelector((state) => state.payment.lastPayment);

  const payment = lastPayment || {
    paymentId: 'PAY-981240',
    bookingId: 'BK-89421',
    amount: 715,
    method: 'upi',
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    transactionRef: 'TXN-UPI-8849201',
  };

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
          {/* Animated Green Checkmark */}
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              bgcolor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 0 0 12px rgba(220, 252, 231, 0.5)',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(0.95)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(0.95)' },
              },
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 56 }} />
          </Box>

          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Payment Successful!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you! Your payment of ₹{payment.amount} has been received. Your booking is confirmed.
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 4 }}>
            <Chip label={`Booking ID: #${payment.bookingId}`} color="primary" sx={{ fontWeight: 800 }} />
            <Chip label={`Payment ID: ${payment.paymentId}`} color="success" sx={{ fontWeight: 800 }} />
          </Stack>

          {/* Invoice Component */}
          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <InvoiceCard
              bookingId={payment.bookingId}
              paymentId={payment.paymentId}
              amount={payment.amount}
              date={new Date().toISOString().split('T')[0]}
              providerName="Chef Rajesh Sharma"
              onDownload={() => alert(`Downloading Invoice PDF for ${payment.paymentId}...`)}
            />
          </Box>

          {/* Action CTAs */}
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<DirectionsRunIcon />}
              onClick={() => navigate(`/track/${payment.bookingId}`)}
              sx={{ borderRadius: '12px', fontWeight: 800, py: 1.4 }}
            >
              Track Live Booking Status
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<HomeIcon />}
              onClick={() => navigate('/home')}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Go to Home Page
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPage;
