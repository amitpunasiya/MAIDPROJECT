import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import HomeIcon from '@mui/icons-material/Home';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

interface TrackingTimelineProps {
  currentStepIndex?: number; // 0 = Accepted, 1 = On the way, 2 = Arrived, 3 = Started, 4 = Completed
  steps?: any[];
  status?: string;
}

const trackingSteps = [
  { label: 'Provider Accepted', icon: <CheckCircleIcon /> },
  { label: 'Provider On The Way', icon: <DirectionsRunIcon /> },
  { label: 'Provider Arrived', icon: <HomeIcon /> },
  { label: 'Service Started', icon: <PlayCircleFilledIcon /> },
  { label: 'Service Completed', icon: <TaskAltIcon /> },
];

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ currentStepIndex = 1 }) => {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
        Live Service Status & Steps
      </Typography>

      <Stepper activeStep={currentStepIndex} alternativeLabel>
        {trackingSteps.map((step, idx) => (
          <Step key={step.label} completed={idx <= currentStepIndex}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: idx <= currentStepIndex ? '#2563EB' : '#E2E8F0',
                    color: idx <= currentStepIndex ? '#FFFFFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    boxShadow: idx === currentStepIndex ? '0 0 0 6px rgba(37, 99, 235, 0.2)' : 'none',
                  }}
                >
                  {step.icon}
                </Box>
              )}
            >
              <Typography variant="caption" fontWeight={idx <= currentStepIndex ? 800 : 500} color={idx <= currentStepIndex ? 'text.primary' : 'text.secondary'}>
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

export default TrackingTimeline;
