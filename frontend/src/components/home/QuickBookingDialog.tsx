import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  MenuItem,
  Select,
  Grid2,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Input } from '../';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ServiceType } from '../../types';

import MyLocationIcon from '@mui/icons-material/MyLocation';
import locationApi, { IReverseGeocodeResult } from '../../services/api/location.api';
import GlobalLocationSelector, { LocationSelectionValue } from '../common/GlobalLocationSelector';
import { CircularProgress } from '@mui/material';

interface QuickBookingDialogProps {
  open: boolean;
  onClose: () => void;
  serviceTitle?: string;
  providerName?: string;
  estimatedPrice?: string;
}

export const QuickBookingDialog: React.FC<QuickBookingDialogProps> = ({
  open,
  onClose,
  serviceTitle = 'Home Service',
  providerName,
  estimatedPrice = '₹250/hr',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('08:00 AM - 10:00 AM');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [stateName, setStateName] = useState('Karnataka');
  const [countryName, setCountryName] = useState('India');
  const [pincode, setPincode] = useState('560001');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [locationAlert, setLocationAlert] = useState<{ severity: 'info' | 'warning' | 'error' | 'success'; message: string } | null>(null);

  const handleUseCurrentLocation = () => {
    setLocationAlert(null);
    if (!navigator.geolocation) {
      setLocationAlert({ severity: 'warning', message: 'Unable to detect your location. Please try again or search manually.' });
      return;
    }

    setDetectingLocation(true);
    setLocationStatus('detecting');
    setLocationAlert({ severity: 'info', message: '📍 Detecting your location...' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const resolved: IReverseGeocodeResult = await locationApi.reverseGeocode(lat, lng);

          const fullAddr = resolved.formattedAddress || `${resolved.street ? resolved.street + ', ' : ''}${resolved.city}, ${resolved.state}, ${resolved.country}`;

          setAddress(fullAddr);
          setCity(resolved.city);
          setStateName(resolved.state);
          setCountryName(resolved.country);
          if (resolved.pincode) setPincode(resolved.pincode);
          setLatitude(lat);
          setLongitude(lng);

          setLocationStatus('success');
          setLocationAlert({ severity: 'success', message: '📍 Location detected' });
        } catch (_err) {
          setLocationStatus('error');
          setLocationAlert({ severity: 'warning', message: 'Could not determine your address. Please search manually.' });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        setLocationStatus('error');
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

  const handleLocationChange = (val: LocationSelectionValue) => {
    if (val.city) setCity(val.city);
    if (val.state) setStateName(val.state);
    if (val.country) setCountryName(val.country);
    if (val.pincode) setPincode(val.pincode);
    if (val.formattedAddress) setAddress(val.formattedAddress);
    if (val.latitude) setLatitude(val.latitude);
    if (val.longitude) setLongitude(val.longitude);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const isMaid =
        serviceTitle.toLowerCase().includes('maid') ||
        serviceTitle.toLowerCase().includes('cleaning');

      const serviceType = isMaid ? ServiceType.MAID : ServiceType.COOK;

      // Calculate start and end times from timeSlot dropdown
      let startTime = '08:00';
      let endTime = '10:00';
      if (timeSlot.includes('-')) {
        const parts = timeSlot.split('-');
        const parseTime = (str: string) => {
          const m = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
          if (!m) return '09:00';
          let h = parseInt(m[1], 10);
          const min = m[2];
          const ampm = m[3];
          if (ampm && ampm.toUpperCase() === 'PM' && h < 12) h += 12;
          if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
          return `${h.toString().padStart(2, '0')}:${min}`;
        };
        startTime = parseTime(parts[0]);
        endTime = parseTime(parts[1]);
      }

      const payload = {
        cookId: '660000000000000000000001',
        serviceType,
        scheduledDate: date,
        startTime,
        endTime,
        durationHours: 2,
        serviceAddress: {
          street: address || 'Main Service Street',
          city: city || 'Bengaluru',
          state: stateName || 'Karnataka',
          pincode: pincode || '560001',
          country: countryName || 'India',
          latitude,
          longitude,
        },
        hourlyRate: 250,
        notes: `Contact Phone: ${phone || 'N/A'}${providerName ? '. Preferred Provider: ' + providerName : ''}`,
      };

      await api.post('/bookings', payload);
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj?.response?.data?.message || 'Failed to save booking to database. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleReset}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, p: 1 },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={800}>
          {isSuccess ? 'Booking Confirmed!' : `Book ${providerName ? providerName : serviceTitle}`}
        </Typography>
        <IconButton onClick={handleReset} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {isSuccess ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Your Booking is Saved in MongoDB!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We have dispatched your request to <strong>{providerName || serviceTitle}</strong>. Our team will contact you at <strong>{phone || '+91 98765 43210'}</strong> shortly.
            </Typography>

            <Alert severity="info" sx={{ borderRadius: 3, textAlign: 'left', mb: 3 }}>
              Date: <strong>{date}</strong> • Slot: <strong>{timeSlot}</strong> • Price: <strong>{estimatedPrice}</strong>
            </Alert>

            <Button variant="contained" color="primary" fullWidth onClick={handleReset}>
              Done & Return Home
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleConfirmBooking}>
            {!isAuthenticated && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
                You are currently browsing as a guest. Please log in or register to complete instant booking.
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                {errorMessage}
              </Alert>
            )}

            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 3, mb: 3, border: '1px solid #E2E8F0' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                SERVICE SUMMARY
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                  {serviceTitle} {providerName && `(by ${providerName})`}
                </Typography>
                <Chip label={estimatedPrice} color="primary" size="small" sx={{ fontWeight: 800 }} />
              </Box>
            </Box>

            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Input
                  label="Service Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Time Slot
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  sx={{ borderRadius: '10px' }}
                >
                  <MenuItem value="07:00 AM - 09:00 AM">07:00 AM - 09:00 AM (Breakfast)</MenuItem>
                  <MenuItem value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM (Morning Maid)</MenuItem>
                  <MenuItem value="11:30 AM - 01:30 PM">11:30 AM - 01:30 PM (Lunch)</MenuItem>
                  <MenuItem value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</MenuItem>
                  <MenuItem value="06:30 PM - 08:30 PM">06:30 PM - 08:30 PM (Dinner)</MenuItem>
                </Select>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Input
                  label="Contact Phone Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    Complete Home Address *
                  </Typography>
                  <Button
                    variant="outlined"
                    color={locationStatus === 'success' ? 'success' : 'primary'}
                    size="small"
                    startIcon={detectingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />}
                    onClick={handleUseCurrentLocation}
                    disabled={detectingLocation}
                    sx={{ fontWeight: 800, borderRadius: '8px', textTransform: 'none', px: 1.5, py: 0.4 }}
                  >
                    {detectingLocation
                      ? '📍 Detecting your location...'
                      : locationStatus === 'success'
                      ? '📍 Location detected'
                      : '📍 Use my current location'}
                  </Button>
                </Box>

                {locationAlert && (
                  <Alert severity={locationAlert.severity} onClose={() => setLocationAlert(null)} sx={{ mb: 1.5, borderRadius: 2 }}>
                    {locationAlert.message}
                  </Alert>
                )}

                <Input
                  label=""
                  placeholder="Flat No, House Name, Street, Landmark..."
                  multiline
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />

                <Box sx={{ mt: 1.5 }}>
                  <GlobalLocationSelector
                    value={{ city, state: stateName, country: countryName, pincode, formattedAddress: address }}
                    onChange={handleLocationChange}
                    showCurrentLocationButton={false}
                    compact
                  />
                </Box>
              </Grid2>
            </Grid2>

            <DialogActions sx={{ px: 0, pt: 3 }}>
              <Button variant="outlined" onClick={onClose} sx={{ width: 120 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" loading={loading} sx={{ flex: 1, height: 46 }}>
                {isAuthenticated ? 'Confirm Booking' : 'Log In to Book'}
              </Button>
            </DialogActions>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickBookingDialog;
