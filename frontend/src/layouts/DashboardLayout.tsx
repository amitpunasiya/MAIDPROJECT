import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Grid2 } from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, py: 5 }}>
        <Container maxWidth="lg">
          <Grid2 container spacing={3.5}>
            {/* Desktop Sidebar Navigation */}
            <Grid2 size={{ xs: 12, md: 3.5 }}>
              <DashboardSidebar />
            </Grid2>

            {/* Dashboard Content Pages */}
            <Grid2 size={{ xs: 12, md: 8.5 }}>
              <Outlet />
            </Grid2>
          </Grid2>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default DashboardLayout;
