import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid2,
  Stack,
  Chip,
  IconButton,
  Button as MuiButton,
  CircularProgress,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import MapIcon from '@mui/icons-material/Map';

export interface AddressItem {
  id: string;
  tag: string;
  fullAddress: string;
  city: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface AddressListProps {
  addresses: AddressItem[];
  isLoading?: boolean;
  onEdit?: (address: AddressItem) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onAddNew?: () => void;
}

export const AddressList: React.FC<AddressListProps> = ({
  addresses,
  isLoading = false,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
        <CircularProgress size={32} color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading saved addresses...
        </Typography>
      </Paper>
    );
  }

  if (addresses.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
        <MapIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" fontWeight={800} gutterBottom>
          No Saved Addresses
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You haven't saved any home or office addresses yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid2 container spacing={3}>
      {addresses.map((addr) => (
        <Grid2 key={addr.id} size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: addr.isDefault ? '2px solid #2563EB' : '1px solid #E2E8F0',
              bgcolor: addr.isDefault ? '#EFF6FF' : '#FFFFFF',
              position: 'relative',
              transition: 'all 0.2s ease',
              '&:hover': { boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={addr.tag.toUpperCase()} color="primary" size="small" sx={{ fontWeight: 800 }} />
                {addr.isDefault && (
                  <Chip
                    icon={<StarIcon sx={{ fontSize: '0.8rem !important', color: '#FFF' }} />}
                    label="DEFAULT"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                )}
              </Box>

              <Stack direction="row" spacing={0.5}>
                {onEdit && (
                  <IconButton size="small" color="primary" onClick={() => onEdit(addr)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton size="small" color="error" onClick={() => onDelete(addr.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, my: 1.5 }}>
              <LocationOnIcon color="primary" sx={{ fontSize: 20, mt: 0.2 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  {addr.fullAddress}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {addr.city} - {addr.pincode} {addr.landmark ? `(Landmark: ${addr.landmark})` : ''}
                </Typography>
              </Box>
            </Box>

            {!addr.isDefault && onSetDefault && (
              <MuiButton
                size="small"
                onClick={() => onSetDefault(addr.id)}
                sx={{ mt: 1, fontWeight: 700, p: 0, textTransform: 'none' }}
              >
                Set as Default Address
              </MuiButton>
            )}
          </Paper>
        </Grid2>
      ))}
    </Grid2>
  );
};

export default AddressList;
