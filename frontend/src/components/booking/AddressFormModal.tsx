import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Grid2,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import GlobalLocationSelector, { LocationSelectionValue } from '../common/GlobalLocationSelector';

export interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaveAddress: (data: AddressFormData) => void;
  initialValues?: Partial<AddressFormData>;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  open,
  onClose,
  onSaveAddress,
  initialValues,
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    street: initialValues?.street || '',
    city: initialValues?.city || 'Bengaluru',
    state: initialValues?.state || 'Karnataka',
    zipCode: initialValues?.zipCode || '560102',
    country: initialValues?.country || 'India',
  });

  const handleLocationChange = (val: LocationSelectionValue) => {
    setFormData((prev) => ({
      ...prev,
      city: val.city || prev.city,
      state: val.state || prev.state,
      country: val.country || prev.country,
      zipCode: val.pincode || prev.zipCode,
      street: val.street ? (prev.street ? `${prev.street}, ${val.street}` : val.street) : prev.street,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street.trim() || !formData.city.trim()) return;
    onSaveAddress(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Add Delivery & Service Address
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Worldwide Location Selector & Use Current Location */}
          <GlobalLocationSelector
            value={{
              city: formData.city,
              state: formData.state,
              country: formData.country,
              pincode: formData.zipCode,
            }}
            onChange={handleLocationChange}
            showCurrentLocationButton
          />

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="House/Flat No, Building Name & Street"
                fullWidth
                required
                multiline
                rows={2}
                value={formData.street}
                onChange={(e) => setFormData((prev) => ({ ...prev, street: e.target.value }))}
                placeholder="e.g. Flat 402, Sunshine Heights, HSR Sector 2"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Postal / Zip Code"
                fullWidth
                required
                value={formData.zipCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
              />
            </Grid2>
          </Grid2>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ fontWeight: 700, px: 3, borderRadius: '10px' }}>
            Save & Select Address
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddressFormModal;
