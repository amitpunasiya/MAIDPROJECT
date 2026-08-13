import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Chip,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import HistoryIcon from '@mui/icons-material/History';

export interface IWalletTxItem {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  timestamp: string;
  status: 'Completed' | 'Pending' | 'FAILED';
}

export interface TransactionHistoryTableProps {
  transactions: IWalletTxItem[];
  isLoading?: boolean;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  transactions,
  isLoading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = transactions.length,
  onPageChange,
  onRowsPerPageChange,
}) => {
  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
        <CircularProgress size={32} color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading wallet transaction history...
        </Typography>
      </Paper>
    );
  }

  if (transactions.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
        <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
        <Typography variant="h6" fontWeight={800} gutterBottom>
          No Transactions Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You have not made any wallet top-ups or service payments yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={800}>
          Transaction History Log
        </Typography>
        <Chip label={`${totalCount} Log Entries`} size="small" color="primary" sx={{ fontWeight: 800 }} />
      </Box>

      <Stack spacing={0}>
        {transactions.map((tx) => (
          <Box
            key={tx.id}
            sx={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              p: 2.5,
              borderBottom: '1px solid #F1F5F9',
              transition: 'background 0.2s ease',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: tx.type === 'credit' ? '#DCFCE7' : '#FEE2E2',
                  color: tx.type === 'credit' ? 'success.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                }}
              >
                {tx.type === 'credit' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  {tx.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {tx.timestamp} • Status: <b>{tx.status}</b>
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle1" fontWeight={900} color={tx.type === 'credit' ? 'success.main' : 'text.primary'}>
              {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
            </Typography>
          </Box>
        ))}
      </Stack>

      {onPageChange && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          sx={{ borderTop: '1px solid #F1F5F9' }}
        />
      )}
    </Paper>
  );
};

export default TransactionHistoryTable;
