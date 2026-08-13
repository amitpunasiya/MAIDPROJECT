import React from 'react';
import { Paper, Box, Typography, Divider } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';

interface PriceBreakdownProps {
  hourlyRate: number;
  workingHours: number;
  couponDiscount?: number;
  discountAmount?: number;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  hourlyRate,
  workingHours,
  couponDiscount = 0,
  discountAmount = 0,
}) => {
  const activeDiscount = discountAmount || couponDiscount;

  const serviceCharge = hourlyRate * workingHours;
  const platformFee = 49;
  const subtotal = Math.max(0, serviceCharge + platformFee - activeDiscount);
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ReceiptIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          Price & Tax Breakdown
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Staff Service Charge (₹{hourlyRate} × {workingHours} hrs)
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            ₹{serviceCharge}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Platform Convenience Fee
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            ₹{platformFee}
          </Typography>
        </Box>

        {activeDiscount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="success.main" fontWeight={700}>
              Coupon Discount Applied
            </Typography>
            <Typography variant="body2" fontWeight={800} color="success.main">
              -₹{activeDiscount}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            GST & Taxes (18%)
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            ₹{gstAmount}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={800}>
          Grand Total Payable
        </Typography>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          ₹{grandTotal}
        </Typography>
      </Box>
    </Paper>
  );
};

export default PriceBreakdown;
