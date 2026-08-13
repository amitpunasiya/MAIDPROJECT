import React from 'react';
import { Box, Typography, Paper, Grid2, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';

export const AdminReports: React.FC = () => {
  const reportsList = [
    { title: 'Monthly Revenue & GST Tax Report', desc: 'Detailed financial statements, platform commission breakdown, and GST tax ledger.', type: 'Financial' },
    { title: 'Provider Performance & KYC Audit Report', desc: 'Ratings, background check verifications, cancellation rate, and job completion metrics.', type: 'Partners' },
    { title: 'Customer Acquisition & Retention Report', desc: 'New user signups, repeat booking frequency, cohort retention metrics, and churn rate.', type: 'Growth' },
    { title: 'Digital Wallet Transactions Summary', desc: 'Wallet recharges, 1-click debits, cashback distribution, and liability balance reports.', type: 'Finance' },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900}>
          Platform Reports & Intelligence
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate, preview, and download CSV & Excel compliance reports.
        </Typography>
      </Box>

      <Grid2 container spacing={3}>
        {reportsList.map((rep, idx) => (
          <Grid2 key={idx} size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  {rep.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {rep.desc}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button variant="contained" size="small" startIcon={<DownloadIcon />} sx={{ borderRadius: '8px', fontWeight: 800 }}>
                  Export CSV
                </Button>
                <Button variant="outlined" size="small" color="secondary" startIcon={<DownloadIcon />} sx={{ borderRadius: '8px', fontWeight: 800 }}>
                  Export Excel
                </Button>
              </Box>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

export default AdminReports;
