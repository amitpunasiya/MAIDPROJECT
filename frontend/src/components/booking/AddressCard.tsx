import React from 'react';
import { Paper, Box, Typography, Radio, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AddressCardProps {
  tag: string;
  fullAddress: string;
  city: string;
  pincode: string;
  isSelected: boolean;
  isDefault?: boolean;
  onSelect: () => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  tag,
  fullAddress,
  city,
  pincode,
  isSelected,
  isDefault,
  onSelect,
}) => {
  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 2.5,
        borderRadius: 3.5,
        border: `2px solid ${isSelected ? '#2563EB' : '#E2E8F0'}`,
        bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        position: 'relative',
        '&:hover': {
          borderColor: '#2563EB',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Radio checked={isSelected} size="small" color="primary" />
          <Chip label={tag} color="primary" size="small" sx={{ fontWeight: 800 }} />
          {isDefault && <Chip label="Default" color="success" size="small" sx={{ fontWeight: 800 }} />}
        </Box>
        {isSelected && <CheckCircleIcon color="primary" fontSize="small" />}
      </Box>

      <Box sx={{ pl: 4 }}>
        <Typography variant="body1" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.4, mb: 0.5 }}>
          {fullAddress}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          📍 {city} - {pincode}
        </Typography>
      </Box>
    </Paper>
  );
};

export default AddressCard;
