import React from 'react';
import { Box } from '@mui/material';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { MyBookings } from '../MyBookings';

export const DashboardBookings: React.FC = () => {
  return (
    <Box>
      <DashboardHeader title="My Bookings & Receipts" subtitle="View active visits, cancel upcoming bookings, or download invoices." />
      <MyBookings />
    </Box>
  );
};

export default DashboardBookings;
