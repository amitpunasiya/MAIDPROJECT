import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface ICouponOption {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description: string;
  minAmount?: number;
}

interface CouponSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onApplyCoupon: (code: string) => void;
  activeCoupons?: ICouponOption[];
  appliedCode?: string;
}

const DEFAULT_COUPONS: ICouponOption[] = [
  {
    code: 'FIRST50',
    discountType: 'percentage',
    discountValue: 15,
    description: 'Get 15% instant discount on your first maid or cook booking!',
    minAmount: 300,
  },
  {
    code: 'MAIDOFF100',
    discountType: 'fixed',
    discountValue: 100,
    description: 'Flat ₹100 OFF on any housekeeping or deep cleaning service.',
    minAmount: 500,
  },
  {
    code: 'COOKSPECIAL',
    discountType: 'percentage',
    discountValue: 20,
    description: 'Get 20% OFF up to ₹250 on premium home chef bookings.',
    minAmount: 600,
  },
];

export const CouponSelectorModal: React.FC<CouponSelectorModalProps> = ({
  open,
  onClose,
  onApplyCoupon,
  activeCoupons = DEFAULT_COUPONS,
  appliedCode,
}) => {
  const [customCode, setCustomCode] = useState('');

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCode.trim()) return;
    onApplyCoupon(customCode.trim().toUpperCase());
    onClose();
  };

  const handleSelectCoupon = (code: string) => {
    onApplyCoupon(code);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOfferIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Apply Promo Code / Coupon
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Custom Coupon Input */}
        <Box component="form" onSubmit={handleApplyCustom} sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            placeholder="Enter Promo Code"
            size="small"
            fullWidth
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!customCode.trim()}
            sx={{ borderRadius: '10px', px: 2.5, fontWeight: 700 }}
          >
            Apply
          </Button>
        </Box>

        <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
          Available Coupons for You
        </Typography>

        <Stack spacing={2} sx={{ mt: 1.5 }}>
          {activeCoupons.map((coupon) => {
            const isApplied = appliedCode?.toUpperCase() === coupon.code.toUpperCase();

            return (
              <Paper
                key={coupon.code}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: isApplied ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  bgcolor: isApplied ? '#EFF6FF' : '#F8FAFC',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={coupon.code}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.75rem', borderRadius: '6px' }}
                  />
                  <Button
                    size="small"
                    variant={isApplied ? 'outlined' : 'contained'}
                    color={isApplied ? 'success' : 'primary'}
                    onClick={() => handleSelectCoupon(coupon.code)}
                    startIcon={isApplied ? <CheckCircleIcon fontSize="small" /> : undefined}
                    sx={{ borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem' }}
                  >
                    {isApplied ? 'Applied' : 'Apply Coupon'}
                  </Button>
                </Box>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% Instant Discount`
                    : `Flat ₹${coupon.discountValue} OFF`}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {coupon.description}
                </Typography>
              </Paper>
            );
          })}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default CouponSelectorModal;
