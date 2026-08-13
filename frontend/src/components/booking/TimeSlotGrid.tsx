import React from 'react';
import { Box, Typography, Paper, Grid2, Chip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import NightsStayIcon from '@mui/icons-material/NightsStay';

interface TimeSlotGridProps {
  selectedSlot: string;
  onSelectSlot?: (slot: string) => void;
  onSlotSelect?: (slot: string) => void;
}

export interface ITimeSlotSection {
  group: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  icon: React.ReactElement;
  slots: { label: string; available: boolean }[];
}

export const TIME_SLOTS_DATA: ITimeSlotSection[] = [
  {
    group: 'Morning',
    icon: <WbSunnyIcon color="warning" fontSize="small" />,
    slots: [
      { label: '07:00 AM - 09:00 AM (Morning)', available: true },
      { label: '09:30 AM - 11:30 AM (Late Morning)', available: true },
    ],
  },
  {
    group: 'Afternoon',
    icon: <WbTwilightIcon color="secondary" fontSize="small" />,
    slots: [
      { label: '12:00 PM - 02:00 PM (Afternoon)', available: true },
      { label: '02:30 PM - 04:30 PM (Late Afternoon)', available: false },
    ],
  },
  {
    group: 'Evening',
    icon: <NightsStayIcon color="primary" fontSize="small" />,
    slots: [
      { label: '05:00 PM - 07:00 PM (Evening)', available: true },
      { label: '07:30 PM - 09:30 PM (Night)', available: true },
    ],
  },
];

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  selectedSlot,
  onSelectSlot,
  onSlotSelect,
}) => {
  const handleSelect = (slot: string) => {
    if (onSelectSlot) onSelectSlot(slot);
    else if (onSlotSelect) onSlotSelect(slot);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccessTimeIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          Select Preferred Time Slot
        </Typography>
      </Box>

      {TIME_SLOTS_DATA.map((section) => (
        <Box key={section.group} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            {section.icon}
            <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
              {section.group} Slots
            </Typography>
          </Box>

          <Grid2 container spacing={1.5}>
            {section.slots.map((slot) => {
              const isSelected = selectedSlot === slot.label;
              return (
                <Grid2 key={slot.label} size={{ xs: 12, sm: 6 }}>
                  <Paper
                    elevation={0}
                    onClick={() => slot.available && handleSelect(slot.label)}
                    sx={{
                      p: 1.8,
                      borderRadius: 3,
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      bgcolor: isSelected ? '#EFF6FF' : slot.available ? '#FFF' : '#F8FAFC',
                      cursor: slot.available ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      opacity: slot.available ? 1 : 0.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight={isSelected ? 800 : 600} color={isSelected ? 'primary.main' : 'text.primary'}>
                      {slot.label}
                    </Typography>
                    {!slot.available && <Chip label="Booked" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />}
                  </Paper>
                </Grid2>
              );
            })}
          </Grid2>
        </Box>
      ))}
    </Paper>
  );
};

export default TimeSlotGrid;
