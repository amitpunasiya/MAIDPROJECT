import React from 'react';
import { Stepper, Step, StepLabel, Paper } from '@mui/material';

interface BookingStepperProps {
  activeStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  'Select Service',
  'Select Provider',
  'Select Address',
  'Date & Time Slot',
  'Review & Coupon',
];

export const BookingStepper: React.FC<BookingStepperProps> = ({ activeStep, onStepClick }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
        mb: 4,
      }}
    >
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, idx) => (
          <Step key={label} onClick={() => onStepClick && onStepClick(idx)} sx={{ cursor: onStepClick ? 'pointer' : 'default' }}>
            <StepLabel
              sx={{
                '& .MuiStepLabel-label': {
                  fontWeight: 700,
                  fontSize: { xs: '0.7rem', sm: '0.85rem' },
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

export default BookingStepper;
