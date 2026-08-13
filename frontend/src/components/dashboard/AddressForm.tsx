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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

import { Button, Input } from '../';
import { MOCK_CITIES } from '../../services/mockData';

export const addressSchema = z.object({
  tag: z.string().min(1, 'Label (Home/Work/Other) is required'),
  fullAddress: z.string().min(5, 'Full street address is required'),
  city: z.string().min(1, 'City is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit Pincode'),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export interface AddressFormProps {
  initialValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      tag: initialValues?.tag || 'Home',
      fullAddress: initialValues?.fullAddress || '',
      city: initialValues?.city || 'Bengaluru',
      pincode: initialValues?.pincode || '560102',
      landmark: initialValues?.landmark || '',
      isDefault: initialValues?.isDefault || false,
    },
  });

  const cityValue = watch('city');
  const isDefaultValue = watch('isDefault');

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <MapIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          {initialValues ? 'Edit Address' : 'Add New Service Address'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Input
              label="Address Label (Home / Work / Other)"
              placeholder="e.g. Home"
              {...register('tag')}
              error={!!errors.tag}
              helperText={errors.tag?.message}
              fullWidth
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
              City
            </Typography>
            <FormControl fullWidth size="small" error={!!errors.city}>
              <Select
                value={cityValue}
                onChange={(e) => setValue('city', e.target.value, { shouldValidate: true })}
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

          <Grid2 size={{ xs: 12 }}>
            <Input
              label="Flat / House No., Building Name & Street"
              placeholder="e.g. Flat 402, Sunshine Heights, HSR Sector 2"
              multiline
              rows={2}
              {...register('fullAddress')}
              error={!!errors.fullAddress}
              helperText={errors.fullAddress?.message}
              fullWidth
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Input
              label="Pincode"
              placeholder="6-digit Pincode"
              {...register('pincode')}
              error={!!errors.pincode}
              helperText={errors.pincode?.message}
              fullWidth
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Input
              label="Landmark (Optional)"
              placeholder="e.g. Near BDA Complex"
              {...register('landmark')}
              fullWidth
            />
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDefaultValue}
                  onChange={(e) => setValue('isDefault', e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2" fontWeight={600}>Set as default delivery address</Typography>}
            />
          </Grid2>

          <Grid2 size={{ xs: 12 }} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
            {onCancel && (
              <Button onClick={onCancel} color="inherit">
                Cancel
              </Button>
            )}
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ borderRadius: '10px', px: 3, fontWeight: 800 }}>
              {isSubmitting ? 'Saving Address...' : 'Save Address'}
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </Paper>
  );
};

export default AddressForm;
