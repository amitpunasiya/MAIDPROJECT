import React, { useState, useEffect } from 'react';
import { Box, Grid2, Paper, Typography } from '@mui/material';
import DiscountIcon from '@mui/icons-material/Discount';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { getWalletBalance, getWalletTransactions, rechargeWallet } from '../../store/walletSlice';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import AddMoneyDialog from '../../components/dashboard/AddMoneyDialog';
import WalletBalanceCard from '../../components/wallet/WalletBalanceCard';
import TransactionHistoryTable from '../../components/wallet/TransactionHistoryTable';

export const DashboardWallet: React.FC = () => {
  const dispatch = useAppDispatch();
  const { balance, transactions, loading, rechargeLoading } = useAppSelector((state) => state.wallet);

  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    void dispatch(getWalletBalance());
    void dispatch(getWalletTransactions({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleAddMoney = async (amt: number) => {
    await dispatch(rechargeWallet({ amount: amt, method: 'upi' }));
    setAddMoneyOpen(false);
  };

  return (
    <Box>
      <DashboardHeader title="My MaidProject Wallet" subtitle="Manage credits, transaction logs, and discount coupons." />

      {/* Main Balance Card Component */}
      <Box sx={{ mb: 4 }}>
        <WalletBalanceCard
          balance={balance}
          onAddMoney={() => setAddMoneyOpen(true)}
          isLoading={loading || rechargeLoading}
        />
      </Box>

      {/* Promo Coupons Section */}
      <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
        Available Promo Coupons & Vouchers
      </Typography>
      <Grid2 container spacing={2.5} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px dashed #2563EB', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', gap: 2 }}>
            <DiscountIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                WELCOME100
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Get ₹100 Flat OFF on your first Cook or Maid booking.
              </Typography>
            </Box>
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px dashed #0D9488', bgcolor: '#F0FDF4', display: 'flex', alignItems: 'center', gap: 2 }}>
            <DiscountIcon color="secondary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="secondary.main">
                FESTIVE200
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Get ₹200 OFF on deep house cleaning & party chef orders.
              </Typography>
            </Box>
          </Paper>
        </Grid2>
      </Grid2>

      {/* Transaction History Log Table */}
      <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
        Transaction Log History
      </Typography>
      <TransactionHistoryTable
        transactions={transactions}
        isLoading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={transactions.length}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      {/* Add Money Dialog */}
      <AddMoneyDialog
        open={addMoneyOpen}
        onClose={() => setAddMoneyOpen(false)}
        onAddMoney={handleAddMoney}
      />
    </Box>
  );
};

export default DashboardWallet;
