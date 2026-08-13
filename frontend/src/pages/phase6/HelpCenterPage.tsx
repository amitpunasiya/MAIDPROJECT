import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Tabs, Tab } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { HelpAccordion } from '../../components';

export const HelpCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'refund' | 'cancellation' | 'privacy' | 'terms'>('faq');

  const faqItems = [
    { id: 'h-1', question: 'What is MaidProject?', answer: 'MaidProject is India’s leading on-demand platform for booking background-verified home cooks, housemaids, deep cleaning, babysitters, and elder caretakers.' },
    { id: 'h-2', question: 'How do I pay for my booking?', answer: 'We support UPI (GPay/PhonePe/Paytm), Credit & Debit Cards, Net Banking, MaidProject Wallet, and Cash on Service Completion.' },
    { id: 'h-3', question: 'Are staff background verified?', answer: 'Yes, 100% of staff undergo police record verification and Aadhaar identification check before listing on our platform.' },
  ];

  const refundItems = [
    { id: 'r-1', question: 'When will I get my refund after cancellation?', answer: 'Refunds for bookings cancelled 2 hours prior to start time are processed instantly to your MaidProject Wallet or within 24-48 hours to original payment bank account.' },
    { id: 'r-2', question: 'Is there any cancellation penalty fee?', answer: 'Zero penalty fee if cancelled at least 2 hours before the scheduled time slot.' },
  ];

  const cancellationItems = [
    { id: 'c-1', question: 'How do I cancel or reschedule my booking?', answer: 'Navigate to My Bookings or Booking Details page and click "Cancel Booking" or "Reschedule Visit". Select your new preferred date or confirm cancellation.' },
  ];

  const privacyItems = [
    { id: 'p-1', question: 'How is my personal data and address stored?', answer: 'Your personal phone number and address are 256-bit SSL encrypted and shared strictly with assigned staff for navigation purposes only.' },
  ];

  const termsItems = [
    { id: 't-1', question: 'What are the platform terms of service?', answer: 'By booking staff through MaidProject, users agree to provide a safe, respectful working environment for service professionals.' },
  ];

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'refund': return refundItems;
      case 'cancellation': return cancellationItems;
      case 'privacy': return privacyItems;
      case 'terms': return termsItems;
      default: return faqItems;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5, maxWidth: 700, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
            <HelpOutlineIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h3" fontWeight={800} color="text.primary">
              Help Center & Policies
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Find detailed information regarding our platform policies, refund rules, privacy terms, and cancellation guidelines.
          </Typography>
        </Box>

        {/* Category Tabs */}
        <Paper elevation={0} sx={{ p: 1, mb: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
          <Tabs
            value={activeTab}
            onChange={(_e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Common Questions" value="faq" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab label="Refund Policy" value="refund" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab label="Cancellation Policy" value="cancellation" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab label="Privacy Policy" value="privacy" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab label="Terms & Conditions" value="terms" sx={{ fontWeight: 700, textTransform: 'none' }} />
          </Tabs>
        </Paper>

        {/* Content Accordion */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
          <HelpAccordion items={getCurrentItems()} />
        </Paper>
      </Container>
    </Box>
  );
};

export default HelpCenterPage;
