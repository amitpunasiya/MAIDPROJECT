import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';

import { AdminDataTable, ColumnDef } from '../../components';

export interface IWalletLog {
  id: string;
  userName: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  timestamp: string;
}

const MOCK_LOGS: IWalletLog[] = [
  { id: 'w-1', userName: 'Ananya Roy', type: 'CREDIT', amount: 1000, description: 'UPI Wallet Top-up', timestamp: '2026-08-07 09:00 AM' },
  { id: 'w-2', userName: 'Vikram Malhotra', type: 'DEBIT', amount: 650, description: '1-Click Booking Payment BK-948202', timestamp: '2026-08-07 11:30 AM' },
  { id: 'w-3', userName: 'Priya Nair', type: 'CREDIT', amount: 200, description: 'Referral Bonus Cashback', timestamp: '2026-08-06 02:00 PM' },
];

export const AdminWallet: React.FC = () => {
  const [logs] = useState<IWalletLog[]>(MOCK_LOGS);

  const columns: ColumnDef<IWalletLog>[] = [
    { id: 'userName', label: 'USER NAME' },
    { id: 'type', label: 'TRANSACTION TYPE' },
    { id: 'amount', label: 'AMOUNT (₹)', render: (r) => `₹${r.amount}` },
    { id: 'description', label: 'DESCRIPTION' },
    { id: 'timestamp', label: 'TIMESTAMP' },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Digital Wallet Auditing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor wallet recharges, cashbacks, debits, and balance ledgers.
        </Typography>
      </Box>

      <AdminDataTable title="System Digital Wallet Audit Log" columns={columns} data={logs} />
    </Box>
  );
};

export default AdminWallet;
