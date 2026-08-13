import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BuildIcon from '@mui/icons-material/Build';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { BookingStatus } from '../../types';

interface BookingTimelineProps {
  status: BookingStatus;
}

const timelineSteps = [
  { label: 'Booking Placed', icon: <CheckCircleIcon /> },
  { label: 'Staff Assigned', icon: <PersonPinIcon /> },
  { label: 'In Transit', icon: <DirectionsRunIcon /> },
  { label: 'Service In Progress', icon: <BuildIcon /> },
  { label: 'Completed', icon: <TaskAltIcon /> },
];

export const BookingTimeline: React.FC<BookingTimelineProps> = ({ status }) => {
  let activeIndex = 1; // Default Confirmed
  if (status === BookingStatus.IN_PROGRESS) activeIndex = 3;
  if (status === BookingStatus.COMPLETED) activeIndex = 5;
  if (status === BookingStatus.CANCELLED) activeIndex = 0;

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
        Live Service Status & Timeline
      </Typography>

      {status === BookingStatus.CANCELLED ? (
        <Box sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: 3, border: '1px solid #FCA5A5' }}>
          <Typography variant="subtitle2" fontWeight={800} color="error.main">
            Booking Cancelled
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This booking has been cancelled and any paid refund has been initiated to your source account.
          </Typography>
        </Box>
      ) : (
        <Stepper activeStep={activeIndex} alternativeLabel sx={{ mt: 2 }}>
          {timelineSteps.map((step, idx) => (
            <Step key={step.label} completed={idx < activeIndex}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: idx <= activeIndex ? '#2563EB' : '#E2E8F0',
                      color: idx <= activeIndex ? '#FFF' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Typography variant="caption" fontWeight={idx <= activeIndex ? 800 : 500} color={idx <= activeIndex ? 'text.primary' : 'text.secondary'}>
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
    </Paper>
  );
};

export default BookingTimeline;
