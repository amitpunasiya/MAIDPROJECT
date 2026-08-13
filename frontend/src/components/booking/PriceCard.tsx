import React, { useState } from 'react';
import { Paper, Box, Typography, Divider, TextField, InputAdornment, Button as MuiButton, Chip } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DiscountIcon from '@mui/icons-material/Discount';

interface PriceCardProps {
  hourlyRate: number;
  workingHours: number;
  promoDiscount?: number;
  discountAmount?: number;
  couponCode?: string;
  onApplyPromo?: (code: string) => void;
  onOpenCouponModal?: () => void;
  onRemoveCoupon?: () => void;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  hourlyRate,
  workingHours,
  promoDiscount = 0,
  discountAmount = 0,
  couponCode,
  onApplyPromo,
  onOpenCouponModal,
  onRemoveCoupon,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const activeDiscount = discountAmount || promoDiscount;

  const serviceCharge = hourlyRate * workingHours;
  const platformFee = 49;
  const subtotal = Math.max(0, serviceCharge + platformFee - activeDiscount);
  const gstAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gstAmount;

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim() && onApplyPromo) {
      onApplyPromo(promoCode.trim().toUpperCase());
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ReceiptIcon color="primary" />
        <Typography variant="h6" fontWeight={800} color="text.primary">
          Payment Breakdown
        </Typography>
      </Box>

      {/* Itemized charges */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Base Rate (₹{hourlyRate}/hr × {workingHours} hrs)
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            ₹{serviceCharge}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Platform Booking Fee
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            ₹{platformFee}
          </Typography>
        </Box>

        {activeDiscount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'success.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DiscountIcon fontSize="small" />
              <Typography variant="body2" fontWeight={700}>
                Coupon Discount ({couponCode || 'PROMO'})
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={800}>
              -₹{activeDiscount}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            GST & Service Tax (18%)
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            ₹{gstAmount}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Total Amount */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={800} color="text.primary">
          Total Payable Amount
        </Typography>
        <Typography variant="h5" fontWeight={900} color="primary.main">
          ₹{totalAmount}
        </Typography>
      </Box>

      {/* Coupon Modal Trigger / Input */}
      {onOpenCouponModal ? (
        <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 3, border: '1px border #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {couponCode ? (
            <>
              <Chip label={couponCode} color="primary" size="small" sx={{ fontWeight: 800 }} />
              {onRemoveCoupon && (
                <MuiButton size="small" color="error" onClick={onRemoveCoupon} sx={{ fontWeight: 700 }}>
                  Remove
                </MuiButton>
              )}
            </>
          ) : (
            <MuiButton variant="outlined" fullWidth onClick={onOpenCouponModal} startIcon={<DiscountIcon />} sx={{ borderRadius: '10px', fontWeight: 800 }}>
              Select & Apply Coupon Code
            </MuiButton>
          )}
        </Box>
      ) : (
        <Box component="form" onSubmit={handlePromoSubmit} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Promo / Coupon Code"
            size="small"
            fullWidth
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <DiscountIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <MuiButton type="submit" variant="contained" color="primary" sx={{ borderRadius: '10px', px: 2.5, fontWeight: 700 }}>
            Apply
          </MuiButton>
        </Box>
      )}
    </Paper>
  );
};

export default PriceCard;
