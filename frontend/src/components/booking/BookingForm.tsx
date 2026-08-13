import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Paper,
  Box,
  Typography,
  Grid2,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  InputAdornment,
  TextField,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import PinDropIcon from '@mui/icons-material/PinDrop';
import NoteAltIcon from '@mui/icons-material/NoteAlt';

import { Button } from '../';
import { MOCK_CITIES } from '../../services/mockData';
import locationApi from '../../services/api/location.api';

export const bookingFormSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
  address: z.string().min(5, 'Full street address is required'),
  city: z.string().min(1, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit Pincode'),
  date: z.string().min(1, 'Service date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  workingHours: z.number().min(1, 'Working hours must be at least 1 hour'),
  specialInstructions: z.string().optional(),
});

export type BookingFormInputs = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  initialValues?: Partial<BookingFormInputs>;
  onSubmit: (data: BookingFormInputs) => void;
  isSubmitting?: boolean;
  serviceType?: string;
  providerName?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  providerName,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormInputs>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: initialValues?.customerName || 'Aarav Mehta',
      phone: initialValues?.phone || '9876543210',
      address: initialValues?.address || 'Flat 402, Sunshine Apartments, HSR Layout Sector 2',
      city: initialValues?.city || 'Bengaluru',
      pincode: initialValues?.pincode || '560102',
      date: initialValues?.date || new Date().toISOString().split('T')[0],
      timeSlot: initialValues?.timeSlot || '08:00 AM - 10:00 AM',
      workingHours: initialValues?.workingHours || 2,
      specialInstructions: initialValues?.specialInstructions || '',
    },
  });

  const cityValue = watch('city');
  const workingHoursValue = watch('workingHours');

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
          Booking Schedule & Address Details
        </Typography>
        {providerName && (
          <Typography variant="caption" color="primary.main" fontWeight={700}>
            Booking with: {providerName}
          </Typography>
        )}
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={2.5}>
          {/* Customer Name */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Full Name"
              placeholder="Enter your full name"
              {...register('customerName')}
              error={!!errors.customerName}
              helperText={errors.customerName?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              size="small"
              fullWidth
            />
          </Grid2>

          {/* Contact Phone */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Mobile Phone Number"
              placeholder="10-digit mobile number"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              size="small"
              fullWidth
            />
          </Grid2>

          {/* Full Address & Use My Current Location */}
          <Grid2 size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Service Address Details
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  if (!navigator.geolocation) return;
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    try {
                      const res = await locationApi.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                      if (res.formattedAddress) setValue('address', res.formattedAddress, { shouldValidate: true });
                      if (res.city) setValue('city', res.city, { shouldValidate: true });
                      if (res.pincode) setValue('pincode', res.pincode, { shouldValidate: true });
                    } catch (_e) {
                      // Handled
                    }
                  });
                }}
                sx={{ borderRadius: '8px', fontSize: '0.75rem', py: 0.3 }}
              >
                📍 Use my current location
              </Button>
            </Box>
            <TextField
              label="Service Address"
              placeholder="House/Flat No, Building Name, Street & Area"
              multiline
              rows={2}
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              size="small"
              fullWidth
            />
          </Grid2>

          {/* City Select */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
              City
            </Typography>
            <FormControl fullWidth size="small" error={!!errors.city}>
              <Select
                value={cityValue}
                onChange={(e) => setValue('city', e.target.value, { shouldValidate: true })}
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOnIcon fontSize="small" color="action" />
                  </InputAdornment>
                }
                sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
              >
                {MOCK_CITIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
              {errors.city && <FormHelperText>{errors.city.message}</FormHelperText>}
            </FormControl>
          </Grid2>

          {/* Pincode */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Pincode"
              placeholder="6-digit Pincode"
              {...register('pincode')}
              error={!!errors.pincode}
              helperText={errors.pincode?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinDropIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              size="small"
              fullWidth
            />
          </Grid2>

          {/* Service Date */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              type="date"
              label="Booking Date"
              {...register('date')}
              error={!!errors.date}
              helperText={errors.date?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              size="small"
              fullWidth
            />
          </Grid2>

          {/* Time Slot Select */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Time Slot"
              placeholder="e.g. 08:00 AM - 10:00 AM"
              {...register('timeSlot')}
              error={!!errors.timeSlot}
              helperText={errors.timeSlot?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              size="small"
              fullWidth
            />
          </Grid2>

          {/* Working Hours Select */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
              Required Duration (Hours)
            </Typography>
            <FormControl fullWidth size="small" error={!!errors.workingHours}>
              <Select
                value={workingHoursValue}
                onChange={(e) => setValue('workingHours', Number(e.target.value), { shouldValidate: true })}
                startAdornment={
                  <InputAdornment position="start">
                    <TimerIcon fontSize="small" color="action" />
                  </InputAdornment>
                }
                sx={{ borderRadius: '10px', bgcolor: '#F8FAFC' }}
              >
                <MenuItem value={1}>1 Hour Session</MenuItem>
                <MenuItem value={2}>2 Hours Session</MenuItem>
                <MenuItem value={3}>3 Hours Session</MenuItem>
                <MenuItem value={4}>4 Hours Session</MenuItem>
                <MenuItem value={8}>8 Hours Full Day</MenuItem>
              </Select>
            </FormControl>
          </Grid2>

          {/* Special Instructions */}
          <Grid2 size={{ xs: 12 }}>
            <TextField
              label="Special Cooking/Cleaning Instructions (Optional)"
              placeholder="e.g. Please use low oil/salt, handle glassware carefully..."
              multiline
              rows={2}
              {...register('specialInstructions')}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <NoteAltIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              size="small"
              fullWidth
            />
          </Grid2>

          {/* Submit Button */}
          <Grid2 size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isSubmitting}
              sx={{ borderRadius: '12px', py: 1.5, fontWeight: 800, fontSize: '1rem' }}
            >
              {isSubmitting ? 'Processing Booking...' : 'Proceed to Checkout Payment'}
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </Paper>
  );
};

export default BookingForm;
