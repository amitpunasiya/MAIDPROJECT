import React from 'react';
import { Box, Typography } from '@mui/material';
import { AdminDataTable, ColumnDef } from '../../components';

export interface IReferralLog {
  id: string;
  referrerName: string;
  referredName: string;
  rewardAmount: number;
  status: string;
  date: string;
}

const MOCK_REFERRALS: IReferralLog[] = [
  { id: 'ref-1', referrerName: 'Ananya Roy', referredName: 'Siddharth Sen', rewardAmount: 200, status: 'REWARD_CLAIMED', date: '2026-08-05' },
  { id: 'ref-2', referrerName: 'Vikram Malhotra', referredName: 'Neha Sharma', rewardAmount: 200, status: 'REWARD_CLAIMED', date: '2026-08-04' },
];

export const AdminReferrals: React.FC = () => {
  const columns: ColumnDef<IReferralLog>[] = [
    { id: 'referrerName', label: 'REFERRER (SENDER)' },
    { id: 'referredName', label: 'REFERRED (FRIEND)' },
    { id: 'rewardAmount', label: 'REWARD (₹)', render: (r) => `₹${r.rewardAmount}` },
    { id: 'status', label: 'STATUS' },
    { id: 'date', label: 'DATE' },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Referral & Rewards Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track customer invite links, cashbacks, and viral growth rewards.
        </Typography>
      </Box>

      <AdminDataTable title="Referral Program Ledger" columns={columns} data={MOCK_REFERRALS} />
    </Box>
  );
};

export default AdminReferrals;
