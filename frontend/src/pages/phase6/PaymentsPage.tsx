import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import LockIcon from '@mui/icons-material/Lock';
import DiscountIcon from '@mui/icons-material/Discount';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { createPaymentOrder, verifyPayment, paymentSuccess, paymentFailed } from '../../store/paymentSlice';
import { payWithWallet } from '../../store/walletSlice';
import { CouponInput, PriceSummary, Button, RazorpayCheckoutModal } from '../../components';

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const walletBalance = useAppSelector((state) => state.wallet.balance);
  const { isProcessing } = useAppSelector((state) => state.payment);

  const [method, setMethod] = useState<'upi' | 'card' | 'debit' | 'netbanking' | 'wallet' | 'cash'>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  const serviceCharge = 600;
  const platformFee = 49;
  const subtotal = serviceCharge + platformFee - discount;
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;

  const handleApplyCoupon = (c: string) => {
    setCouponCode(c);
    setDiscount(100);
  };

  const handlePayNow = async () => {
    if (method === 'wallet') {
      if (walletBalance < grandTotal) {
        alert('Insufficient wallet balance! Please select another payment method or recharge wallet.');
        return;
      }

      const res = await dispatch(payWithWallet({ bookingId: 'BK-89421', amount: grandTotal }));
      if (payWithWallet.fulfilled.match(res)) {
        dispatch(
          paymentSuccess({
            paymentId: res.payload.transactionRef,
            bookingId: 'BK-89421',
            amount: grandTotal,
            method: 'wallet',
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
            transactionRef: res.payload.transactionRef,
          })
        );
        navigate('/payment/success');
      } else {
        dispatch(paymentFailed('Wallet transaction failed'));
        navigate('/payment/failed');
      }
    } else if (method === 'cash') {
      dispatch(
        paymentSuccess({
          paymentId: `PAY-CASH-${Date.now()}`,
          bookingId: 'BK-89421',
          amount: grandTotal,
          method: 'cash',
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          transactionRef: `TXN-CASH-${Date.now()}`,
        })
      );
      navigate('/payment/success');
    } else {
      // Trigger Razorpay / Gateway order creation & open modal
      await dispatch(createPaymentOrder({ bookingId: 'BK-89421', amount: grandTotal, paymentMethod: method }));
      setRazorpayOpen(true);
    }
  };

  const handleRazorpaySuccess = async (details: { paymentId: string; orderId: string; signature: string }) => {
    const actionResult = await dispatch(
      verifyPayment({
        razorpay_order_id: details.orderId,
        razorpay_payment_id: details.paymentId,
        razorpay_signature: details.signature,
        bookingId: 'BK-89421',
      })
    );

    if (verifyPayment.fulfilled.match(actionResult)) {
      dispatch(
        paymentSuccess({
          paymentId: details.paymentId,
          bookingId: 'BK-89421',
          amount: grandTotal,
          method: method,
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          transactionRef: details.paymentId,
        })
      );
      navigate('/payment/success');
    } else {
      dispatch(paymentFailed('Payment signature verification failed'));
      navigate('/payment/failed');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" fontWeight={800} color="text.primary">
              Checkout & Payment Portal
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Choose your preferred payment gateway. 256-bit SSL Encrypted.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            Back
          </Button>
        </Box>

        <Grid2 container spacing={4}>
          {/* Left Column: Payment Options & Coupon */}
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Stack spacing={3.5}>
              {/* Wallet Balance Banner */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #BBF7D0', bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccountBalanceWalletIcon color="secondary" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      MaidProject Wallet Balance: ₹{walletBalance}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Use wallet balance for instant 1-click checkout.
                    </Typography>
                  </Box>
                </Box>
                <Button size="small" variant="outlined" color="secondary" onClick={() => setMethod('wallet')} sx={{ borderRadius: '8px', fontWeight: 700 }}>
                  Use Wallet
                </Button>
              </Paper>

              {/* Promo Coupon Section */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
                <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DiscountIcon color="primary" /> Promo Discount Coupon
                </Typography>
                <CouponInput onApply={handleApplyCoupon} />
                {couponCode && (
                  <Alert severity="success" sx={{ mt: 2, borderRadius: '8px' }}>
                    Coupon <b>{couponCode}</b> applied! ₹{discount} discount applied.
                  </Alert>
                )}
              </Paper>

              {/* Payment Methods */}
              <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Select Payment Gateway
                  </Typography>
                  <Chip icon={<LockIcon sx={{ fontSize: '14px !important' }} />} label="256-Bit SSL" color="success" size="small" sx={{ fontWeight: 800 }} />
                </Box>

                <RadioGroup value={method} onChange={(e) => setMethod(e.target.value as any)}>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <Paper
                      elevation={0}
                      onClick={() => setMethod('upi')}
                      sx={{ p: 2, borderRadius: 3, border: `2px solid ${method === 'upi' ? '#2563EB' : '#E2E8F0'}`, bgcolor: method === 'upi' ? '#EFF6FF' : '#F8FAFC', cursor: 'pointer' }}
                    >
                      <FormControlLabel
                        value="upi"
                        control={<Radio size="small" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <QrCodeScannerIcon color="primary" />
                            <Typography variant="subtitle2" fontWeight={800}>UPI (GPay / PhonePe / Paytm / BHIM)</Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper
                      elevation={0}
                      onClick={() => setMethod('card')}
                      sx={{ p: 2, borderRadius: 3, border: `2px solid ${method === 'card' ? '#2563EB' : '#E2E8F0'}`, bgcolor: method === 'card' ? '#EFF6FF' : '#F8FAFC', cursor: 'pointer' }}
                    >
                      <FormControlLabel
                        value="card"
                        control={<Radio size="small" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CreditCardIcon color="primary" />
                            <Typography variant="subtitle2" fontWeight={800}>Credit / Debit Card (Visa, Mastercard, RuPay)</Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper
                      elevation={0}
                      onClick={() => setMethod('netbanking')}
                      sx={{ p: 2, borderRadius: 3, border: `2px solid ${method === 'netbanking' ? '#2563EB' : '#E2E8F0'}`, bgcolor: method === 'netbanking' ? '#EFF6FF' : '#F8FAFC', cursor: 'pointer' }}
                    >
                      <FormControlLabel
                        value="netbanking"
                        control={<Radio size="small" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalanceIcon color="primary" />
                            <Typography variant="subtitle2" fontWeight={800}>Net Banking (HDFC, SBI, ICICI, Axis)</Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper
                      elevation={0}
                      onClick={() => setMethod('wallet')}
                      sx={{ p: 2, borderRadius: 3, border: `2px solid ${method === 'wallet' ? '#2563EB' : '#E2E8F0'}`, bgcolor: method === 'wallet' ? '#EFF6FF' : '#F8FAFC', cursor: 'pointer' }}
                    >
                      <FormControlLabel
                        value="wallet"
                        control={<Radio size="small" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalanceWalletIcon color="secondary" />
                            <Typography variant="subtitle2" fontWeight={800}>MaidProject Wallet (Balance: ₹{walletBalance})</Typography>
                          </Box>
                        }
                      />
                    </Paper>

                    <Paper
                      elevation={0}
                      onClick={() => setMethod('cash')}
                      sx={{ p: 2, borderRadius: 3, border: `2px solid ${method === 'cash' ? '#2563EB' : '#E2E8F0'}`, bgcolor: method === 'cash' ? '#EFF6FF' : '#F8FAFC', cursor: 'pointer' }}
                    >
                      <FormControlLabel
                        value="cash"
                        control={<Radio size="small" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalAtmIcon color="success" />
                            <Typography variant="subtitle2" fontWeight={800}>Cash on Service Completion</Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Stack>
                </RadioGroup>
              </Paper>
            </Stack>
          </Grid2>

          {/* Right Column: Price Summary & Pay CTA */}
          <Grid2 size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 90 }}>
              <PriceSummary
                serviceCharge={serviceCharge}
                platformFee={platformFee}
                gstAmount={gstAmount}
                discountAmount={discount}
                grandTotal={grandTotal}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isProcessing}
                onClick={handlePayNow}
                sx={{ mt: 3, py: 1.6, borderRadius: '12px', fontWeight: 800, fontSize: '1.05rem' }}
              >
                {isProcessing ? 'Processing Payment...' : `Complete Payment ₹${grandTotal}`}
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </Container>

      {/* Razorpay Online Gateway Modal */}
      <RazorpayCheckoutModal
        open={razorpayOpen}
        onClose={() => setRazorpayOpen(false)}
        amount={grandTotal}
        bookingId="BK-89421"
        onSuccess={handleRazorpaySuccess}
        onFailure={(err) => {
          dispatch(paymentFailed(err));
          navigate('/payment/failed');
        }}
      />
    </Box>
  );
};

export default PaymentsPage;
