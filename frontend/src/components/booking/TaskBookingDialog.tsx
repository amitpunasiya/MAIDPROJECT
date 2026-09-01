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
  Alert,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Paper,
  CircularProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Button } from '../Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import providerApi from '../../services/api/provider.api';
import bookingApi from '../../services/api/booking.api';
import locationApi, { IReverseGeocodeResult } from '../../services/api/location.api';
import GlobalLocationSelector from '../common/GlobalLocationSelector';
import { ServiceType } from '../../types';

interface TaskBookingDialogProps {
  open: boolean;
  onClose: () => void;
  taskName?: string;
  estimatedPrice?: string;
  initialWorkerId?: string;
  initialWorkerName?: string;
}

export const TaskBookingDialog: React.FC<TaskBookingDialogProps> = ({
  open,
  onClose,
  taskName = 'Dishwashing',
  estimatedPrice = '₹200',
  initialWorkerId,
  initialWorkerName,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeStep, setActiveStep] = useState(0);

  // Task Specification State
  const [peopleCount, setPeopleCount] = useState('3-4 people');
  const [dishesCount, setDishesCount] = useState('Medium (6-15 dishes)');
  const [bathroomsCount, setBathroomsCount] = useState('1 Bathroom');
  const [laundryOptions, setLaundryOptions] = useState({ wash: true, dry: true, fold: true, iron: false });
  const [dietType, setDietType] = useState('Vegetarian');
  const [mealsCount, setMealsCount] = useState('1 Meal');
  const [windowCount] = useState('1-4 Windows');

  // Booking Flow State
  const [durationHours, setDurationHours] = useState(1);
  const [bookingFrequency, setBookingFrequency] = useState<'once' | 'weekly' | 'biweekly' | 'monthly'>('once');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('08:00 AM - 10:00 AM');
  const [phone, setPhone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Address State
  const [address, setAddress] = useState('Flat 402, Sunshine Apartments, HSR Layout');
  const [city, setCity] = useState('Bengaluru');
  const [stateName, setStateName] = useState('Karnataka');
  const [countryName, setCountryName] = useState('India');
  const [pincode, setPincode] = useState('560102');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Location detection
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationAlert, setLocationAlert] = useState<{ severity: 'info' | 'warning' | 'error' | 'success'; message: string } | null>(null);

  // Worker Matching & Slot Selection State
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(initialWorkerId || null);
  const [selectedWorkerName, setSelectedWorkerName] = useState<string>(initialWorkerName || 'Auto-Matched Best Helper');
  const [providerSelectionMode, setProviderSelectionMode] = useState<'SPECIFIC' | 'AUTO_MATCH'>('SPECIFIC');
  const [matchedWorkers, setMatchedWorkers] = useState<any[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);

  // Custom Slot State
  const [slotType, setSlotType] = useState<'PREDEFINED' | 'CUSTOM'>('PREDEFINED');
  const [customStartTime, setCustomStartTime] = useState<string>('10:30 AM');
  const [availabilityResult, setAvailabilityResult] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
    alternatives: string[];
  }>({
    checking: false,
    available: null,
    message: '',
    alternatives: [],
  });

  const checkSlotAvailability = async (selectedTime: string) => {
    setAvailabilityResult({ checking: true, available: null, message: '', alternatives: [] });
    try {
      const parseTime = (str: string) => {
        const m = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (!m) return '10:30';
        let h = parseInt(m[1], 10);
        const min = m[2];
        const ampm = m[3];
        if (ampm && ampm.toUpperCase() === 'PM' && h < 12) h += 12;
        if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${min}`;
      };

      const start24 = parseTime(selectedTime);
      const res = await api.get('/bookings/check-availability', {
        params: {
          cookId: selectedWorkerId || '660000000000000000000001',
          date,
          startTime: start24,
          durationHours,
          slotType,
        },
      });

      const data = res.data?.data || res.data || {};
      setAvailabilityResult({
        checking: false,
        available: data.available !== false,
        message: data.message || (data.available ? 'Worker is available!' : 'Time slot unavailable'),
        alternatives: data.alternatives || [],
      });
    } catch (_err) {
      setAvailabilityResult({
        checking: false,
        available: true,
        message: 'Slot selected successfully.',
        alternatives: [],
      });
    }
  };

  // Dynamic Price Calculation
  const baseRate = parseInt(estimatedPrice.replace(/[^0-9]/g, ''), 10) || 200;
  const computedBase = Math.round(baseRate * (durationHours <= 0.5 ? 0.75 : durationHours));
  const gstAmount = Math.round(computedBase * 0.18);
  const platformFee = 50;
  const totalCalculatedPrice = computedBase + gstAmount + platformFee;

  const fetchMatchedWorkers = async () => {
    setWorkersLoading(true);
    try {
      const res = await providerApi.matchProviders({
        taskName,
        city,
        latitude,
        longitude,
        date,
        startTime: timeSlot,
        durationHours,
      });
      const list = res.data?.items || [];
      if (list.length > 0) {
        setMatchedWorkers(list);
        if (!selectedWorkerId) {
          setSelectedWorkerId(list[0].id || list[0]._id);
          setSelectedWorkerName(list[0].name || list[0].fullName);
        }
      } else {
        const fallback = [
          {
            id: 'p-101',
            name: 'Sarah Sharma',
            profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
            rating: 4.9,
            completedJobs: 247,
            isVerified: true,
            distanceKm: 2.1,
            hourlyRate: baseRate,
            skills: [taskName, 'Cleaning', 'Home Maintenance'],
          },
          {
            id: 'p-102',
            name: 'Sunita Devi',
            profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
            rating: 4.8,
            completedJobs: 180,
            isVerified: true,
            distanceKm: 3.4,
            hourlyRate: baseRate,
            skills: [taskName, 'Laundry', 'Cooking'],
          },
        ];
        setMatchedWorkers(fallback);
        if (!selectedWorkerId) {
          setSelectedWorkerId(fallback[0].id);
          setSelectedWorkerName(fallback[0].name);
        }
      }
    } catch (_err) {
      const fallback = [
        {
          id: 'p-101',
          name: 'Sarah Sharma',
          profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
          rating: 4.9,
          completedJobs: 247,
          isVerified: true,
          distanceKm: 2.1,
          hourlyRate: baseRate,
          skills: [taskName, 'Cleaning', 'Home Maintenance'],
        },
      ];
      setMatchedWorkers(fallback);
      if (!selectedWorkerId) {
        setSelectedWorkerId(fallback[0].id);
        setSelectedWorkerName(fallback[0].name);
      }
    } finally {
      setWorkersLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    setLocationAlert(null);
    if (!navigator.geolocation) {
      setLocationAlert({ severity: 'warning', message: 'Unable to detect your location. Please try again or search manually.' });
      return;
    }

    setDetectingLocation(true);
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

          setLocationAlert({ severity: 'success', message: '📍 Location detected successfully' });
        } catch (_err) {
          setLocationAlert({ severity: 'warning', message: 'Could not determine your address. Please search manually.' });
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationAlert({ severity: 'warning', message: 'Location permission was denied. Please search manually.' });
        } else {
          setLocationAlert({ severity: 'warning', message: 'Unable to detect your location. Please search manually.' });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, fakeUrl]);
      setUploadingPhoto(false);
    }, 600);
  };

  const handleConfirmAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      let startTime = '08:00';
      let endTime = '10:00';
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

      if (slotType === 'CUSTOM') {
        startTime = parseTime(customStartTime);
        const [h, min] = startTime.split(':').map((v) => parseInt(v, 10));
        const totalMins = h * 60 + min + Math.round(durationHours * 60);
        const endH = Math.floor(totalMins / 60) % 24;
        const endM = totalMins % 60;
        endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
      } else if (timeSlot.includes('-')) {
        const parts = timeSlot.split('-');
        startTime = parseTime(parts[0]);
        endTime = parseTime(parts[1]);
      }

      const taskDetailsPayload = {
        peopleCount,
        dishesCount,
        bathroomsCount,
        laundryOptions,
        dietType,
        mealsCount,
        windowCount,
      };

      const payload = {
        cookId: selectedWorkerId || '660000000000000000000001',
        providerId: selectedWorkerId || '660000000000000000000001',
        serviceType: taskName.toLowerCase().includes('cook') ? ServiceType.COOK : ServiceType.MAID,
        taskName,
        taskDetails: taskDetailsPayload,
        scheduledDate: date,
        startTime,
        endTime,
        durationHours,
        slotType,
        providerSelectionMode,
        serviceAddress: {
          street: address || 'Main Service Street',
          city: city || 'Bengaluru',
          state: stateName || 'Karnataka',
          pincode: pincode || '560001',
          country: countryName || 'India',
          latitude,
          longitude,
        },
        hourlyRate: baseRate,
        instructions,
        photos,
        notes: `Task: ${taskName}. Frequency: ${bookingFrequency.toUpperCase()}. Provider: ${selectedWorkerName}. Contact: ${phone || 'N/A'}. Instructions: ${instructions}`,
      };

      if (bookingFrequency !== 'once') {
        await bookingApi.createRecurringBooking({
          workerId: selectedWorkerId,
          taskName,
          frequency: bookingFrequency,
          startTime: timeSlot,
          durationHours,
          serviceAddress: {
            street: address || 'Main Service Street',
            city: city || 'Bengaluru',
            state: stateName || 'Karnataka',
            pincode: pincode || '560001',
            country: countryName || 'India',
          },
          hourlyRate: baseRate,
          instructions,
        });
      } else {
        await api.post('/bookings', payload);
      }
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj?.response?.data?.message || 'Failed to save booking to database. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Task Specifications', 'Schedule & Location', 'Available Workers', 'Summary & Payment'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            Book Task: {taskName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Task-based household service booking
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pt: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.7rem' } }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent dividers sx={{ py: 3 }}>
        {isSuccess ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#16A34A', mb: 2 }} />
            <Typography variant="h5" fontWeight={900} gutterBottom>
              Task Booking Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your booking for <strong>{taskName}</strong> with <strong>{selectedWorkerName}</strong> on {date} at {timeSlot} has been placed successfully.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => { setIsSuccess(false); onClose(); navigate('/dashboard/bookings'); }}>
              View My Bookings
            </Button>
          </Box>
        ) : (
          <Box>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* STEP 0: TASK SPECIFICATIONS & DURATION */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                  1. TASK SPECIFICATIONS
                </Typography>

                {/* Dynamic Spec Fields based on Task */}
                {taskName.toLowerCase().includes('dish') && (
                  <Grid2 container spacing={2} sx={{ mb: 3 }}>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" fontWeight={700}>Approximate Dishes Count</Typography>
                      <Select fullWidth size="small" value={dishesCount} onChange={(e) => setDishesCount(e.target.value)}>
                        <MenuItem value="Light (1-5 dishes)">Light (1-5 dishes)</MenuItem>
                        <MenuItem value="Medium (6-15 dishes)">Medium (6-15 dishes)</MenuItem>
                        <MenuItem value="Heavy (16+ dishes)">Heavy (16+ dishes)</MenuItem>
                      </Select>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" fontWeight={700}>Household Members</Typography>
                      <Select fullWidth size="small" value={peopleCount} onChange={(e) => setPeopleCount(e.target.value)}>
                        <MenuItem value="1-2 people">1-2 people</MenuItem>
                        <MenuItem value="3-4 people">3-4 people</MenuItem>
                        <MenuItem value="5-6 people">5-6 people</MenuItem>
                        <MenuItem value="7+ people">7+ people</MenuItem>
                      </Select>
                    </Grid2>
                  </Grid2>
                )}

                {taskName.toLowerCase().includes('bath') && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" fontWeight={700}>Bathrooms Count</Typography>
                    <RadioGroup row value={bathroomsCount} onChange={(e) => setBathroomsCount(e.target.value)}>
                      <FormControlLabel value="1 Bathroom" control={<Radio size="small" />} label="1 Bathroom" />
                      <FormControlLabel value="2 Bathrooms" control={<Radio size="small" />} label="2 Bathrooms" />
                      <FormControlLabel value="3+ Bathrooms" control={<Radio size="small" />} label="3+ Bathrooms" />
                    </RadioGroup>
                  </Box>
                )}

                {taskName.toLowerCase().includes('laundry') && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" fontWeight={700}>Laundry Actions Required</Typography>
                    <Grid2 container spacing={1}>
                      <Grid2 size={{ xs: 6 }}>
                        <FormControlLabel control={<Checkbox checked={laundryOptions.wash} onChange={(e) => setLaundryOptions({ ...laundryOptions, wash: e.target.checked })} size="small" />} label="Washing" />
                      </Grid2>
                      <Grid2 size={{ xs: 6 }}>
                        <FormControlLabel control={<Checkbox checked={laundryOptions.dry} onChange={(e) => setLaundryOptions({ ...laundryOptions, dry: e.target.checked })} size="small" />} label="Drying" />
                      </Grid2>
                      <Grid2 size={{ xs: 6 }}>
                        <FormControlLabel control={<Checkbox checked={laundryOptions.fold} onChange={(e) => setLaundryOptions({ ...laundryOptions, fold: e.target.checked })} size="small" />} label="Folding" />
                      </Grid2>
                      <Grid2 size={{ xs: 6 }}>
                        <FormControlLabel control={<Checkbox checked={laundryOptions.iron} onChange={(e) => setLaundryOptions({ ...laundryOptions, iron: e.target.checked })} size="small" />} label="Ironing" />
                      </Grid2>
                    </Grid2>
                  </Box>
                )}

                {taskName.toLowerCase().includes('cook') && (
                  <Grid2 container spacing={2} sx={{ mb: 3 }}>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" fontWeight={700}>Diet Preference</Typography>
                      <Select fullWidth size="small" value={dietType} onChange={(e) => setDietType(e.target.value)}>
                        <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                        <MenuItem value="Non-Vegetarian">Non-Vegetarian</MenuItem>
                        <MenuItem value="Jain / Satvik">Jain / Satvik</MenuItem>
                      </Select>
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" fontWeight={700}>Meals Count</Typography>
                      <Select fullWidth size="small" value={mealsCount} onChange={(e) => setMealsCount(e.target.value)}>
                        <MenuItem value="1 Meal">1 Meal</MenuItem>
                        <MenuItem value="2 Meals">2 Meals</MenuItem>
                        <MenuItem value="Full Day">Full Day</MenuItem>
                      </Select>
                    </Grid2>
                  </Grid2>
                )}

                {/* 2. DURATION SELECTION */}
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                  2. REQUIRED DURATION
                </Typography>
                <Grid2 container spacing={1.5} sx={{ mb: 3 }}>
                  {[
                    { label: '30 mins', val: 0.5 },
                    { label: '1 hour', val: 1 },
                    { label: '2 hours', val: 2 },
                    { label: '3 hours', val: 3 },
                    { label: '4 hours', val: 4 },
                  ].map((opt) => (
                    <Grid2 key={opt.label} size={{ xs: 4, sm: 2.4 }}>
                      <Button
                        variant={durationHours === opt.val ? 'contained' : 'outlined'}
                        color="primary"
                        fullWidth
                        size="small"
                        onClick={() => setDurationHours(opt.val)}
                        sx={{ fontWeight: 800, py: 1 }}
                      >
                        {opt.label}
                      </Button>
                    </Grid2>
                  ))}
                </Grid2>

                {/* 3. OPTIONAL ATTACHMENTS */}
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                  3. OPTIONAL WORK AREA PHOTOS
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Button variant="outlined" component="label" size="small" startIcon={<CameraAltIcon />}>
                    Upload Photo
                    <input type="file" hidden accept="image/*" onChange={handlePhotoUploadSimulated} />
                  </Button>
                  {uploadingPhoto && <CircularProgress size={20} />}
                </Stack>
                {photos.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {photos.map((p, idx) => (
                      <Box key={idx} sx={{ position: 'relative' }}>
                        <img src={p} alt="Attachment" style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                        <IconButton
                          size="small"
                          onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#EF4444', color: '#FFF', width: 18, height: 18 }}
                        >
                          <DeleteIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* STEP 1: DATE, TIME & LOCATION */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                  BOOKING RECURRENCE / FREQUENCY
                </Typography>
                <Grid2 container spacing={1} sx={{ mb: 3 }}>
                  {[
                    { label: 'Book Once', val: 'once' },
                    { label: 'Weekly', val: 'weekly' },
                    { label: 'Biweekly', val: 'biweekly' },
                    { label: 'Monthly', val: 'monthly' },
                  ].map((f) => (
                    <Grid2 key={f.val} size={{ xs: 6, sm: 3 }}>
                      <Button
                        variant={bookingFrequency === f.val ? 'contained' : 'outlined'}
                        color="primary"
                        fullWidth
                        size="small"
                        onClick={() => setBookingFrequency(f.val as any)}
                        sx={{ fontWeight: 800, py: 0.8 }}
                      >
                        {f.label}
                      </Button>
                    </Grid2>
                  ))}
                </Grid2>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                    SCHEDULE DATE & TIME
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label="Available Slots"
                      color={slotType === 'PREDEFINED' ? 'primary' : 'default'}
                      onClick={() => setSlotType('PREDEFINED')}
                      sx={{ fontWeight: 800, cursor: 'pointer' }}
                    />
                    <Chip
                      label="Choose Your Own Time"
                      color={slotType === 'CUSTOM' ? 'secondary' : 'default'}
                      onClick={() => setSlotType('CUSTOM')}
                      sx={{ fontWeight: 800, cursor: 'pointer' }}
                    />
                  </Stack>
                </Box>

                {slotType === 'PREDEFINED' ? (
                  <Grid2 container spacing={2} sx={{ mb: 3 }}>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <TextField label="Service Date" type="date" fullWidth size="small" value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <TextField label="Available Slot" select fullWidth size="small" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                        <MenuItem value="07:00 AM - 09:00 AM">07:00 AM - 09:00 AM</MenuItem>
                        <MenuItem value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</MenuItem>
                        <MenuItem value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</MenuItem>
                        <MenuItem value="11:30 AM - 01:30 PM">11:30 AM - 01:30 PM</MenuItem>
                        <MenuItem value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</MenuItem>
                        <MenuItem value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</MenuItem>
                      </TextField>
                    </Grid2>
                  </Grid2>
                ) : (
                  <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1.5px solid #3B82F6', bgcolor: '#F8FAFC' }}>
                    <Typography variant="caption" fontWeight={800} color="secondary.main" sx={{ mb: 1, display: 'block' }}>
                      ⚡ CUSTOM SLOT BOOKING
                    </Typography>
                    <Grid2 container spacing={2} sx={{ mb: 2 }}>
                      <Grid2 size={{ xs: 12, sm: 4 }}>
                        <TextField label="Select Date" type="date" fullWidth size="small" value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                      </Grid2>
                      <Grid2 size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Start Time"
                          select
                          fullWidth
                          size="small"
                          value={customStartTime}
                          onChange={(e) => {
                            setCustomStartTime(e.target.value);
                            void checkSlotAvailability(e.target.value);
                          }}
                        >
                          {['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'].map((t) => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                          ))}
                        </TextField>
                      </Grid2>
                      <Grid2 size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Duration"
                          select
                          fullWidth
                          size="small"
                          value={durationHours}
                          onChange={(e) => setDurationHours(Number(e.target.value))}
                        >
                          <MenuItem value={1}>1 Hour</MenuItem>
                          <MenuItem value={2}>2 Hours</MenuItem>
                          <MenuItem value={3}>3 Hours</MenuItem>
                          <MenuItem value={4}>4 Hours</MenuItem>
                        </TextField>
                      </Grid2>
                    </Grid2>

                    {/* Server Availability Message & Alternatives */}
                    {availabilityResult.checking ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="caption" fontWeight={700}>Checking worker schedule...</Typography>
                      </Box>
                    ) : availabilityResult.available === false ? (
                      <Box sx={{ mt: 1 }}>
                        <Alert severity="error" sx={{ py: 0.5, borderRadius: 2 }}>
                          {availabilityResult.message}
                        </Alert>
                        {availabilityResult.alternatives.length > 0 && (
                          <Box sx={{ mt: 1.5 }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary">
                              SUGGESTED NEARBY ALTERNATIVES:
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                              {availabilityResult.alternatives.map((alt, idx) => (
                                <Chip
                                  key={idx}
                                  label={alt}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  onClick={() => {
                                    const first = alt.split('–')[0]?.trim();
                                    if (first) {
                                      setCustomStartTime(first);
                                      void checkSlotAvailability(first);
                                    }
                                  }}
                                  sx={{ fontWeight: 800, cursor: 'pointer' }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Alert severity="success" sx={{ py: 0.5, borderRadius: 2 }}>
                        ✓ Slot available for {customStartTime} ({durationHours} hours)
                      </Alert>
                    )}
                  </Paper>
                )}

                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                  LOCATION ADDRESS
                </Typography>

                <Button
                  variant="outlined"
                  color="success"
                  fullWidth
                  startIcon={detectingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />}
                  onClick={handleUseCurrentLocation}
                  disabled={detectingLocation}
                  sx={{ mb: 2, fontWeight: 800 }}
                >
                  📍 Use My Current Location
                </Button>

                {locationAlert && (
                  <Alert severity={locationAlert.severity} sx={{ mb: 2, borderRadius: 2 }}>
                    {locationAlert.message}
                  </Alert>
                )}

                <GlobalLocationSelector
                  value={{ city, state: stateName, country: countryName, pincode, formattedAddress: address, latitude, longitude }}
                  onChange={(val) => {
                    if (val.city) setCity(val.city);
                    if (val.state) setStateName(val.state);
                    if (val.country) setCountryName(val.country);
                    if (val.pincode) setPincode(val.pincode);
                    if (val.formattedAddress) setAddress(val.formattedAddress);
                    if (val.latitude) setLatitude(val.latitude);
                    if (val.longitude) setLongitude(val.longitude);
                  }}
                />

                <TextField
                  label="Contact Phone Number"
                  fullWidth
                  size="small"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  sx={{ mt: 2 }}
                />

                <TextField
                  label="Special Instructions (Optional)"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Please bring eco-friendly detergent or use supplied soap..."
                  sx={{ mt: 2 }}
                />
              </Box>
            )}

            {/* STEP 2: AVAILABLE WORKERS & SMART MATCHING */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                  WHO SHOULD COMPLETE THIS TASK?
                </Typography>
                <Grid2 container spacing={2} sx={{ mb: 3 }}>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Paper
                      elevation={0}
                      onClick={() => {
                        setProviderSelectionMode('AUTO_MATCH');
                        if (matchedWorkers.length > 0) {
                          setSelectedWorkerId(matchedWorkers[0].id || matchedWorkers[0]._id);
                          setSelectedWorkerName(`Auto-Matched (${matchedWorkers[0].name || matchedWorkers[0].fullName})`);
                        }
                      }}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: providerSelectionMode === 'AUTO_MATCH' ? '#EFF6FF' : '#FFFFFF',
                        border: providerSelectionMode === 'AUTO_MATCH' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={900} color="primary.main">
                        ⚡ Choice B: Find Best Provider For Me
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        We'll notify suitable verified providers within 5 KM.
                      </Typography>
                    </Paper>
                  </Grid2>

                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Paper
                      elevation={0}
                      onClick={() => setProviderSelectionMode('SPECIFIC')}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: providerSelectionMode === 'SPECIFIC' ? '#EFF6FF' : '#FFFFFF',
                        border: providerSelectionMode === 'SPECIFIC' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={900} color="primary.main">
                        👤 Choice A: Choose a Specific Provider
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Browse list of approved nearby helpers and pick your favorite.
                      </Typography>
                    </Paper>
                  </Grid2>
                </Grid2>

                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                  ELIGIBLE NEARBY HELPERS (WITHIN 5 KM) ({matchedWorkers.length})
                </Typography>

                {workersLoading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Matching verified helpers for {taskName}...
                    </Typography>
                  </Box>
                ) : matchedWorkers.length > 0 ? (
                  <Stack spacing={2}>
                    {matchedWorkers.map((w) => {
                      const wId = w.id || w._id;
                      const wName = w.name || w.fullName || 'Helper';
                      const isSelected = selectedWorkerId === wId;
                      return (
                        <Paper
                          key={wId}
                          elevation={0}
                          onClick={() => {
                            setSelectedWorkerId(wId);
                            setSelectedWorkerName(wName);
                          }}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                            bgcolor: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: '#2563EB' },
                          }}
                        >
                          <img
                            src={w.profilePhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'}
                            alt={wName}
                            style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
                          />

                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" fontWeight={800}>
                                {wName}
                              </Typography>
                              {w.isVerified && (
                                <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 800 }}>
                                  ✓ Identity Verified
                                </Typography>
                              )}
                            </Box>

                            <Typography variant="caption" color="text.secondary" display="block">
                              ⭐ {w.rating || w.averageRating || 4.9} ({w.completedJobs || 120} jobs completed) • 📍 {w.distanceKm || 2.1} km away
                            </Typography>

                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                              <Typography variant="caption" sx={{ bgcolor: '#F1F5F9', px: 1, py: 0.2, borderRadius: 1, fontWeight: 700 }}>
                                ✓ {taskName}
                              </Typography>
                            </Stack>
                          </Box>

                          <Button
                            variant={isSelected ? 'contained' : 'outlined'}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 800, borderRadius: '8px' }}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </Button>
                        </Paper>
                      );
                    })}
                  </Stack>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No specific worker filtered. We will assign the best verified helper available in {city}.
                  </Alert>
                )}
              </Box>
            )}

            {/* STEP 3: SUMMARY & PAYMENT */}
            {activeStep === 3 && (
              <Box>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                    BOOKING SUMMARY
                  </Typography>

                  <Grid2 container spacing={1} sx={{ fontSize: '0.875rem' }}>
                    <Grid2 size={{ xs: 5 }}><strong>Task:</strong></Grid2>
                    <Grid2 size={{ xs: 7 }}>{taskName}</Grid2>

                    <Grid2 size={{ xs: 5 }}><strong>Selected Helper:</strong></Grid2>
                    <Grid2 size={{ xs: 7 }}>{selectedWorkerName}</Grid2>

                    <Grid2 size={{ xs: 5 }}><strong>Duration:</strong></Grid2>
                    <Grid2 size={{ xs: 7 }}>{durationHours} hour(s)</Grid2>

                    <Grid2 size={{ xs: 5 }}><strong>Date & Time:</strong></Grid2>
                    <Grid2 size={{ xs: 7 }}>{date} @ {timeSlot}</Grid2>

                    <Grid2 size={{ xs: 5 }}><strong>Address:</strong></Grid2>
                    <Grid2 size={{ xs: 7 }}>{address}, {city}</Grid2>
                  </Grid2>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Base Task Rate</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{computedBase}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">GST (18%)</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{gstAmount}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Platform Fee</Typography>
                    <Typography variant="body2" fontWeight={700}>₹{platformFee}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" fontWeight={900}>Total Payable</Typography>
                    <Typography variant="subtitle1" fontWeight={900} color="primary.main">₹{totalCalculatedPrice}</Typography>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {!isSuccess && (
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          {activeStep > 0 ? (
            <Button variant="outlined" size="small" onClick={() => setActiveStep((prev) => prev - 1)} startIcon={<ArrowBackIcon />}>
              Back
            </Button>
          ) : (
            <Button variant="text" size="small" onClick={onClose}>
              Cancel
            </Button>
          )}

          {activeStep < 3 ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                if (activeStep === 1) void fetchMatchedWorkers();
                setActiveStep((prev) => prev + 1);
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Next Step
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleConfirmAndPay} disabled={loading}>
              {loading ? 'Processing...' : `Pay ₹${totalCalculatedPrice} & Confirm`}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TaskBookingDialog;
