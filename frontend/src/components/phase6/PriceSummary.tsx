import React from 'react';
import { Paper, Box, Typography, Divider } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';

interface PriceSummaryProps {
  serviceCharge: number;
  platformFee: number;
  gstAmount: number;
  discountAmount: number;
  grandTotal: number;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  serviceCharge,
  platformFee,
  gstAmount,
  discountAmount,
  grandTotal,
}) => {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ReceiptIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          Order Price Summary
        </Typography>
      </Box>

      <StackSpacing serviceCharge={serviceCharge} platformFee={platformFee} gstAmount={gstAmount} discountAmount={discountAmount} />

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={800}>
          Grand Total
        </Typography>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          ₹{grandTotal}
        </Typography>
      </Box>
    </Paper>
  );
};

const StackSpacing: React.FC<{ serviceCharge: number; platformFee: number; gstAmount: number; discountAmount: number }> = ({
  serviceCharge,
  platformFee,
  gstAmount,
  discountAmount,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">Staff Service Charge</Typography>
      <Typography variant="body2" fontWeight={700}>₹{serviceCharge}</Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">Platform Fee</Typography>
      <Typography variant="body2" fontWeight={700}>₹{platformFee}</Typography>
    </Box>
    {discountAmount > 0 && (
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="success.main" fontWeight={700}>Discount Applied</Typography>
        <Typography variant="body2" color="success.main" fontWeight={800}>-₹{discountAmount}</Typography>
      </Box>
    )}
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">GST & Govt Taxes (18%)</Typography>
      <Typography variant="body2" fontWeight={700}>₹{gstAmount}</Typography>
    </Box>
  </Box>
);

export default PriceSummary;
