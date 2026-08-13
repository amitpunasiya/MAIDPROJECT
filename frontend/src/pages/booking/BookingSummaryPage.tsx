import React, { useState } from 'react';
import { Box, Container, Typography, Grid2, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { addBooking } from '../../store/bookingSlice';
import {
  BookingSummaryCard,
  PriceBreakdown,
  PaymentCard,
  Button,
} from '../../components';
import { MOCK_COOKS } from '../../services/mockData';
import { IBookingRecord, BookingStatus } from '../../types';

export const BookingSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const draft = useAppSelector((state) => state.booking.currentDraft);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'debit' | 'cash'>(draft.paymentMethod);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const provider = draft.selectedProvider || MOCK_COOKS[0];
  const serviceCharge = provider.hourlyRate * draft.workingHours;
  const platformFee = 49;
  const subtotal = serviceCharge + platformFee - draft.couponDiscount;
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;

  const handleConfirmOrder = () => {
    setIsPlacingOrder(true);

    const newRecord: IBookingRecord = {
      id: `bk-${Date.now()}`,
      bookingIdNumber: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceType: draft.serviceCategory === 'cook' ? 'cook' : 'maid',
      providerId: provider.id,
      providerName: provider.name,
      providerAvatar: provider.avatar,
      providerRating: provider.averageRating,
      customerName: 'Aarav Mehta',
      phone: '9876543210',
      address: draft.selectedAddress,
      city: draft.city,
      pincode: draft.pincode,
      date: draft.selectedDate,
      timeSlot: draft.selectedSlot,
      workingHours: draft.workingHours,
      specialInstructions: draft.specialInstructions,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      serviceCharge: serviceCharge,
      platformFee: platformFee,
      gstAmount: gstAmount,
      discountAmount: draft.couponDiscount,
      totalAmount: grandTotal,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTimeout(() => {
      dispatch(addBooking(newRecord));
      setIsPlacingOrder(false);
      navigate('/book/success');
    }, 600);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" fontWeight={800} color="text.primary">
              Review Booking Summary
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Please verify your service details and select payment option before placing order.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/book')}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            Edit Booking
          </Button>
        </Box>

        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Stack spacing={3.5}>
              <BookingSummaryCard
                provider={provider}
                serviceCategory={draft.serviceCategory}
                address={draft.selectedAddress}
                date={draft.selectedDate}
                timeSlot={draft.selectedSlot}
                duration={draft.workingHours}
                totalAmount={grandTotal}
              />

              <PaymentCard
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
              />
            </Stack>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 90 }}>
              <PriceBreakdown
                hourlyRate={provider.hourlyRate}
                workingHours={draft.workingHours}
                couponDiscount={draft.couponDiscount}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                loading={isPlacingOrder}
                startIcon={<CheckCircleIcon />}
                onClick={handleConfirmOrder}
                sx={{ py: 1.6, borderRadius: '12px', fontWeight: 800, fontSize: '1.05rem' }}
              >
                Confirm & Pay ₹{grandTotal}
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
};

export default BookingSummaryPage;
