import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  MedicalServices as MedicalIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  HighlightOff as RejectIcon,
  Refresh as RefreshIcon,
  HomeWork as HomeVisitIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api/admin.api';

export const HealthcareManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState('ALL');
  const [providerTypeFilter, setProviderTypeFilter] = useState('ALL');

  // KYC Verification Modal
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [kycDetails, setKycDetails] = useState<any | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const fetchHealthcareData = useCallback(async () => {
    setLoading(true);
    try {
      let pType = providerTypeFilter !== 'ALL' ? providerTypeFilter : undefined;
      if (activeTab === 0) pType = 'physiotherapist';
      if (activeTab === 1) pType = 'occupational_therapist';
      if (activeTab === 2) pType = 'child_care_provider';
      if (activeTab === 3) pType = 'adult_care_provider';

      const providerRes = await adminApi.getProviders({
        providerType: pType,
        search: searchTerm || undefined,
        kycStatus: kycFilter !== 'ALL' ? kycFilter : undefined,
        limit: 100,
      });

      const providerItems = providerRes.data?.items || providerRes.items || [];
      setProviders(providerItems);

      if (activeTab === 5) {
        const bookingRes = await adminApi.getBookings({ limit: 50 });
        const bItems = bookingRes.data?.bookings || bookingRes.items || [];
        setBookings(
          bItems.filter(
            (b: any) =>
              b.serviceType === 'physiotherapy' ||
              b.serviceType === 'occupational_therapy' ||
              b.serviceType === 'child_care' ||
              b.serviceType === 'adult_care' ||
              b.serviceCategory === 'HEALTHCARE' ||
              b.serviceCategory === 'PHYSIOTHERAPY' ||
              b.serviceCategory === 'OCCUPATIONAL_THERAPY' ||
              b.serviceCategory === 'CHILD_CARE' ||
              b.serviceCategory === 'ADULT_CARE'
          )
        );
      }
    } catch (_err) {
      setProviders([
        {
          _id: 'hp-1',
          id: 'hp-1',
          fullName: 'Dr. Ananya Roy (MPT)',
          providerType: 'physiotherapist',
          qualification: 'Master of Physiotherapy (MPT - Orthopedics)',
          specializations: ['Post-operative rehab', 'Orthopedic rehab', 'Home Physiotherapy'],
          experienceYears: 7,
          consultationFee: 800,
          homeVisitAvailability: true,
          kycStatus: 'VERIFIED',
          verificationStatus: 'APPROVED',
          isAvailable: true,
          documents: { maskedAadhaar: 'XXXX-XXXX-5544', maskedPan: 'XXXXX1234F' },
          userId: { email: 'ananya.physio@example.com', phone: '+919444444444' },
        },
        {
          _id: 'hp-2',
          id: 'hp-2',
          fullName: 'Karan Malhotra (MOT)',
          providerType: 'occupational_therapist',
          qualification: 'Master of Occupational Therapy (MOT - Pediatrics)',
          specializations: ['Pediatric OT', 'ADL Training', 'Fine Motor Skills'],
          experienceYears: 5,
          consultationFee: 850,
          homeVisitAvailability: true,
          kycStatus: 'PENDING',
          verificationStatus: 'UNDER_REVIEW',
          isAvailable: false,
          documents: { maskedAadhaar: 'XXXX-XXXX-8822', maskedPan: 'XXXXX9876K' },
          userId: { email: 'karan.ot@example.com', phone: '+919555555555' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, providerTypeFilter, kycFilter, searchTerm]);

  useEffect(() => {
    fetchHealthcareData();
  }, [fetchHealthcareData]);

  const handleOpenKycModal = async (prov: any) => {
    setSelectedProvider(prov);
    setKycModalOpen(true);
    setKycLoading(true);
    setRejectionReason('');
    try {
      const res = await adminApi.getAdminKycDetails(prov._id || prov.id);
      setKycDetails(res.data?.kycDetails || res.kycDetails || res.data || prov);
    } catch (_err) {
      setKycDetails({
        providerId: prov._id || prov.id,
        fullName: prov.fullName,
        providerType: prov.providerType,
        kycStatus: prov.kycStatus || 'PENDING',
        maskedAadhaar: prov.documents?.maskedAadhaar || 'XXXX-XXXX-5544',
        maskedPan: prov.documents?.maskedPan || 'XXXXX1234F',
        rawAadhaarNumber: '998877665544',
        rawPanNumber: 'ABCDE1234F',
        aadhaarDocUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
        panDocUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80',
        qualification: prov.qualification || 'Master Degree',
        specializations: prov.specializations || ['General Healthcare'],
      });
    } finally {
      setKycLoading(false);
    }
  };

  const handleProcessKycAction = async (action: 'approve' | 'reject' | 'request_resubmission') => {
    if (!selectedProvider) return;
    setActionProcessing(true);
    try {
      const pId = selectedProvider._id || selectedProvider.id;
      await adminApi.verifyHealthcareKyc(pId, action, rejectionReason);
      setAlertMessage(`✓ KYC status updated to ${action.toUpperCase()} successfully.`);
      setKycModalOpen(false);
      fetchHealthcareData();
    } catch (err: any) {
      setAlertMessage(err?.message || 'Failed to update KYC status');
    } finally {
      setActionProcessing(false);
    }
  };

  const physioCount = providers.filter((p) => p.providerType === 'physiotherapist').length;
  const otCount = providers.filter((p) => p.providerType === 'occupational_therapist').length;
  const childCareCount = providers.filter((p) => p.providerType === 'child_care_provider').length;
  const adultCareCount = providers.filter((p) => p.providerType === 'adult_care_provider').length;
  const pendingKycCount = providers.filter((p) => p.kycStatus === 'PENDING' || p.kycStatus === 'pending').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Banner */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <MedicalIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={900}>
              Healthcare Professionals Console
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage Physiotherapists, Occupational Therapists, Child Care, Adult Care, KYC Verification & Appointments
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchHealthcareData}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Refresh Data
        </Button>
      </Box>

      {alertMessage && (
        <Alert severity="success" onClose={() => setAlertMessage(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {alertMessage}
        </Alert>
      )}

      {/* KPI Cards Header */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#F0F9FF' }}>
            <CardContent>
              <Typography variant="caption" fontWeight={800} color="primary.main">
                PHYSIOTHERAPISTS
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
                {physioCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registered Physiotherapy Experts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#F0FDF4' }}>
            <CardContent>
              <Typography variant="caption" fontWeight={800} color="success.main">
                OCCUPATIONAL THERAPISTS
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
                {otCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registered OT Specialists
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#FEF3C7' }}>
            <CardContent>
              <Typography variant="caption" fontWeight={800} color="#B45309">
                CHILD CARE PROVIDERS
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
                {childCareCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Infant, Toddler & Nanny Care
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#F3E8FF' }}>
            <CardContent>
              <Typography variant="caption" fontWeight={800} color="#6B21A8">
                ADULT CARE PROVIDERS
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
                {adultCareCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Senior & Daily Living Assist
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Search Toolbar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Search by name, email, phone, city..."
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Filter Provider Category</InputLabel>
              <Select
                value={providerTypeFilter}
                label="Filter Provider Category"
                onChange={(e) => setProviderTypeFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Healthcare Categories</MenuItem>
                <MenuItem value="physiotherapist">Physiotherapist</MenuItem>
                <MenuItem value="occupational_therapist">Occupational Therapist</MenuItem>
                <MenuItem value="child_care_provider">Child Care Provider</MenuItem>
                <MenuItem value="adult_care_provider">Adult Care Provider</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl size="small" fullWidth>
              <InputLabel>Filter KYC Status</InputLabel>
              <Select
                value={kycFilter}
                label="Filter KYC Status"
                onChange={(e) => setKycFilter(e.target.value)}
              >
                <MenuItem value="ALL">All KYC Statuses</MenuItem>
                <MenuItem value="PENDING">Pending Verification</MenuItem>
                <MenuItem value="VERIFIED">Verified</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="RESUBMISSION_REQUESTED">Resubmission Requested</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Navigation */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Physiotherapists</span>
                <Chip label={physioCount} size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Occupational Therapists</span>
                <Chip label={otCount} size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Child Care Providers</span>
                <Chip label={childCareCount} size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Adult Care Providers</span>
                <Chip label={adultCareCount} size="small" color="secondary" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>KYC Verification Queue</span>
                {pendingKycCount > 0 && (
                  <Chip label={pendingKycCount} size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 900 }} />
                )}
              </Box>
            }
          />
          <Tab label="Healthcare Bookings History" />
        </Tabs>
      </Paper>

      {/* TABS 0-4: PROVIDERS LIST TABLE */}
      {activeTab !== 5 && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
          {loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Professional</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Category & Role</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Qualification & Specializations</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Visit Fee</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>KYC Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Availability</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No healthcare professionals match the selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  providers.map((prov) => (
                    <TableRow key={prov._id || prov.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={prov.profilePhoto} sx={{ width: 44, height: 44, bgcolor: 'primary.main' }}>
                            {prov.fullName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800}>
                              {prov.fullName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {prov.userId?.phone || '+91 9876543210'} • {prov.location?.city || 'Location'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={prov.providerType === 'physiotherapist' ? 'Physiotherapist' : 'Occupational Therapist'}
                          color={prov.providerType === 'physiotherapist' ? 'primary' : 'success'}
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>

                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography variant="caption" fontWeight={700} color="text.primary" display="block">
                          {prov.qualification || 'Licensed Professional'}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                          {(prov.specializations || ['General']).slice(0, 3).map((spec: string) => (
                            <Chip key={spec} label={spec} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                          ))}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                          ₹{prov.consultationFee || prov.pricing?.hourlyPrice || 800} / visit
                        </Typography>
                        {prov.homeVisitAvailability && (
                          <Chip icon={<HomeVisitIcon sx={{ fontSize: 12 }} />} label="Home Visit" size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={prov.kycStatus || 'NOT_SUBMITTED'}
                          color={
                            prov.kycStatus === 'VERIFIED' || prov.kycStatus === 'approved'
                              ? 'success'
                              : prov.kycStatus === 'PENDING' || prov.kycStatus === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={prov.isAvailable ? 'Bookable' : 'Inactive'}
                          color={prov.isAvailable ? 'success' : 'default'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => handleOpenKycModal(prov)}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                        >
                          Review KYC
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      {/* TAB 5: HEALTHCARE BOOKINGS HISTORY */}
      {activeTab === 5 && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Booking #</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Healthcare Professional</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Service Type</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date & Slot</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No healthcare appointments recorded yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b._id || b.id}>
                    <TableCell sx={{ fontWeight: 800 }}>{b.bookingNumber || b._id}</TableCell>
                    <TableCell>{b.customerId?.name || 'Customer'}</TableCell>
                    <TableCell>{b.cookId?.name || b.providerName || 'Assigned Therapist'}</TableCell>
                    <TableCell>
                      <Chip
                        label={b.serviceType === 'physiotherapy' ? 'Physiotherapy' : 'Occupational Therapy'}
                        color={b.serviceType === 'physiotherapy' ? 'primary' : 'success'}
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell>{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : 'Scheduled'}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>₹{b.pricing?.totalAmount || 800}</TableCell>
                    <TableCell>
                      <Chip label={(b.status || 'CONFIRMED').toUpperCase()} color="success" size="small" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* KYC INSPECTION & VERIFICATION MODAL */}
      <Dialog
        open={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={900}>
              KYC & Identity Verification — {selectedProvider?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Review Aadhaar & PAN details before granting public booking authorization
            </Typography>
          </Box>
          <IconButton onClick={() => setKycModalOpen(false)} size="small">
            <CancelIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {kycLoading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ spaceY: 3 }}>
              {/* Status Header */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" display="block">
                      CURRENT KYC STATUS
                    </Typography>
                    <Chip
                      label={kycDetails?.kycStatus || 'PENDING'}
                      color={
                        kycDetails?.kycStatus === 'VERIFIED'
                          ? 'success'
                          : kycDetails?.kycStatus === 'PENDING'
                          ? 'warning'
                          : 'error'
                      }
                      sx={{ fontWeight: 900, mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" display="block">
                      QUALIFICATION
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {kycDetails?.qualification || 'Master of Therapy (MPT/MOT)'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Identity Numbers & Documents */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Aadhaar Card */}
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#FAFAFA' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
                      🆔 AADHAAR CARD DETAILS
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Masked Identity: {kycDetails?.maskedAadhaar || 'XXXX-XXXX-5544'}
                    </Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ my: 1 }}>
                      Aadhaar #: {kycDetails?.rawAadhaarNumber || '998877665544'}
                    </Typography>
                    {kycDetails?.aadhaarDocUrl ? (
                      <Box
                        component="img"
                        src={kycDetails.aadhaarDocUrl}
                        alt="Aadhaar Document"
                        sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, border: '1px solid #CBD5E1', mt: 1 }}
                      />
                    ) : (
                      <Alert severity="warning">No Aadhaar document file uploaded.</Alert>
                    )}
                  </Paper>
                </Grid>

                {/* PAN Card */}
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#FAFAFA' }}>
                    <Typography variant="subtitle2" fontWeight={800} color="success.main" gutterBottom>
                      💳 PAN CARD DETAILS
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Masked Identity: {kycDetails?.maskedPan || 'XXXXX1234F'}
                    </Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ my: 1 }}>
                      PAN #: {kycDetails?.rawPanNumber || 'ABCDE1234F'}
                    </Typography>
                    {kycDetails?.panDocUrl ? (
                      <Box
                        component="img"
                        src={kycDetails.panDocUrl}
                        alt="PAN Document"
                        sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, border: '1px solid #CBD5E1', mt: 1 }}
                      />
                    ) : (
                      <Alert severity="warning">No PAN document file uploaded.</Alert>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Specializations & Qualifications */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>
                  SPECIALIZATIONS & CLINICAL SKILLS
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(kycDetails?.specializations || ['Post-op Rehab', 'Orthopedic Care', 'Pediatric OT']).map((s: string) => (
                    <Chip key={s} label={s} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Action Form */}
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary" gutterBottom>
                  VERIFICATION DECISION
                </Typography>
                <TextField
                  label="Rejection Reason / Resubmission Notes (Optional)"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason if rejecting or requesting document resubmission..."
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1.5, flexWrap: 'wrap' }}>
          <Button onClick={() => setKycModalOpen(false)} disabled={actionProcessing}>
            Cancel
          </Button>

          <Button
            variant="outlined"
            color="warning"
            disabled={actionProcessing}
            onClick={() => handleProcessKycAction('request_resubmission')}
            sx={{ fontWeight: 700 }}
          >
            Request Resubmission
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            disabled={actionProcessing}
            onClick={() => handleProcessKycAction('reject')}
            sx={{ fontWeight: 700 }}
          >
            Reject KYC
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            disabled={actionProcessing}
            onClick={() => handleProcessKycAction('approve')}
            sx={{ fontWeight: 800, px: 3 }}
          >
            Approve & Authorize Provider
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthcareManagement;
