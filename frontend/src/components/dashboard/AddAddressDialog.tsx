import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid2,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import { Button, Input } from '../';

import GlobalLocationSelector, { LocationSelectionValue } from '../common/GlobalLocationSelector';

const addressSchema = z.object({
  tag: z.string().min(1, 'Label (Home/Work/Other) is required'),
  fullAddress: z.string().min(5, 'Full street address is required'),
  city: z.string().min(1, 'City is required'),
  pincode: z.string().min(3, 'Enter valid Pincode / Zipcode'),
  landmark: z.string().optional(),
});

export type AddressFormInputs = z.infer<typeof addressSchema>;

interface AddAddressDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveAddress?: (data: AddressFormInputs) => void;
  onAddAddress?: (data: AddressFormInputs) => void;
  initialValues?: Partial<AddressFormInputs>;
}

export const AddAddressDialog: React.FC<AddAddressDialogProps> = ({
  open,
  onClose,
  onSaveAddress,
  onAddAddress,
  initialValues,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormInputs>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      tag: initialValues?.tag || 'Home',
      fullAddress: initialValues?.fullAddress || '',
      city: initialValues?.city || 'Bengaluru',
      pincode: initialValues?.pincode || '560102',
      landmark: initialValues?.landmark || '',
    },
  });

  const cityValue = watch('city');

  const handleLocationChange = (val: LocationSelectionValue) => {
    if (val.city) setValue('city', val.city, { shouldValidate: true });
    if (val.pincode) setValue('pincode', val.pincode, { shouldValidate: true });
    if (val.street) {
      const currentFull = watch('fullAddress');
      setValue('fullAddress', currentFull ? `${currentFull}, ${val.street}` : val.street, { shouldValidate: true });
    }
  };

  const handleFormSubmit = (data: AddressFormInputs) => {
    if (onSaveAddress) onSaveAddress(data);
    else if (onAddAddress) onAddAddress(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Add New Service Address
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Global Location Selector & GPS */}
          <GlobalLocationSelector
            value={{ city: cityValue }}
            onChange={handleLocationChange}
            showCurrentLocationButton
          />

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Input
                label="Address Tag / Label"
                placeholder="e.g. Home, Office, Parents House"
                {...register('tag')}
                error={!!errors.tag}
                helperText={errors.tag?.message}
                fullWidth
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Input
                label="City / Region"
                placeholder="Selected City"
                {...register('city')}
                error={!!errors.city}
                helperText={errors.city?.message}
                fullWidth
              />
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
                label="Pincode / Postal Code"
                placeholder="Postal / Zipcode"
                {...register('pincode')}
                error={!!errors.pincode}
                helperText={errors.pincode?.message}
                fullWidth
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Input
                label="Nearby Landmark (Optional)"
                placeholder="e.g. Near City Center Mall"
                {...register('landmark')}
                fullWidth
              />
            </Grid2>
          </Grid2>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 800, px: 3, borderRadius: '10px' }}>
            Save Address
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddAddressDialog;
