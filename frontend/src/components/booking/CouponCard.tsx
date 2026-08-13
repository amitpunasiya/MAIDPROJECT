import React, { useState } from 'react';
import { Paper, Box, Typography, TextField, InputAdornment, Button as MuiButton, Chip } from '@mui/material';
import DiscountIcon from '@mui/icons-material/Discount';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface CouponCardProps {
  appliedCoupon?: string;
  onApplyCoupon: (code: string, discount: number) => void;
}

const AVAILABLE_COUPONS = [
  { code: 'WELCOME100', discount: 100, desc: 'Flat ₹100 OFF on your first booking' },
  { code: 'SAVE50', discount: 50, desc: 'Instant ₹50 OFF on any service' },
  { code: 'FESTIVE200', discount: 200, desc: 'Flat ₹200 OFF on bookings above ₹1,000' },
];

export const CouponCard: React.FC<CouponCardProps> = ({ appliedCoupon, onApplyCoupon }) => {
  const [inputCode, setInputCode] = useState('');

  const handleApply = (codeToApply: string, discountAmount: number) => {
    onApplyCoupon(codeToApply.toUpperCase(), discountAmount);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <DiscountIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          Apply Offers & Promo Coupons
        </Typography>
      </Box>

      {/* Manual Input */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Enter Promo Code"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <DiscountIcon color="primary" fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
        />
        <MuiButton
          variant="contained"
          onClick={() => handleApply(inputCode, 50)}
          sx={{ borderRadius: '10px', fontWeight: 700 }}
        >
          Apply
        </MuiButton>
      </Box>

      {/* Suggested Vouchers */}
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1.5 }}>
        AVAILABLE COUPONS FOR YOU:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {AVAILABLE_COUPONS.map((c) => {
          const isApplied = appliedCoupon === c.code;
          return (
            <Paper
              key={c.code}
              elevation={0}
              sx={{
                p: 1.5,
                px: 2,
                borderRadius: 3,
                border: `1.5px dashed ${isApplied ? '#16A34A' : '#2563EB'}`,
                bgcolor: isApplied ? '#DCFCE7' : '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800} color={isApplied ? 'success.main' : 'primary.main'}>
                    {c.code}
                  </Typography>
                  {isApplied && <Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />} label="Applied" color="success" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {c.desc}
                </Typography>
              </Box>

              <MuiButton
                size="small"
                variant={isApplied ? 'contained' : 'outlined'}
                color={isApplied ? 'success' : 'primary'}
                onClick={() => handleApply(c.code, c.discount)}
                sx={{ borderRadius: '8px', fontWeight: 800, textTransform: 'none' }}
              >
                {isApplied ? 'Applied' : 'Apply Coupon'}
              </MuiButton>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
};

export default CouponCard;
