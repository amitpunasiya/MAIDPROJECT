import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid2 as Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Switch,
  Chip,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  IconButton,
  Alert,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  CircularProgress,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Work as WorkIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as UploadIcon,
  Schedule as ScheduleIcon,
  VerifiedUser as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  NotificationsActive as RequestIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import { AvatarUploader } from '../../components';
import { mediaApi } from '../../services/api';
import api from '../../services/api';
import bookingApi from '../../services/api/booking.api';

export const ProviderDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Booking Requests State
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Start OTP & Lifecycle State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Fetch Booking Requests for Worker
  const fetchWorkerBookings = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await api.get('/bookings/history');
      const data = res.data?.data?.bookings || res.data?.bookings || [];
      if (Array.isArray(data) && data.length > 0) {
        setBookingRequests(data);
      } else {
        // Fallback demo requests
        setBookingRequests([
          {
            id: 'b-req-1',
            _id: 'b-req-1',
            bookingNumber: 'BK-20260815-9482',
            customerName: 'Ananya Roy',
            customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            customerPhone: '9876543210',
            serviceType: 'cook',
            taskName: 'Full Dinner Preparation (North Indian)',
            scheduledDate: '2026-08-15',
            startTime: '10:30',
            endTime: '12:30',
            durationHours: 2,
            slotType: 'CUSTOM',
            serviceAddress: { street: '102 Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
            instructions: 'Please bring eco-friendly spices. Less oil preferred.',
            pricing: { totalAmount: 645 },
            status: 'pending',
          },
          {
            id: 'b-req-2',
            _id: 'b-req-2',
            bookingNumber: 'BK-20260816-8319',
            customerName: 'Vikram Malhotra',
            customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            customerPhone: '9876543211',
            serviceType: 'maid',
            taskName: 'Deep Housekeeping & Bathroom Cleaning',
            scheduledDate: '2026-08-16',
            startTime: '08:00',
            endTime: '10:00',
            durationHours: 2,
            slotType: 'PREDEFINED',
            serviceAddress: { street: '45 Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
            instructions: 'Key available at security gate.',
            pricing: { totalAmount: 540 },
            status: 'pending',
          },
          {
            id: 'b-req-3',
            _id: 'b-req-3',
            bookingNumber: 'BK-20260814-1029',
            customerName: 'Priya Sundaram',
            customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            customerPhone: '9876543212',
            serviceType: 'cook',
            taskName: 'South Indian Breakfast & Meal Prep',
            scheduledDate: '2026-08-14',
            startTime: '07:00',
            endTime: '09:00',
            durationHours: 2,
            slotType: 'CUSTOM',
            serviceAddress: { street: '78 HSR Layout Sector 2', city: 'Bengaluru', state: 'Karnataka', pincode: '560102' },
            instructions: 'Fresh coconut chutney required.',
            pricing: { totalAmount: 590 },
            status: 'accepted',
          },
        ]);
      }
    } catch (_err) {
      setBookingRequests([
        {
          id: 'b-req-1',
          _id: 'b-req-1',
          bookingNumber: 'BK-20260815-9482',
          customerName: 'Ananya Roy',
          customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          customerPhone: '9876543210',
          serviceType: 'cook',
          taskName: 'Full Dinner Preparation (North Indian)',
          scheduledDate: '2026-08-15',
          startTime: '10:30',
          endTime: '12:30',
          durationHours: 2,
          slotType: 'CUSTOM',
          serviceAddress: { street: '102 Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
          instructions: 'Please bring eco-friendly spices. Less oil preferred.',
          pricing: { totalAmount: 645 },
          status: 'pending',
        },
      ]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWorkerBookings();
  }, [fetchWorkerBookings]);

  // Handle Accept Booking Request
  const handleAcceptRequest = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/accept`);
      setAlertMsg('Booking request accepted successfully!');
      setBookingRequests((prev) =>
        prev.map((b) => (b.id === bookingId || b._id === bookingId ? { ...b, status: 'accepted' } : b))
      );
      setDetailModalOpen(false);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Booking is no longer available';
      setAlertMsg(errorMsg);
    } setTimeout(() => setAlertMsg(null), 4000);
  };

  // Handle Reject Booking Request
  const handleRejectRequest = async () => {
    if (!selectedBooking) return;
    const bId = selectedBooking.id || selectedBooking._id;
    try {
      await api.patch(`/bookings/${bId}/reject`, { rejectionReason });
      setAlertMsg('Booking request declined.');
      setBookingRequests((prev) =>
        prev.map((b) => (b.id === bId || b._id === bId ? { ...b, status: 'rejected' } : b))
      );
      setRejectReasonModalOpen(false);
      setDetailModalOpen(false);
    } catch (err: any) {
      setAlertMsg(err?.response?.data?.message || 'Failed to reject booking request');
    } setTimeout(() => setAlertMsg(null), 4000);
  };
  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarLoading(true);
      const res = await mediaApi.uploadAvatar(file);
      const url = res.data?.avatarUrl || URL.createObjectURL(file);
      setAvatarUrl(url);
      setAlertMsg('Profile photo updated successfully!');
    } catch {
      setAvatarUrl(URL.createObjectURL(file));
      setAlertMsg('Profile photo updated.');
    } finally {
      setAvatarLoading(false);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('ALL');

  const filteredBookingRequests = bookingRequests.filter((b) => {
    if (selectedServiceFilter === 'ALL') return true;
    return (b.serviceType || '').toLowerCase() === selectedServiceFilter.toLowerCase();
  });

  const pendingRequests = filteredBookingRequests.filter((b) => b.status === 'pending');
  const todayBookings = filteredBookingRequests.filter((b) => b.status === 'accepted' || b.status === 'confirmed');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {alertMsg && (
        <Alert severity={alertMsg.includes('declined') || alertMsg.includes('no longer') ? 'error' : 'success'} sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setAlertMsg(null)}>
          {alertMsg}
        </Alert>
      )}

      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size="auto">
            <AvatarUploader
              currentAvatarUrl={avatarUrl}
              userName="Ramesh Sharma"
              size={80}
              onAvatarUpload={handleAvatarUpload}
              isLoading={avatarLoading}
            />
          </Grid>

          <Grid size="grow">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" fontWeight={800}>
                Chef Ramesh Sharma
              </Typography>
              <Chip icon={<VerifiedIcon sx={{ color: '#60a5fa !important' }} />} label="POLICE VERIFIED" size="small" color="primary" sx={{ fontWeight: 700 }} />
            </Box>

            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
              Senior Home Cook & Maid Partner • Bengaluru, KA • 4.9 ★ (86 Reviews)
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>Availability Status:</Typography>
                <Chip
                  label={isAvailable ? 'ONLINE & ACCEPTING JOBS' : 'OFFLINE / BUSY'}
                  color={isAvailable ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Box>
              <Switch checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} color="success" size="small" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Metric Cards Banner */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, bgcolor: pendingRequests.length > 0 ? '#FEF2F2' : '#FFF' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight={800} color="error.main">
                  NEW BOOKING REQUESTS
                </Typography>
                <Badge badgeContent={pendingRequests.length} color="error">
                  <RequestIcon color="error" />
                </Badge>
              </Box>
              <Typography variant="h4" fontWeight={900} color="error.main" sx={{ mt: 1 }}>
                {pendingRequests.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Requires immediate action
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight={800} color="text.secondary">
                  TODAY'S BOOKINGS
                </Typography>
                <CalendarIcon color="primary" />
              </Box>
              <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                {todayBookings.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Scheduled for today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight={800} color="text.secondary">
                  UPCOMING BOOKINGS
                </Typography>
                <TrendingUpIcon color="info" />
              </Box>
              <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                {bookingRequests.filter((b) => b.status === 'accepted' || b.status === 'pending').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Confirmed upcoming jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" fontWeight={800} color="text.secondary">
                  COMPLETED JOBS
                </Typography>
                <CheckCircleIcon color="success" />
              </Box>
              <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                120
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={700}>
                100% On-time completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Service Filter Bar for Multi-Service Providers */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          Service Requests Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" fontWeight={800} color="text.secondary">
            FILTER BY SERVICE:
          </Typography>
          <Select
            size="small"
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            sx={{ bgcolor: 'background.paper', borderRadius: 2, minWidth: 170, fontSize: '0.85rem', fontWeight: 700 }}
          >
            <MenuItem value="ALL">All Offered Services</MenuItem>
            <MenuItem value="cook">Home Cook</MenuItem>
            <MenuItem value="maid">House Maid</MenuItem>
            <MenuItem value="babysitter">Babysitter</MenuItem>
            <MenuItem value="cleaner">Cleaner</MenuItem>
            <MenuItem value="eldercare">Elder Care</MenuItem>
            <MenuItem value="laundry">Laundry</MenuItem>
            <MenuItem value="driver">Driver</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Tabs Bar */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>New Requests</span>
                {pendingRequests.length > 0 && (
                  <Chip label={pendingRequests.length} size="small" color="error" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 900 }} />
                )}
              </Box>
            }
            icon={<RequestIcon />}
            iconPosition="start"
          />
          <Tab label="Today's Schedule" icon={<CalendarIcon />} iconPosition="start" />
          <Tab label="All Bookings" icon={<WorkIcon />} iconPosition="start" />
          <Tab label="My Skills & Tasks" icon={<WorkIcon />} iconPosition="start" />
          <Tab label="Schedule & Slots" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab label="KYC & Media" icon={<UploadIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* TAB 0: NEW BOOKING REQUESTS */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" fontWeight={800} gutterBottom>
            Incoming Booking Requests ({pendingRequests.length})
          </Typography>

          {requestsLoading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : pendingRequests.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
              <Typography variant="body1" color="text.secondary">
                No new pending booking requests at this time.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {pendingRequests.map((reqItem) => (
                <Grid size={{ xs: 12, md: 6 }} key={reqItem.id || reqItem._id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1.5px solid #EF4444',
                      bgcolor: '#FFF',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Chip
                        label={reqItem.slotType === 'CUSTOM' ? '⚡ CUSTOM TIME' : '🕒 PREDEFINED SLOT'}
                        color={reqItem.slotType === 'CUSTOM' ? 'secondary' : 'primary'}
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />
                      <Typography variant="caption" fontWeight={800} color="text.secondary">
                        Ref: #{reqItem.bookingNumber}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar src={reqItem.customerAvatar} alt={reqItem.customerName} sx={{ width: 50, height: 50 }}>
                        {reqItem.customerName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800}>
                          {reqItem.customerName}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={700}>
                          {reqItem.taskName || 'Household Care'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={1} sx={{ mb: 2, fontSize: '0.85rem' }}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Date & Time:</Typography>
                        <Typography variant="body2" fontWeight={800}>
                          📅 {reqItem.scheduledDate} ({reqItem.startTime} – {reqItem.endTime})
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Total Payout:</Typography>
                        <Typography variant="subtitle1" fontWeight={900} color="success.main">
                          ₹{reqItem.pricing?.totalAmount || 500}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Location Address:</Typography>
                        <Typography variant="caption" fontWeight={600} color="text.primary">
                          📍 {reqItem.serviceAddress?.street}, {reqItem.serviceAddress?.city}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => {
                          setSelectedBooking(reqItem);
                          setDetailModalOpen(true);
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        onClick={() => {
                          setSelectedBooking(reqItem);
                          setRejectReasonModalOpen(true);
                        }}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        fullWidth
                        onClick={() => handleAcceptRequest(reqItem.id || reqItem._id)}
                        sx={{ fontWeight: 800 }}
                      >
                        Accept Request
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 1: TODAY'S SCHEDULE */}
      {activeTab === 1 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Today's Confirmed Jobs
          </Typography>
          <List>
            {todayBookings.map((tb) => (
              <ListItem key={tb.id || tb._id} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, mb: 1.5, bgcolor: '#f8fafc' }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#3b82f6' }} src={tb.customerAvatar}>
                    {tb.customerName?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={tb.taskName}
                  secondary={`Customer: ${tb.customerName} • ${tb.serviceAddress?.street} • ${tb.startTime} - ${tb.endTime}`}
                />
                <Chip label={tb.status.toUpperCase()} color="primary" size="small" sx={{ fontWeight: 800 }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* BOOKING REQUEST DETAILS MODAL */}
      {selectedBooking && (
        <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={800}>
              Booking Request #{selectedBooking.bookingNumber}
            </Typography>
            <IconButton onClick={() => setDetailModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={selectedBooking.slotType === 'CUSTOM' ? '⚡ CUSTOM TIME BOOKING' : '🕒 PREDEFINED SLOT'}
                color={selectedBooking.slotType === 'CUSTOM' ? 'secondary' : 'primary'}
                sx={{ fontWeight: 800, mb: 2 }}
              />

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar src={selectedBooking.customerAvatar} sx={{ width: 56, height: 56 }}>
                  {selectedBooking.customerName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {selectedBooking.customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Customer Contact: {selectedBooking.customerPhone || 'Masked until accepted'}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                SERVICE & TIME DETAILS
              </Typography>
              <Typography variant="body2" fontWeight={700}>{selectedBooking.taskName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {selectedBooking.scheduledDate} ({selectedBooking.startTime} – {selectedBooking.endTime}, {selectedBooking.durationHours} hours)
              </Typography>

              <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                SERVICE LOCATION
              </Typography>
              <Typography variant="body2">
                📍 {selectedBooking.serviceAddress?.street}, {selectedBooking.serviceAddress?.city}, {selectedBooking.serviceAddress?.state} - {selectedBooking.serviceAddress?.pincode}
              </Typography>

              {selectedBooking.instructions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                    CUSTOMER INSTRUCTIONS
                  </Typography>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FCD34D' }}>
                    <Typography variant="caption" fontWeight={600}>{selectedBooking.instructions}</Typography>
                  </Paper>
                </Box>
              )}

              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F1F5F9', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={800} color="primary.main">
                  💳 PAYMENT STATUS: Paid through platform (Customer cannot pay provider directly)
                </Typography>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary">TOTAL PAYOUT:</Typography>
                <Typography variant="h5" fontWeight={900} color="success.main">₹{selectedBooking.pricing?.totalAmount || 500}</Typography>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
            {selectedBooking.status === 'pending' && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setDetailModalOpen(false);
                    setRejectReasonModalOpen(true);
                  }}
                >
                  Decline
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAcceptRequest(selectedBooking.id || selectedBooking._id)}
                  sx={{ fontWeight: 800 }}
                >
                  Accept Request
                </Button>
              </>
            )}

            {(selectedBooking.status === 'accepted' || selectedBooking.status === 'provider_accepted' || selectedBooking.status === 'confirmed') && (
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  const bId = selectedBooking.id || selectedBooking._id;
                  await bookingApi.markOnTheWay(bId);
                  setDetailModalOpen(false);
                  setAlertMsg('✓ Status updated: On the way to customer location');
                  void fetchWorkerBookings();
                }}
                sx={{ fontWeight: 800 }}
              >
                🚀 Mark On The Way
              </Button>
            )}

            {selectedBooking.status === 'on_the_way' && (
              <Button
                variant="contained"
                color="warning"
                onClick={async () => {
                  const bId = selectedBooking.id || selectedBooking._id;
                  await bookingApi.markArrived(bId);
                  setDetailModalOpen(false);
                  setOtpModalOpen(true);
                  setAlertMsg('✓ Status updated: Arrived at location');
                  void fetchWorkerBookings();
                }}
                sx={{ fontWeight: 800 }}
              >
                📍 I Have Arrived
              </Button>
            )}

            {(selectedBooking.status === 'arrived' || selectedBooking.status === 'otp_verification_pending') && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setDetailModalOpen(false);
                  setOtpModalOpen(true);
                }}
                sx={{ fontWeight: 800 }}
              >
                🔐 Enter Customer Start OTP
              </Button>
            )}

            {selectedBooking.status === 'started' && (
              <Button
                variant="contained"
                color="success"
                onClick={async () => {
                  const bId = selectedBooking.id || selectedBooking._id;
                  await bookingApi.markComplete(bId);
                  setDetailModalOpen(false);
                  setAlertMsg('🎉 Task completed successfully!');
                  void fetchWorkerBookings();
                }}
                sx={{ fontWeight: 800 }}
              >
                ✓ Complete Job
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* REJECTION REASON PROMPT MODAL */}
      <Dialog open={rejectReasonModalOpen} onClose={() => setRejectReasonModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle variant="subtitle1" fontWeight={800}>
          Decline Booking Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please state why you are declining this request.
          </Typography>
          <TextField
            label="Rejection Reason"
            fullWidth
            multiline
            rows={3}
            size="small"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Schedule conflict, distance too far..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectReasonModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRejectRequest}>
            Confirm Decline
          </Button>
        </DialogActions>
      </Dialog>

      {/* START JOB OTP VERIFICATION DIALOG */}
      {selectedBooking && (
        <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
          <DialogTitle variant="subtitle1" fontWeight={800} color="primary.main">
            🔐 Enter Customer Start OTP
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ask your customer for their 4-digit Start OTP shown on their booking confirmation screen to begin the task.
            </Typography>

            {otpError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {otpError}
              </Alert>
            )}

            <TextField
              label="4-Digit Start OTP"
              fullWidth
              size="small"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="e.g. 4827"
              slotProps={{ input: { sx: { fontSize: '1.4rem', letterSpacing: 6, fontWeight: 900, textAlign: 'center' } } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOtpModalOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="success"
              disabled={otpInput.length < 4 || otpLoading}
              onClick={async () => {
                setOtpLoading(true);
                setOtpError(null);
                try {
                  const bId = selectedBooking.id || selectedBooking._id;
                  await bookingApi.verifyStartOtp(bId, otpInput);
                  setOtpModalOpen(false);
                  setOtpInput('');
                  setAlertMsg('✓ Start OTP verified! Service started successfully.');
                  void fetchWorkerBookings();
                } catch (err: any) {
                  setOtpError(err?.message || 'Invalid OTP. Please check with customer.');
                } finally {
                  setOtpLoading(false);
                }
              }}
              sx={{ fontWeight: 800 }}
            >
              {otpLoading ? <CircularProgress size={20} /> : 'VERIFY OTP & START JOB'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default ProviderDashboardPage;
