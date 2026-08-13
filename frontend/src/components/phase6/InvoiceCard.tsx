import React from 'react';
import { Paper, Box, Typography, Button as MuiButton, Chip, Divider } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VerifiedIcon from '@mui/icons-material/Verified';

interface InvoiceCardProps {
  bookingId: string;
  paymentId: string;
  amount: number;
  date: string;
  providerName: string;
  onDownload: () => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  bookingId,
  paymentId,
  amount,
  date,
  providerName,
  onDownload,
}) => {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            GST Tax Invoice
          </Typography>
          <VerifiedIcon color="primary" fontSize="small" />
        </Box>
        <Chip label="PAID" color="success" size="small" sx={{ fontWeight: 800 }} />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          <b>Booking ID:</b> #{bookingId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <b>Payment Ref:</b> {paymentId}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <b>Assigned Staff:</b> {providerName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <b>Invoice Date:</b> {date}
        </Typography>
        <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ mt: 1 }}>
          Total Paid: ₹{amount}
        </Typography>
      </Box>

      <MuiButton
        variant="contained"
        color="primary"
        fullWidth
        startIcon={<DownloadIcon />}
        onClick={onDownload}
        sx={{ borderRadius: '10px', fontWeight: 800 }}
      >
        Download PDF Invoice
      </MuiButton>
    </Paper>
  );
};

export default InvoiceCard;
