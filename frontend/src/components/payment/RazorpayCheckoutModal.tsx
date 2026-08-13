import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { Button } from '../';

export interface RazorpayCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  bookingId?: string;
  orderId?: string;
  onSuccess: (details: { paymentId: string; orderId: string; signature: string }) => void;
  onFailure: (error: string) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  open,
  onClose,
  amount,
  bookingId = 'BK-NEW',
  orderId = `order_${Date.now()}`,
  onSuccess,
  onFailure,
}) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const isSuccessful = true;

      if (isSuccessful) {
        setPaymentDone(true);
        setTimeout(() => {
          setPaymentDone(false);
          onSuccess({
            paymentId: `pay_${Math.floor(100000000 + Math.random() * 900000000)}`,
            orderId: orderId,
            signature: `sig_${Math.random().toString(36).substring(2)}`,
          });
          onClose();
        }, 1200);
      } else {
        onFailure('Payment failed due to gateway timeout. Please try again.');
      }
    }, 1500);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#0F172A', color: '#FFF', p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={800} color="#FFF">
            Razorpay Secure Payment
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#FFF' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {paymentDone ? (
        <DialogContent sx={{ textAlign: 'center', py: 5 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 1 }} />
          <Typography variant="h6" fontWeight={800} gutterBottom>
            Payment Successful!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verifying payment signature with backend...
          </Typography>
        </DialogContent>
      ) : (
        <>
          <DialogContent dividers sx={{ p: 3 }}>
            {/* Amount Banner */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                TOTAL PAYABLE AMOUNT FOR #{bookingId}
              </Typography>
              <Typography variant="h4" fontWeight={900} color="primary.main">
                ₹{amount.toLocaleString('en-IN')}.00
              </Typography>
            </Paper>

            <Typography variant="subtitle2" fontWeight={800} gutterBottom>
              Select Payment Option
            </Typography>

            <RadioGroup value={method} onChange={(e) => setMethod(e.target.value as any)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                <Paper
                  elevation={0}
                  onClick={() => setMethod('upi')}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: method === 'upi' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    bgcolor: method === 'upi' ? '#EFF6FF' : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QrCodeScannerIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight={700}>
                      UPI Instant (GPay / PhonePe / Paytm)
                    </Typography>
                  </Box>
                  <FormControlLabel value="upi" control={<Radio size="small" />} label="" sx={{ m: 0 }} />
                </Paper>

                <Paper
                  elevation={0}
                  onClick={() => setMethod('card')}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: method === 'card' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    bgcolor: method === 'card' ? '#EFF6FF' : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCardIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight={700}>
                      Credit / Debit Card
                    </Typography>
                  </Box>
                  <FormControlLabel value="card" control={<Radio size="small" />} label="" sx={{ m: 0 }} />
                </Paper>

                <Paper
                  elevation={0}
                  onClick={() => setMethod('netbanking')}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: method === 'netbanking' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    bgcolor: method === 'netbanking' ? '#EFF6FF' : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight={700}>
                      Net Banking
                    </Typography>
                  </Box>
                  <FormControlLabel value="netbanking" control={<Radio size="small" />} label="" sx={{ m: 0 }} />
                </Paper>

                <Paper
                  elevation={0}
                  onClick={() => setMethod('wallet')}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: method === 'wallet' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    bgcolor: method === 'wallet' ? '#EFF6FF' : '#FFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceWalletIcon color="secondary" fontSize="small" />
                    <Typography variant="body2" fontWeight={700}>
                      MaidProject Wallet
                    </Typography>
                  </Box>
                  <FormControlLabel value="wallet" control={<Radio size="small" />} label="" sx={{ m: 0 }} />
                </Paper>
              </Box>
            </RadioGroup>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC' }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isProcessing}
              onClick={handlePay}
              sx={{ borderRadius: '10px', py: 1.3, fontWeight: 800 }}
            >
              {isProcessing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Authorizing Gateway...</span>
                </Box>
              ) : (
                `Pay ₹${amount.toLocaleString('en-IN')}`
              )}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default RazorpayCheckoutModal;
