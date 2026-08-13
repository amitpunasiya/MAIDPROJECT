import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { setThemeMode } from '../../store/uiSlice';

export const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.ui.themeMode);

  const cycleTheme = () => {
    if (themeMode === 'light') dispatch(setThemeMode('dark'));
    else if (themeMode === 'dark') dispatch(setThemeMode('system'));
    else dispatch(setThemeMode('light'));
  };

  return (
    <Tooltip title={`Current Mode: ${themeMode.toUpperCase()} (Click to toggle)`}>
      <IconButton onClick={cycleTheme} color="inherit" sx={{ border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '10px' }}>
        {themeMode === 'light' && <LightModeIcon color="warning" fontSize="small" />}
        {themeMode === 'dark' && <DarkModeIcon color="primary" fontSize="small" />}
        {themeMode === 'system' && <SettingsBrightnessIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
