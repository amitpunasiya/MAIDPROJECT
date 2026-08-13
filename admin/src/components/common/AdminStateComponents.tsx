import React from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Pagination } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export interface AdminLoadingProps {
  message?: string;
}

export const AdminLoading: React.FC<AdminLoadingProps> = ({ message = 'Loading data...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
    <CircularProgress size={36} color="primary" />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export interface AdminErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const AdminError: React.FC<AdminErrorProps> = ({ message = 'Failed to load data from server.', onRetry }) => (
  <Box sx={{ py: 3 }}>
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  </Box>
);

export interface AdminEmptyProps {
  title?: string;
  description?: string;
}

export const AdminEmpty: React.FC<AdminEmptyProps> = ({
  title = 'No Records Found',
  description = 'There are no items matching your request or filter criteria.',
}) => (
  <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
    <InboxIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
      {description}
    </Typography>
  </Box>
);

export interface AdminPaginationProps {
  page: number;
  count: number;
  onChange: (page: number) => void;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({ page, count, onChange }) => {
  if (count <= 1) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
      <Pagination
        page={page}
        count={count}
        onChange={(_e, newPage) => onChange(newPage)}
        color="primary"
        shape="rounded"
      />
    </Box>
  );
};
