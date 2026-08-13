import React, { useState } from 'react';
import { Box, Typography, Chip, Button as MuiButton, TextField, Paper, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { AdminDataTable, ColumnDef } from '../../components';
import { IAdminCoupon } from '../../services/api';

const MOCK_COUPONS: IAdminCoupon[] = [
  { id: 'cp-1', code: 'MAID20', discountAmount: 200, minOrderValue: 800, usageCount: 142, status: 'active' },
  { id: 'cp-2', code: 'COOK50', discountAmount: 150, minOrderValue: 600, usageCount: 89, status: 'active' },
  { id: 'cp-3', code: 'FESTIVE25', discountAmount: 250, minOrderValue: 1000, usageCount: 210, status: 'active' },
];

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<IAdminCoupon[]>(MOCK_COUPONS);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');

  const handleAddCoupon = () => {
    if (newCode.trim() && newDiscount) {
      const created: IAdminCoupon = {
        id: `cp-${Date.now()}`,
        code: newCode.trim().toUpperCase(),
        discountAmount: Number(newDiscount),
        minOrderValue: 500,
        usageCount: 0,
        status: 'active',
      };
      setCoupons([created, ...coupons]);
      setNewCode('');
      setNewDiscount('');
    }
  };

  const columns: ColumnDef<IAdminCoupon>[] = [
    { id: 'code', label: 'PROMO CODE', render: (r) => <Chip label={r.code} color="primary" sx={{ fontWeight: 800 }} /> },
    { id: 'discountAmount', label: 'DISCOUNT (₹)', render: (r) => `₹${r.discountAmount} OFF` },
    { id: 'minOrderValue', label: 'MIN ORDER (₹)', render: (r) => `₹${r.minOrderValue}` },
    { id: 'usageCount', label: 'USAGE COUNT', render: (r) => `${r.usageCount} times` },
    { id: 'status', label: 'STATUS', render: (r) => <Chip label={r.status.toUpperCase()} color="success" size="small" /> },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Coupon & Promo Code Engine
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create promotional discount codes, manage min order values, and track redemption statistics.
        </Typography>
      </Box>

      {/* Quick Add Form */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', mb: 3, bgcolor: '#FFF' }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
          Create New Discount Coupon
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField size="small" label="Coupon Code (e.g. SUMMER2026)" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
          <TextField size="small" type="number" label="Discount Amount (₹)" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} />
          <MuiButton variant="contained" startIcon={<AddIcon />} onClick={handleAddCoupon} sx={{ borderRadius: '10px', fontWeight: 800 }}>
            Create Coupon
          </MuiButton>
        </Stack>
      </Paper>

      <AdminDataTable title="Active Promo Codes" columns={columns} data={coupons} />
    </Box>
  );
};

export default AdminCoupons;
