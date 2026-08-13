import React, { useRef, useEffect } from 'react';
import { Box, TextField } from '@mui/material';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
  error?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  error = false,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length);
  }, [length]);

  const otpArray = value.padEnd(length, '').split('').slice(0, length);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newOtpArray = [...otpArray];
    // Take the last character entered
    newOtpArray[index] = val.substring(val.length - 1);
    const newOtp = newOtpArray.join('');
    onChange(newOtp);

    // Auto-focus next box if digit entered
    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpArray[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d+$/.test(pastedData)) {
      const pastedDigits = pastedData.slice(0, length);
      onChange(pastedDigits);
      const focusIndex = Math.min(pastedDigits.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, justifyContent: 'center', my: 2 }}>
      {Array.from({ length }).map((_, index) => (
        <TextField
          key={index}
          inputRef={(el) => (inputsRef.current[index] = el)}
          value={otpArray[index] || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, index)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          error={error}
          slotProps={{
            htmlInput: {
              maxLength: 1,
              style: {
                textAlign: 'center',
                fontSize: '1.4rem',
                fontWeight: '800',
                padding: '12px 0',
                width: '42px',
              },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: '#F8FAFC',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#2563EB',
              },
              '&.Mui-focused': {
                bgcolor: '#FFFFFF',
                borderColor: '#2563EB',
                boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default OtpInput;
