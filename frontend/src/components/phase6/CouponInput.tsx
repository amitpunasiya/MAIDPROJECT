import React, { useState } from 'react';
import { Box, TextField, InputAdornment, Button as MuiButton } from '@mui/material';
import DiscountIcon from '@mui/icons-material/Discount';

interface CouponInputProps {
  onApply: (code: string) => void;
}

export const CouponInput: React.FC<CouponInputProps> = ({ onApply }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onApply(code.toUpperCase());
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Enter Promo Code (e.g. SAVE50)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
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
      <MuiButton type="submit" variant="contained" color="primary" sx={{ borderRadius: '10px', fontWeight: 800 }}>
        Apply
      </MuiButton>
    </Box>
  );
};

export default CouponInput;
