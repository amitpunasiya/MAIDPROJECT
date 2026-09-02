import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark' | string): Theme => {
  const isDark = mode === 'dark';
  const validMode: 'light' | 'dark' = isDark ? 'dark' : 'light';

  let customTheme = createTheme({
    palette: {
      mode: validMode,
      primary: {
        main: '#2563EB', // Vibrant Royal Indigo-Blue
        light: '#60A5FA',
        dark: '#1D4ED8',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#0D9488', // Elegant Emerald Teal
        light: '#2DD4BF',
        dark: '#0F766E',
        contrastText: '#FFFFFF',
      },
      accent: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
      },
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC',
        paper: isDark ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F8FAFC' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#475569',
        disabled: isDark ? '#64748B' : '#94A3B8',
      },
      divider: isDark ? '#334155' : '#E2E8F0',
    },
    typography: {
      fontFamily: [
        'Inter',
        'Plus Jakarta Sans',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
      h3: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3 },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollBehavior: 'smooth',
          },
          '*:focus-visible': {
            outline: '2px solid #2563EB',
            outlineOffset: '2px',
          },
          '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: isDark ? '#0F172A' : '#F1F5F9',
          },
          '::-webkit-scrollbar-thumb': {
            background: isDark ? '#334155' : '#CBD5E1',
            borderRadius: '4px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: isDark ? '#475569' : '#94A3B8',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            padding: '10px 22px',
            fontSize: '0.95rem',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark ? '0 4px 14px rgba(37, 99, 235, 0.4)' : '0 4px 12px rgba(37, 99, 235, 0.25)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            boxShadow: isDark ? '0 4px 20px -2px rgba(0, 0, 0, 0.3)' : '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark ? '0 12px 30px -4px rgba(0, 0, 0, 0.5)' : '0 12px 30px -4px rgba(15, 23, 42, 0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: '16px' },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              '& fieldset': {
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
              '&:hover fieldset': {
                borderColor: '#94A3B8',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2563EB',
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: '8px' },
        },
      },
    },
  });

  return responsiveFontSizes(customTheme);
};

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

export default getAppTheme('light');
