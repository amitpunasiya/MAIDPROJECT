import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { getAppTheme } from './theme/theme';
import AppRoutes from './routes/AppRoutes';
import { useAppSelector } from './hooks/useAppStore';
import {
  ErrorBoundary,
  OfflineBanner,
  GlobalSnackbar,
  GlobalModal,
  BackToTop,
  Seo,
  InstallPrompt,
} from './components';

const AppContent: React.FC = () => {
  const themeMode = useAppSelector((state) => state.ui?.themeMode || 'light');
  const [systemPrefersDark, setSystemPrefersDark] = React.useState<boolean>(
    () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches)
  );

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const activeMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return themeMode === 'dark' ? 'dark' : 'light';
  }, [themeMode, systemPrefersDark]);

  const activeTheme = useMemo(() => getAppTheme(activeMode), [activeMode]);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Seo />
      <OfflineBanner />
      <div id="recaptcha-container"></div>
      <AppRoutes />
      <GlobalSnackbar />
      <GlobalModal />
      <BackToTop />
      <InstallPrompt />
    </ThemeProvider>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
