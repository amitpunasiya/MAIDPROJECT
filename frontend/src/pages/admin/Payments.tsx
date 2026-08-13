import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';

import { AdminDataTable, ColumnDef } from '../../components';
import { adminApi, IAdminPayment } from '../../services/api';

const MOCK_PAYMENTS: IAdminPayment[] = [
  { id: 'pay-1', paymentId: 'pay_Nzk849201', bookingId: 'BK-948201', customerName: 'Ananya Roy', amount: 850, method: 'Razorpay UPI', status: 'SUCCESS', timestamp: '2026-08-07 10:15 AM' },
  { id: 'pay-2', paymentId: 'pay_Nzk849202', bookingId: 'BK-948202', customerName: 'Vikram Malhotra', amount: 650, method: 'MaidProject Wallet', status: 'SUCCESS', timestamp: '2026-08-07 11:30 AM' },
  { id: 'pay-3', paymentId: 'pay_Nzk849203', bookingId: 'BK-948203', customerName: 'Priya Nair', amount: 2400, method: 'Razorpay Card', status: 'SUCCESS', timestamp: '2026-08-06 04:20 PM' },
];

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<IAdminPayment[]>(MOCK_PAYMENTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getPayments();
        if (res.data?.items) setPayments(res.data.items);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const columns: ColumnDef<IAdminPayment>[] = [
    { id: 'paymentId', label: 'PAYMENT ID' },
    { id: 'bookingId', label: 'BOOKING ID' },
    { id: 'customerName', label: 'CUSTOMER' },
    { id: 'amount', label: 'AMOUNT (₹)', render: (r) => `₹${r.amount}` },
    { id: 'method', label: 'METHOD' },
    { id: 'timestamp', label: 'DATE & TIME' },
    {
      id: 'status',
      label: 'STATUS',
      render: (r) => <Chip label={r.status} color="success" size="small" sx={{ fontWeight: 800 }} />,
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Payment Gateway Ledger
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track Razorpay orders, wallet debits, refunds, and payment transactions.
        </Typography>
      </Box>

      <AdminDataTable title="Gateway Transactions Ledger" columns={columns} data={payments} isLoading={loading} />
    </Box>
  );
};

export default AdminPayments;
