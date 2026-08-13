import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ToggleOn as ToggleOnIcon, ToggleOff as ToggleOffIcon, Share as ShareIcon } from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';
import { AdminLoading, AdminError, AdminEmpty, AdminPagination } from '../components/common/AdminStateComponents';

interface CouponRecord {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat' | string;
  discountValue: number;
  minBookingValue: number;
  expiryDate: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
}

export const CouponManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'coupons' | 'referrals'>('coupons');
  const [openModal, setOpenModal] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('500');

  // Coupon state
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Referral state
  const [referrals, setReferrals] = useState<any[]>([]);
  const [refLoading, setRefLoading] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getCoupons({ page, limit: 10 });
      const payload = res.data || res;
      const rawList = Array.isArray(payload) ? payload : payload.docs || payload.items || payload.coupons || [];

      const formatted: CouponRecord[] = rawList.map((c: any) => ({
        id: c._id || c.id,
        code: c.code || 'PROMO',
        discountType: c.discountType || (c.discountPercentage ? 'percentage' : 'flat'),
        discountValue: c.discountAmount || c.discountValue || c.discountPercentage || 0,
        minBookingValue: c.minOrderValue || c.minBookingValue || 0,
        expiryDate: c.validUntil ? new Date(c.validUntil).toLocaleDateString() : (c.expiryDate || 'No Expiry'),
        usageCount: c.usedCount || c.usageCount || 0,
        maxUsage: c.maxUses || c.maxUsage || 1000,
        isActive: typeof c.isActive === 'boolean' ? c.isActive : c.status === 'active',
      }));

      setCoupons(formatted);
      setTotalPages(payload.totalPages || payload.pages || 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to load coupons from server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      setRefLoading(true);
      const res = await adminApi.getReferrals({ page: 1, limit: 20 });
      const payload = res.data || res;
      const list = Array.isArray(payload) ? payload : payload.docs || payload.items || payload.referrals || [];
      setReferrals(list);
    } catch (_err) {
      setReferrals([]);
    } finally {
      setRefLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'coupons') void fetchCoupons();
    else void fetchReferrals();
  }, [activeTab, page]);

  const handleToggleStatus = async (id: string) => {
    try {
      await adminApi.toggleCouponStatus(id);
      void fetchCoupons();
    } catch (err: any) {
      alert(err?.message || 'Failed to toggle coupon status.');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await adminApi.deleteCoupon(id);
      void fetchCoupons();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete coupon.');
    }
  };

  const handleAddCoupon = async () => {
    if (code && value) {
      try {
        await adminApi.createCoupon({
          code: code.trim().toUpperCase(),
          discountType: type,
          discountValue: Number(value),
          discountAmount: Number(value),
          minOrderValue: Number(minOrder),
          isActive: true,
        });
        setCode('');
        setValue('');
        setOpenModal(false);
        void fetchCoupons();
      } catch (err: any) {
        alert(err?.message || 'Failed to create coupon code.');
      }
    }
  };

  const handleGenerateReferral = async () => {
    try {
      await adminApi.generateReferralCode();
      void fetchReferrals();
      alert('New referral code generated!');
    } catch (err: any) {
      alert(err?.message || 'Failed to generate referral code.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Promotions & Referral Program
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure discount codes, flat and percentage offers, expiry dates, and user referral tracking.
          </Typography>
        </Box>
        {activeTab === 'coupons' ? (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
            Create Coupon
          </Button>
        ) : (
          <Button variant="contained" color="primary" startIcon={<ShareIcon />} onClick={handleGenerateReferral}>
            Generate Referral Code
          </Button>
        )}
      </Box>

      {/* Tabs selector */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, mb: 3, p: 1 }}>
        <Tabs value={activeTab} onChange={(_e, val) => setActiveTab(val)}>
          <Tab label="Promo Coupons" value="coupons" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Referrals & Rewards" value="referrals" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>
      </Paper>

      {activeTab === 'coupons' ? (
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          {loading ? (
            <AdminLoading message="Fetching active promo coupons..." />
          ) : error ? (
            <AdminError message={error} onRetry={fetchCoupons} />
          ) : coupons.length === 0 ? (
            <AdminEmpty title="No Coupons Created" description="Create a new promotional coupon code to boost bookings." />
          ) : (
            <>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Coupon Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Discount Type & Value</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Min Booking</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Expiry Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Redemptions</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        <Chip label={coupon.code} color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                      </TableCell>
                      <TableCell>₹{coupon.minBookingValue}</TableCell>
                      <TableCell>{coupon.expiryDate}</TableCell>
                      <TableCell>
                        {coupon.usageCount} / {coupon.maxUsage}
                      </TableCell>
                      <TableCell>
                        <Chip label={coupon.isActive ? 'ACTIVE' : 'INACTIVE'} color={coupon.isActive ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleToggleStatus(coupon.id)} color={coupon.isActive ? 'warning' : 'success'}>
                          {coupon.isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteCoupon(coupon.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <AdminPagination page={page} count={totalPages} onChange={(p) => setPage(p)} />
            </>
          )}
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          {refLoading ? (
            <AdminLoading message="Loading referral records..." />
          ) : referrals.length === 0 ? (
            <AdminEmpty title="No Referral Data" description="Click 'Generate Referral Code' to generate a program link." />
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Referral Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Referrer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Referred User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reward Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referrals.map((r: any, idx: number) => (
                  <TableRow key={r.id || r._id || idx} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{r.code || 'REF-CODE'}</TableCell>
                    <TableCell>{r.referrerName || r.referrerId || 'System User'}</TableCell>
                    <TableCell>{r.referredName || r.referredId || 'Pending User'}</TableCell>
                    <TableCell>
                      <Chip label={(r.status || 'ACTIVE').toUpperCase()} color="success" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      {/* Create Coupon Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Create Promo Coupon</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Coupon Code (e.g. SAVE20)" fullWidth size="small" value={code} onChange={(e) => setCode(e.target.value)} />
            <TextField select label="Discount Type" fullWidth size="small" value={type} onChange={(e) => setType(e.target.value as any)}>
              <MenuItem value="percentage">Percentage (%) Discount</MenuItem>
              <MenuItem value="flat">Flat Amount (₹) Discount</MenuItem>
            </TextField>
            <TextField label="Discount Value" type="number" fullWidth size="small" value={value} onChange={(e) => setValue(e.target.value)} />
            <TextField label="Min Order Value (₹)" type="number" fullWidth size="small" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCoupon}>Create Code</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CouponManagement;
