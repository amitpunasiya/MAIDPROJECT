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
  const themeMode = useAppSelector((state) => state.ui.themeMode);
  const [systemPrefersDark, setSystemPrefersDark] = React.useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const activeMode = useMemo(() => {
    if (themeMode === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemPrefersDark]);

  const activeTheme = useMemo(() => getAppTheme(activeMode), [activeMode]);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Seo />
      <OfflineBanner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
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
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
