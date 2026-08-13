import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid2 } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { getWalletBalance, getWalletTransactions, rechargeWallet } from '../../store/walletSlice';
import { WalletBalanceCard, TransactionHistoryTable, OfferCard, AddMoneyDialog } from '../../components';

export const WalletPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { balance, transactions, offers, loading, rechargeLoading } = useAppSelector((state) => state.wallet);

  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    void dispatch(getWalletBalance());
    void dispatch(getWalletTransactions({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleAddMoney = async (amount: number) => {
    await dispatch(rechargeWallet({ amount, method: 'upi' }));
    setAddMoneyOpen(false);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight={800} color="text.primary">
            MaidProject Digital Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Enjoy zero-fee instant checkout, exclusive cashback vouchers, and quick refunds.
          </Typography>
        </Box>

        {/* Balance Header Card */}
        <Box sx={{ mb: 5 }}>
          <WalletBalanceCard
            balance={balance}
            onAddMoney={() => setAddMoneyOpen(true)}
            isLoading={loading || rechargeLoading}
          />
        </Box>

        {/* Wallet Offers */}
        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
          Exclusive Wallet Cashback Vouchers
        </Typography>
        <Grid2 container spacing={3} sx={{ mb: 5 }}>
          {offers.map((o) => (
            <Grid2 key={o.code} size={{ xs: 12, sm: 6 }}>
              <OfferCard
                code={o.code}
                discount={`₹${o.discount} Cashback`}
                description={o.desc}
                validTill="31 Aug 2026"
                tag="WALLET OFFER"
                onApply={(code) => alert(`Code ${code} copied to clipboard!`)}
              />
            </Grid2>
          ))}
        </Grid2>

        {/* Transaction History Log Table */}
        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
          Recent Wallet Transactions
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

        {/* Add Money Modal */}
        <AddMoneyDialog
          open={addMoneyOpen}
          onClose={() => setAddMoneyOpen(false)}
          onAddMoney={handleAddMoney}
        />
      </Container>
    </Box>
  );
};

export default WalletPage;
