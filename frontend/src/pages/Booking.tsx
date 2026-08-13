import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { createBooking, setDraftCoupon } from '../store/bookingSlice';
import {
  BookingStepper,
  BookingForm,
  BookingFormInputs,
  PriceCard,
  PaymentCard,
  BookingSummary,
  UnifiedProviderCard,
  Button,
  AddressFormModal,
  CouponSelectorModal,
} from '../components';

import { MOCK_COOKS, MOCK_MAIDS } from '../services/mockData';
import { ICookProfile, IMaidProfile, ServiceType } from '../types';

export const Booking: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentDraft, loading: bookingLoading } = useAppSelector((state) => state.booking);

  // Wizard Step State (0 = Select Service, 1 = Select Provider, 2 = Details & Payment)
  const [activeStep, setActiveStep] = useState(0);

  // Selections
  const [serviceType, setServiceType] = useState<'cook' | 'maid'>('cook');
  const [selectedProvider, setSelectedProvider] = useState<ICookProfile | IMaidProfile | null>(MOCK_COOKS[0]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'debit' | 'cash'>('upi');
  const [workingHours, setWorkingHours] = useState(2);

  // Modals State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [selectedAddressText, setSelectedAddressText] = useState('Flat 402, Sunshine Heights, HSR Sector 2, Bengaluru - 560102');

  const availableProviders = serviceType === 'cook' ? MOCK_COOKS : MOCK_MAIDS;

  const handleSelectService = (type: 'cook' | 'maid') => {
    setServiceType(type);
    const firstProvider = type === 'cook' ? MOCK_COOKS[0] : MOCK_MAIDS[0];
    setSelectedProvider(firstProvider);
    setActiveStep(1);
  };

  const handleSelectProvider = (provider: ICookProfile | IMaidProfile) => {
    setSelectedProvider(provider);
    setActiveStep(2);
  };

  const handleFormSubmit = async (formData: BookingFormInputs) => {
    if (!selectedProvider) return;

    setWorkingHours(formData.workingHours);

    const payload = {
      serviceType: serviceType === 'cook' ? ServiceType.COOK : ServiceType.MAID,
      providerId: selectedProvider.id,
      startDate: formData.date,
      timeSlot: formData.timeSlot,
      address: {
        street: formData.address,
        city: formData.city,
        state: 'Karnataka',
        zipCode: formData.pincode,
      },
      notes: formData.specialInstructions,
      couponCode: currentDraft.couponCode || undefined,
      pricing: {
        basePrice: selectedProvider.hourlyRate * formData.workingHours,
        tax: Math.round(selectedProvider.hourlyRate * formData.workingHours * 0.18),
        discount: currentDraft.couponDiscount || 0,
        totalAmount:
          selectedProvider.hourlyRate * formData.workingHours + 49 + Math.round(selectedProvider.hourlyRate * formData.workingHours * 0.18) - (currentDraft.couponDiscount || 0),
      },
    };

    const actionResult = await dispatch(createBooking(payload));

    if (createBooking.fulfilled.match(actionResult)) {
      const createdId = actionResult.payload?.id || `bk-${Date.now()}`;
      navigate(`/booking/success?bookingId=${createdId}`);
    } else {
      // Fallback navigation
      navigate('/booking/success?bookingId=BK-NEW');
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #2563EB 100%)',
          color: '#FFF',
          py: { xs: 4, md: 5 },
          borderRadius: 0,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => setActiveStep((prev) => prev - 1)}
                sx={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.3)', fontWeight: 700 }}
              >
                Back
              </Button>
            )}
            <Typography variant="h4" fontWeight={900}>
              Instant Staff Booking Checkout
            </Typography>
          </Box>

          <BookingStepper activeStep={activeStep} onStepClick={(step: number) => step <= activeStep && setActiveStep(step)} />
        </Container>
      </Paper>

      {/* Main Flow Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* STEP 0: SELECT SERVICE TYPE */}
        {activeStep === 0 && (
          <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', py: 4 }}>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              What home staff service do you require today?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Select a service category to browse verified local professionals available for immediate booking.
            </Typography>

            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={0}
                  onClick={() => handleSelectService('cook')}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: serviceType === 'cook' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    bgcolor: '#FFFFFF',
                    transition: 'all 0.25s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' },
                  }}
                >
                  <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <RestaurantIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={800} gutterBottom>
                    Home Cook / Chef
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    North/South Indian, Chinese, Continental & Healthy Meal preparation professionals.
                  </Typography>
                  <Button variant="contained" fullWidth sx={{ borderRadius: '10px', fontWeight: 800 }}>
                    Book a Home Cook
                  </Button>
                </Paper>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={0}
                  onClick={() => handleSelectService('maid')}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: serviceType === 'maid' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    bgcolor: '#FFFFFF',
                    transition: 'all 0.25s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' },
                  }}
                >
                  <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                    <CleaningServicesIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={800} gutterBottom>
                    Housekeeping Maid
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    House cleaning, deep cleaning, utensil washing & laundry staff partners.
                  </Typography>
                  <Button variant="contained" color="secondary" fullWidth sx={{ borderRadius: '10px', fontWeight: 800 }}>
                    Book a House Maid
                  </Button>
                </Paper>
              </Grid2>
            </Grid2>
          </Box>
        )}

        {/* STEP 1: SELECT PROVIDER */}
        {activeStep === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>
                Select Verified {serviceType === 'cook' ? 'Cook' : 'Maid'} ({availableProviders.length})
              </Typography>
              <Chip label={serviceType.toUpperCase()} color="primary" sx={{ fontWeight: 800 }} />
            </Box>

            <Grid2 container spacing={3}>
              {availableProviders.map((provider) => (
                <Grid2 key={provider.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: selectedProvider?.id === provider.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      p: 2.5,
                      position: 'relative',
                    }}
                  >
                    {selectedProvider?.id === provider.id && (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: '#FFF' }} />}
                        label="Selected"
                        color="primary"
                        size="small"
                        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 800 }}
                      />
                    )}
                    <UnifiedProviderCard provider={provider} type={serviceType} onBookNow={() => {}} />
                    <Button
                      variant={selectedProvider?.id === provider.id ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => handleSelectProvider(provider)}
                      sx={{ mt: 2, borderRadius: '10px', fontWeight: 800 }}
                    >
                      {selectedProvider?.id === provider.id ? 'Continue with Selected' : 'Select Professional'}
                    </Button>
                  </Paper>
                </Grid2>
              ))}
            </Grid2>
          </Box>
        )}

        {/* STEP 2: DETAILS, SUMMARY & PAYMENT */}
        {activeStep === 2 && selectedProvider && (
          <Grid2 container spacing={3.5}>
            {/* Form Column */}
            <Grid2 size={{ xs: 12, md: 7 }}>
              <BookingForm
                serviceType={serviceType}
                providerName={selectedProvider.name}
                onSubmit={handleFormSubmit}
                isSubmitting={bookingLoading}
              />
            </Grid2>

            {/* Price & Summary Column */}
            <Grid2 size={{ xs: 12, md: 5 }}>
              <Stack spacing={3}>
                <BookingSummary
                  provider={selectedProvider}
                  serviceType={serviceType}
                  address={selectedAddressText}
                />

                <PriceCard
                  hourlyRate={selectedProvider.hourlyRate}
                  workingHours={workingHours}
                  discountAmount={currentDraft.couponDiscount}
                  couponCode={currentDraft.couponCode}
                  onOpenCouponModal={() => setCouponModalOpen(true)}
                  onRemoveCoupon={() => dispatch(setDraftCoupon({ code: '', discount: 0 }))}
                />

                <PaymentCard
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                />
              </Stack>
            </Grid2>
          </Grid2>
        )}
      </Container>

      {/* Address & Coupon Modals */}
      <AddressFormModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSaveAddress={(data) => {
          setSelectedAddressText(`${data.street}, ${data.city}, ${data.state} - ${data.zipCode}`);
        }}
      />

      <CouponSelectorModal
        open={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        appliedCode={currentDraft.couponCode}
        onApplyCoupon={(code) => {
          dispatch(setDraftCoupon({ code, discount: code === 'FIRST50' ? 100 : 50 }));
        }}
      />
    </Box>
  );
};

export default Booking;
