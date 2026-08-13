import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface AvailabilityChipProps extends Omit<ChipProps, 'label'> {
  isAvailable: boolean;
}

export const AvailabilityChip: React.FC<AvailabilityChipProps> = ({
  isAvailable,
  size = 'small',
  ...rest
}) => {
  return (
    <Chip
      {...rest}
      icon={
        isAvailable ? (
          <FlashOnIcon sx={{ fontSize: '15px !important', color: '#FFF !important' }} />
        ) : (
          <AccessTimeIcon sx={{ fontSize: '15px !important' }} />
        )
      }
      label={isAvailable ? 'Available Today' : 'Slot Booked'}
      color={isAvailable ? 'success' : 'default'}
      size={size}
      sx={{
        fontWeight: 800,
        fontSize: '0.75rem',
        ...rest.sx,
      }}
    />
  );
};

export default AvailabilityChip;
