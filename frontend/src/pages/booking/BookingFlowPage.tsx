import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ElderlyIcon from '@mui/icons-material/Elderly';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import {
  setDraftCategory,
  setDraftProvider,
  setDraftAddress,
  setDraftDateTime,
  setDraftCoupon,
  createBooking,
} from '../../store/bookingSlice';

import {
  BookingStepper,
  UnifiedProviderCard,
  AddressCard,
  DatePicker,
  TimeSlotGrid,
  PriceBreakdown,
  Button,
  AddAddressDialog,
  AddressFormInputs,
  CouponSelectorModal,
} from '../../components';

import { MOCK_COOKS, MOCK_MAIDS } from '../../services/mockData';
import { ServiceType } from '../../types';

import MyLocationIcon from '@mui/icons-material/MyLocation';
import locationApi, { IReverseGeocodeResult } from '../../services/api/location.api';
import { Alert, CircularProgress } from '@mui/material';

export const BookingFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentDraft: draft, loading: bookingLoading } = useAppSelector((state) => state.booking);

  const [activeStep, setActiveStep] = useState(0);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationAlert, setLocationAlert] = useState<{ severity: 'info' | 'warning' | 'error' | 'success'; message: string } | null>(null);

  // Saved Addresses mock list
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 'addr-1',
      tag: 'Home',
      fullAddress: 'Flat 402, Sunshine Apartments, HSR Layout Sector 2',
      city: 'Bengaluru',
      pincode: '560102',
      isDefault: true,
    },
    {
      id: 'addr-2',
      tag: 'Office',
      fullAddress: 'Suite 804, Tech Park Tower B, Koramangala 4th Block',
      city: 'Bengaluru',
      pincode: '560034',
      isDefault: false,
    },
  ]);

  const handleUseCurrentLocation = () => {
    setLocationAlert(null);
    if (!navigator.geolocation) {
      setLocationAlert({ severity: 'warning', message: 'Unable to detect your location. Please try again or search manually.' });
      return;
    }

    setDetectingLocation(true);
    setLocationAlert({ severity: 'info', message: 'Detecting your location...' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const resolved: IReverseGeocodeResult = await locationApi.reverseGeocode(lat, lng);

          const formatted = resolved.formattedAddress || `${resolved.city}, ${resolved.state}, ${resolved.country}`;
          const newGpsAddress = {
            id: `addr-gps-${Date.now()}`,
            tag: 'Detected Location',
            fullAddress: formatted,
            city: resolved.city,
            pincode: resolved.pincode || '560001',
            isDefault: false,
          };

          setSavedAddresses((prev) => [newGpsAddress, ...prev.filter((a) => a.tag !== 'Detected Location')]);
          dispatch(setDraftAddress({ address: formatted, city: resolved.city, pincode: resolved.pincode || '560001' }));
          setLocationAlert({ severity: 'success', message: `Location detected: ${resolved.city}, ${resolved.state}` });
        } catch (_err) {
          setLocationAlert({ severity: 'warning', message: 'Could not determine your address. Please search manually.' });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationAlert({ severity: 'warning', message: 'Location permission was denied. Please search for your address manually.' });
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationAlert({ severity: 'warning', message: 'Unable to detect your location. Please try again or search manually.' });
        } else {
          setLocationAlert({ severity: 'warning', message: 'Could not determine your address. Please search manually.' });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleAddNewAddress = (newAddr: AddressFormInputs) => {
    const created = {
      id: `addr-${Date.now()}`,
      tag: newAddr.tag,
      fullAddress: `${newAddr.fullAddress}, ${newAddr.landmark || ''}`,
      city: newAddr.city,
      pincode: newAddr.pincode,
      isDefault: false,
    };
    setSavedAddresses((prev) => [...prev, created]);
    dispatch(setDraftAddress({ address: created.fullAddress, city: created.city, pincode: created.pincode }));
  };

  const handleConfirmAndPay = async () => {
    const payload = {
      serviceType: draft.serviceCategory === 'cook' ? ServiceType.COOK : ServiceType.MAID,
      providerId: draft.selectedProvider?.id || 'cook-1',
      startDate: draft.selectedDate,
      timeSlot: draft.selectedSlot,
      address: {
        street: draft.selectedAddress,
        city: draft.city,
        state: 'Karnataka',
        zipCode: draft.pincode,
      },
      notes: draft.specialInstructions,
      couponCode: draft.couponCode || undefined,
      pricing: {
        basePrice: (draft.selectedProvider?.hourlyRate || 300) * draft.workingHours,
        tax: Math.round((draft.selectedProvider?.hourlyRate || 300) * draft.workingHours * 0.18),
        discount: draft.couponDiscount || 0,
        totalAmount:
          (draft.selectedProvider?.hourlyRate || 300) * draft.workingHours +
          49 +
          Math.round((draft.selectedProvider?.hourlyRate || 300) * draft.workingHours * 0.18) -
          (draft.couponDiscount || 0),
      },
    };

    const actionResult = await dispatch(createBooking(payload));

    if (createBooking.fulfilled.match(actionResult)) {
      const createdId = actionResult.payload?.id || `bk-${Date.now()}`;
      navigate(`/booking/success?bookingId=${createdId}`);
    } else {
      navigate('/booking/success?bookingId=BK-NEW');
    }
  };

  const availableProviders = draft.serviceCategory === 'cook' ? MOCK_COOKS : MOCK_MAIDS;

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
              Complete Your Staff Booking
            </Typography>
          </Box>

          <BookingStepper activeStep={activeStep} onStepClick={(s: number) => s <= activeStep && setActiveStep(s)} />
        </Container>
      </Paper>

      {/* Main Flow Steps */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* STEP 0: Select Service Category */}
        {activeStep === 0 && (
          <Box sx={{ maxWidth: 800, mx: 'auto', py: 3 }}>
            <Typography variant="h5" fontWeight={800} textAlign="center" gutterBottom>
              1. Select Service Category
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
              Choose the exact home staff partner service you wish to schedule today.
            </Typography>

            <Grid2 container spacing={2.5}>
              {[
                { type: 'cook' as const, label: 'Home Cook / Chef', icon: <RestaurantIcon /> },
                { type: 'maid' as const, label: 'Housekeeping Maid', icon: <CleaningServicesIcon /> },
                { type: 'cleaning' as const, label: 'Deep Home Cleaning', icon: <AutoAwesomeIcon /> },
                { type: 'babycare' as const, label: 'Nanny / Baby Care', icon: <ChildCareIcon /> },
                { type: 'eldercare' as const, label: 'Elderly Care Assistant', icon: <ElderlyIcon /> },
              ].map((item) => {
                const isSelected = draft.serviceCategory === item.type;
                return (
                  <Grid2 key={item.type} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      elevation={0}
                      onClick={() => {
                        dispatch(setDraftCategory(item.type));
                        const first = item.type === 'cook' ? MOCK_COOKS[0] : MOCK_MAIDS[0];
                        dispatch(setDraftProvider(first));
                        setActiveStep(1);
                      }}
                      sx={{
                        p: 3,
                        borderRadius: 3.5,
                        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        bgcolor: isSelected ? '#EFF6FF' : '#FFF',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Box sx={{ color: 'primary.main', mb: 1 }}>{item.icon}</Box>
                      <Typography variant="h6" fontWeight={800}>
                        {item.label}
                      </Typography>
                    </Paper>
                  </Grid2>
                );
              })}
            </Grid2>
          </Box>
        )}

        {/* STEP 1: Select Staff Professional */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              2. Select Professional Staff
            </Typography>
            <Grid2 container spacing={3} sx={{ mt: 1 }}>
              {availableProviders.map((p) => {
                const isSel = draft.selectedProvider?.id === p.id;
                return (
                  <Grid2 key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2.5, borderRadius: 4, border: isSel ? '2px solid #2563EB' : '1px solid #E2E8F0', bgcolor: '#FFF' }}
                    >
                      <UnifiedProviderCard provider={p} type={draft.serviceCategory === 'cook' ? 'cook' : 'maid'} onBookNow={() => {}} />
                      <Button
                        variant={isSel ? 'contained' : 'outlined'}
                        fullWidth
                        onClick={() => {
                          dispatch(setDraftProvider(p));
                          setActiveStep(2);
                        }}
                        sx={{ mt: 2, borderRadius: '10px', fontWeight: 800 }}
                      >
                        {isSel ? 'Selected' : 'Select Professional'}
                      </Button>
                    </Paper>
                  </Grid2>
                );
              })}
            </Grid2>
          </Box>
        )}

        {/* STEP 2: Address & Date/Time Schedule */}
        {activeStep === 2 && (
          <Box>
            <Grid2 container spacing={4}>
              <Grid2 size={{ xs: 12, md: 7 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Select Service Address
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={detectingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />}
                    onClick={handleUseCurrentLocation}
                    disabled={detectingLocation}
                    sx={{ fontWeight: 800, borderRadius: '10px', textTransform: 'none' }}
                  >
                    {detectingLocation ? 'Detecting...' : '📍 Use my current location'}
                  </Button>
                </Box>

                {locationAlert && (
                  <Alert severity={locationAlert.severity} onClose={() => setLocationAlert(null)} sx={{ mb: 2, borderRadius: 2.5 }}>
                    {locationAlert.message}
                  </Alert>
                )}
                <Grid2 container spacing={2} sx={{ mb: 4 }}>
                  {savedAddresses.map((addr) => (
                    <Grid2 key={addr.id} size={{ xs: 12, sm: 6 }}>
                      <AddressCard
                        tag={addr.tag}
                        fullAddress={addr.fullAddress}
                        city={addr.city}
                        pincode={addr.pincode}
                        isDefault={addr.isDefault}
                        isSelected={draft.selectedAddress === addr.fullAddress}
                        onSelect={() => dispatch(setDraftAddress({ address: addr.fullAddress, city: addr.city, pincode: addr.pincode }))}
                      />
                    </Grid2>
                  ))}
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Paper
                      elevation={0}
                      onClick={() => setAddAddressOpen(true)}
                      sx={{
                        p: 3,
                        borderRadius: 3.5,
                        border: '2px dashed #CBD5E1',
                        bgcolor: '#F8FAFC',
                        cursor: 'pointer',
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <AddIcon color="primary" />
                      <Typography variant="subtitle2" fontWeight={800}>
                        Add New Address
                      </Typography>
                    </Paper>
                  </Grid2>
                </Grid2>

                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Select Booking Date & Time Slot
                </Typography>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF', mb: 3 }}>
                  <DatePicker
                    selectedDate={draft.selectedDate}
                    onDateChange={(d: string) => dispatch(setDraftDateTime({ date: d, slot: draft.selectedSlot }))}
                  />
                  <Box sx={{ mt: 3 }}>
                    <TimeSlotGrid
                      selectedSlot={draft.selectedSlot}
                      onSlotSelect={(s: string) => dispatch(setDraftDateTime({ date: draft.selectedDate, slot: s }))}
                    />
                  </Box>
                </Paper>

                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setActiveStep(3)}
                  disabled={!draft.selectedAddress || !draft.selectedSlot}
                  sx={{ borderRadius: '10px', px: 4, fontWeight: 800 }}
                >
                  Proceed to Checkout Summary
                </Button>
              </Grid2>

              <Grid2 size={{ xs: 12, md: 5 }}>
                {draft.selectedProvider && (
                  <PriceBreakdown
                    hourlyRate={draft.selectedProvider.hourlyRate}
                    workingHours={draft.workingHours}
                    discountAmount={draft.couponDiscount}
                  />
                )}
              </Grid2>
            </Grid2>
          </Box>
        )}

        {/* STEP 3: Final Review & Confirm */}
        {activeStep === 3 && (
          <Box maxWidth={720} sx={{ mx: 'auto' }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF', textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 56, mb: 1 }} />
              <Typography variant="h5" fontWeight={900} gutterBottom>
                Review & Confirm Booking
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Scheduled for {draft.selectedDate} at {draft.selectedSlot}
              </Typography>

              <PriceBreakdown
                hourlyRate={draft.selectedProvider?.hourlyRate || 300}
                workingHours={draft.workingHours}
                discountAmount={draft.couponDiscount}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={bookingLoading}
                onClick={handleConfirmAndPay}
                sx={{ mt: 4, py: 1.5, borderRadius: '12px', fontWeight: 900, fontSize: '1.05rem' }}
              >
                {bookingLoading ? 'Processing Booking...' : 'Confirm & Book Now'}
              </Button>
            </Paper>
          </Box>
        )}
      </Container>

      {/* Add Address Modal */}
      <AddAddressDialog
        open={addAddressOpen}
        onClose={() => setAddAddressOpen(false)}
        onSaveAddress={handleAddNewAddress}
      />

      <CouponSelectorModal
        open={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        appliedCode={draft.couponCode}
        onApplyCoupon={(code) => dispatch(setDraftCoupon({ code, discount: 50 }))}
      />
    </Box>
  );
};

export default BookingFlowPage;
