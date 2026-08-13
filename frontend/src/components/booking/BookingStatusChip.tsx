import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { BookingStatus } from '../../types';

interface BookingStatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  status: BookingStatus;
}

export const BookingStatusChip: React.FC<BookingStatusChipProps> = ({
  status,
  size = 'small',
  ...rest
}) => {
  let label = 'Upcoming';
  let color: 'success' | 'info' | 'error' | 'warning' | 'default' = 'info';
  let icon: React.ReactElement = <EventAvailableIcon fontSize="small" />;
  const statusStr = (status || '').toString().toLowerCase();

  if (statusStr === 'confirmed' || statusStr === 'accepted') {
    label = 'Booking Confirmed';
    color = 'success';
    icon = <CheckCircleIcon fontSize="small" />;
  } else if (statusStr === 'completed') {
    label = 'Completed';
    color = 'success';
    icon = <CheckCircleIcon fontSize="small" />;
  } else if (statusStr === 'cancelled' || statusStr === 'refunded' || statusStr === 'rejected') {
    label = statusStr === 'rejected' ? 'Request Declined' : 'Cancelled';
    color = 'error';
    icon = <CancelIcon fontSize="small" />;
  } else if (statusStr === 'pending') {
    label = 'Waiting for Confirmation';
    color = 'warning';
    icon = <AccessTimeIcon fontSize="small" />;
  } else if (statusStr === 'in_progress') {
    label = 'Service In Progress';
    color = 'info';
    icon = <AccessTimeIcon fontSize="small" />;
  } else {
    label = status;
  }

  return (
    <Chip
      {...rest}
      icon={icon}
      label={label}
      color={color}
      size={size}
      sx={{
        fontWeight: 800,
        borderRadius: '8px',
        ...rest.sx,
      }}
    />
  );
};

export default BookingStatusChip;
