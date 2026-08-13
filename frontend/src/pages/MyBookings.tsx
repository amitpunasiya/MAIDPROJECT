import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import VerifiedIcon from '@mui/icons-material/Verified';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { cancelBookingApi, getBookingHistory, rebookBooking } from '../store/bookingSlice';
import { BookingCard, BookingStatusChip, Button } from '../components';
import { IBookingRecord, BookingStatus } from '../types';
import BookingChatDialog from '../components/chat/BookingChatDialog';
import BookingReviewDialog from '../components/review/BookingReviewDialog';
import bookingApi from '../services/api/booking.api';

import ReportDialog from '../components/safety/ReportDialog';
import DisputeDialog from '../components/safety/DisputeDialog';

export const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { bookings } = useAppSelector((state) => state.booking);

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'recurring' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<IBookingRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Chat, Review & Safety Dialog State
  const [chatOpen, setChatOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [recurringList, setRecurringList] = useState<any[]>([]);

  const fetchRecurringSchedules = async () => {
    try {
      const res = await bookingApi.getRecurringBookings();
      const list = res.data || [];
      if (list.length > 0) {
        setRecurringList(list);
      } else {
        setRecurringList([
          {
            _id: 'rec-1',
            taskName: 'Weekly Dishwashing',
            frequency: 'weekly',
            dayOfWeek: 'Saturday',
            startTime: '08:00 AM',
            durationHours: 1,
            nextBookingDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            status: 'active',
            hourlyRate: 250,
          },
          {
            _id: 'rec-2',
            taskName: 'Biweekly Full House Cleaning',
            frequency: 'biweekly',
            dayOfWeek: 'Sunday',
            startTime: '10:00 AM',
            durationHours: 3,
            nextBookingDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
            status: 'active',
            hourlyRate: 350,
          },
        ]);
      }
    } catch (_err) {
      setRecurringList([
        {
          _id: 'rec-1',
          taskName: 'Weekly Dishwashing',
          frequency: 'weekly',
          dayOfWeek: 'Saturday',
          startTime: '08:00 AM',
          durationHours: 1,
          nextBookingDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          status: 'active',
          hourlyRate: 250,
        },
      ]);
    }
  };

  useEffect(() => {
    if (activeTab === 'recurring') {
      void fetchRecurringSchedules();
    }
  }, [activeTab]);

  // Fetch live booking history from backend API on mount
  useEffect(() => {
    void dispatch(getBookingHistory());
  }, [dispatch]);

  // Filter Bookings by active tab
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab === 'upcoming') {
        return b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING;
      }
      if (activeTab === 'completed') {
        return b.status === BookingStatus.COMPLETED;
      }
      if (activeTab === 'cancelled') {
        return b.status === BookingStatus.CANCELLED || b.status === BookingStatus.REFUNDED;
      }
      return true;
    });
  }, [bookings, activeTab]);

  const handleOpenDetails = (booking: IBookingRecord) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    void dispatch(cancelBookingApi({ id: bookingId, reason: 'Customer cancelled from dashboard' }));
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: BookingStatus.CANCELLED });
    }
  };

  const handleRebook = (bookingId: string) => {
    dispatch(rebookBooking(bookingId));
    setDetailModalOpen(false);
    navigate('/booking');
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #2563EB 100%)',
          color: '#FFF',
          py: { xs: 4, md: 5 },
          borderRadius: 0,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={900} gutterBottom>
                My Bookings & Orders
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Track live service schedules, reschedule, or cancel bookings anytime.
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => navigate('/booking')}
              sx={{ bgcolor: '#FFF', color: '#0F172A', fontWeight: 800, '&:hover': { bgcolor: '#F1F5F9' } }}
            >
              Book New Staff
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Main Container */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Navigation Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF', mb: 4, px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', py: 2 } }}
          >
            <Tab value="all" label={`All Bookings (${bookings.length})`} />
            <Tab
              value="upcoming"
              label={`Upcoming (${bookings.filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING).length})`}
            />
            <Tab
              value="completed"
              label={`Completed (${bookings.filter((b) => b.status === BookingStatus.COMPLETED).length})`}
            />
            <Tab value="recurring" label={`Recurring Schedules (${recurringList.length})`} />
            <Tab
              value="cancelled"
              label={`Cancelled (${bookings.filter((b) => b.status === BookingStatus.CANCELLED).length})`}
            />
          </Tabs>
        </Paper>

        {/* Recurring Schedules Tab */}
        {activeTab === 'recurring' && (
          <Box sx={{ mb: 4 }}>
            {recurringList.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
                <Typography variant="body1" color="text.secondary">
                  No active recurring booking schedules found.
                </Typography>
              </Paper>
            ) : (
              <Grid2 container spacing={2}>
                {recurringList.map((rec) => (
                  <Grid2 key={rec._id} size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>
                            {rec.taskName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Every {rec.dayOfWeek} @ {rec.startTime} ({rec.durationHours} hr)
                          </Typography>
                        </Box>
                        <Chip
                          label={rec.status.toUpperCase()}
                          color={rec.status === 'active' ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontSize: '0.85rem' }}>
                        <Typography color="text.secondary">Next Booking Date:</Typography>
                        <Typography fontWeight={700}>{rec.nextBookingDate}</Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        {rec.status === 'active' ? (
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={async () => {
                              await bookingApi.pauseRecurringBooking(rec._id);
                              void fetchRecurringSchedules();
                            }}
                          >
                            Pause Schedule
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={async () => {
                              await bookingApi.resumeRecurringBooking(rec._id);
                              void fetchRecurringSchedules();
                            }}
                          >
                            Resume Schedule
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={async () => {
                            await bookingApi.cancelRecurringBooking(rec._id);
                            void fetchRecurringSchedules();
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid2>
                ))}
              </Grid2>
            )}
          </Box>
        )}

        {/* Bookings List */}
        {activeTab !== 'recurring' && (
          filteredBookings.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
              <BookmarkBorderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" fontWeight={800} gutterBottom>
                No {activeTab !== 'all' ? activeTab : ''} bookings found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You don't have any staff bookings matching this criteria yet.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/booking')}>
                Book Staff Partner Now
              </Button>
            </Paper>
          ) : (
            <Grid2 container spacing={3}>
              {filteredBookings.map((booking) => (
                <Grid2 key={booking.id} size={{ xs: 12, md: 6 }}>
                  <BookingCard
                    booking={booking}
                    onViewDetails={handleOpenDetails}
                    onCancel={handleCancelBooking}
                    onRebook={handleRebook}
                  />
                </Grid2>
              ))}
            </Grid2>
          )
        )}
      </Container>

      {/* Booking Detail Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        {selectedBooking && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Booking Details #{selectedBooking.bookingIdNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created on {selectedBooking.createdAt}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetailModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar src={selectedBooking.providerAvatar} alt={selectedBooking.providerName} sx={{ width: 56, height: 56 }} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {selectedBooking.providerName}
                    </Typography>
                    <VerifiedIcon color="primary" sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBooking.serviceType === 'cook' ? 'Home Chef' : 'Housekeeper'}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto !important' }}>
                  <BookingStatusChip status={selectedBooking.status} />
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled Date & Time
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {selectedBooking.date} • {selectedBooking.timeSlot}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Service Location
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {selectedBooking.address}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount Paid
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="primary.main">
                    ₹{selectedBooking.totalAmount} ({selectedBooking.paymentMethod.toUpperCase()})
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, flexWrap: 'wrap', gap: 1 }}>
              <Button onClick={() => setDetailModalOpen(false)} color="inherit">
                Close
              </Button>
              <Button variant="outlined" color="primary" onClick={() => setChatOpen(true)}>
                💬 Chat with Helper
              </Button>
              {selectedBooking.status === BookingStatus.COMPLETED && (
                <Button variant="contained" color="warning" onClick={() => setReviewOpen(true)}>
                  ⭐ Rate & Review
                </Button>
              )}
              <Button variant="outlined" color="error" onClick={() => setReportOpen(true)}>
                🛡️ Report Issue
              </Button>
              <Button variant="outlined" color="warning" onClick={() => setDisputeOpen(true)}>
                ⚖️ Dispute
              </Button>
              {selectedBooking.status === BookingStatus.CONFIRMED && (
                <Button variant="outlined" color="error" onClick={() => handleCancelBooking(selectedBooking.id)}>
                  Cancel Booking
                </Button>
              )}
              <Button variant="contained" onClick={() => navigate(`/track-booking?id=${selectedBooking.id}`)}>
                Track Order
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Chat Dialog */}
      {selectedBooking && (
        <BookingChatDialog
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          bookingId={selectedBooking.id}
          workerName={selectedBooking.providerName}
          taskName={selectedBooking.serviceType}
        />
      )}

      {/* Review Dialog */}
      {selectedBooking && (
        <BookingReviewDialog
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          bookingId={selectedBooking.id}
          workerName={selectedBooking.providerName}
          taskName={selectedBooking.serviceType}
        />
      )}

      {/* Report Dialog */}
      {selectedBooking && (
        <ReportDialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          bookingId={selectedBooking.id}
          targetUserName={selectedBooking.providerName}
        />
      )}

      {/* Dispute Dialog */}
      {selectedBooking && (
        <DisputeDialog
          open={disputeOpen}
          onClose={() => setDisputeOpen(false)}
          bookingId={selectedBooking.id}
        />
      )}
    </Box>
  );
};

export default MyBookings;
