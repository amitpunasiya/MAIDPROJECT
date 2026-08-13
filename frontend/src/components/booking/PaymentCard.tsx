import React from 'react';
import {
  Paper,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid2,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';

interface PaymentCardProps {
  selectedMethod: 'upi' | 'card' | 'debit' | 'cash';
  onMethodChange?: (method: 'upi' | 'card' | 'debit' | 'cash') => void;
  onSelectMethod?: (method: 'upi' | 'card' | 'debit' | 'cash') => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  selectedMethod,
  onMethodChange,
  onSelectMethod,
}) => {
  const handleChange = (val: 'upi' | 'card' | 'debit' | 'cash') => {
    if (onMethodChange) onMethodChange(val);
    else if (onSelectMethod) onSelectMethod(val);
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
        <PaymentIcon color="primary" />
        <Typography variant="h6" fontWeight={800} color="text.primary">
          Select Payment Method
        </Typography>
      </Box>

      <RadioGroup
        value={selectedMethod}
        onChange={(e) => handleChange(e.target.value as any)}
      >
        <Grid2 container spacing={2}>
          {/* UPI */}
          <Grid2 size={{ xs: 12 }}>
            <Paper
              elevation={0}
              onClick={() => handleChange('upi')}
              sx={{
                p: 2,
                borderRadius: 3,
                border: selectedMethod === 'upi' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                bgcolor: selectedMethod === 'upi' ? '#EFF6FF' : '#F8FAFC',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <QrCodeScannerIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    UPI (Google Pay, PhonePe, Paytm, BHIM)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Instant 0% fee payment confirmation
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel value="upi" control={<Radio size="small" />} label="" sx={{ m: 0 }} />
            </Paper>
          </Grid2>

          {/* Cards */}
          <Grid2 size={{ xs: 12 }}>
            <Paper
              elevation={0}
              onClick={() => handleChange('card')}
              sx={{
                p: 2,
                borderRadius: 3,
                border: selectedMethod === 'card' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                bgcolor: selectedMethod === 'card' ? '#EFF6FF' : '#F8FAFC',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CreditCardIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    Credit / Debit Card / Net Banking
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Visa, Mastercard, RuPay & Corporate Cards
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel value="card" control={<Radio size="small" />} label="" sx={{ m: 0 }} />
            </Paper>
          </Grid2>

          {/* Cash */}
          <Grid2 size={{ xs: 12 }}>
            <Paper
              elevation={0}
              onClick={() => handleChange('cash')}
              sx={{
                p: 2,
                borderRadius: 3,
                border: selectedMethod === 'cash' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                bgcolor: selectedMethod === 'cash' ? '#EFF6FF' : '#F8FAFC',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocalAtmIcon color="success" />
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    Pay Cash After Service Completion
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pay directly to partner after service completion
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel value="cash" control={<Radio size="small" />} label="" sx={{ m: 0 }} />
            </Paper>
          </Grid2>
        </Grid2>
      </RadioGroup>
    </Paper>
  );
};

export default PaymentCard;
