import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface DatePickerProps {
  selectedDate: string;
  onSelectDate?: (date: string) => void;
  onDateChange?: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelectDate, onDateChange }) => {
  const handleSelect = (date: string) => {
    if (onSelectDate) onSelectDate(date);
    else if (onDateChange) onDateChange(date);
  };

  // Generate next 7 dates
  const today = new Date();
  const dateList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isoDate = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
    const isAvailable = i !== 3; // Day 3 mocked
    return { isoDate, dayName, formatted, isAvailable };
  });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CalendarMonthIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          Select Booking Date
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
        {dateList.map((item) => {
          const isSelected = selectedDate === item.isoDate;
          return (
            <Paper
              key={item.isoDate}
              elevation={0}
              onClick={() => item.isAvailable && handleSelect(item.isoDate)}
              sx={{
                p: 2,
                minWidth: 90,
                textAlign: 'center',
                borderRadius: 3,
                border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                bgcolor: isSelected ? '#EFF6FF' : item.isAvailable ? '#FFF' : '#F1F5F9',
                cursor: item.isAvailable ? 'pointer' : 'not-allowed',
                opacity: item.isAvailable ? 1 : 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                {item.dayName}
              </Typography>
              <Typography variant="subtitle1" fontWeight={800} color={isSelected ? 'primary.main' : 'text.primary'}>
                {item.formatted}
              </Typography>
              {!item.isAvailable && (
                <Chip label="Full" size="small" color="error" sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }} />
              )}
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
};

export default DatePicker;
