import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Error Boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', py: 8 }}>
          <Container maxWidth="sm">
            <Paper elevation={0} sx={{ p: 5, borderRadius: 5, border: '1px solid #E2E8F0', textAlign: 'center', bgcolor: '#FFF' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#FEE2E2',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: 48 }} />
              </Box>

              <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
                Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                An unexpected application error occurred. We have logged this event.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{ borderRadius: '12px', fontWeight: 800, px: 4, py: 1.2 }}
              >
                Reload Page
              </Button>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
