import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ChatIcon from '@mui/icons-material/Chat';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

import { SupportCard, HelpAccordion, Button, Input } from '../../components';

export const SupportPage: React.FC = () => {
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [successAlert, setSuccessAlert] = useState(false);

  const faqItems = [
    {
      id: 'faq-1',
      question: 'How do I cancel a booking and get a refund?',
      answer: 'You can cancel any booking up to 2 hours before the scheduled slot from your Booking Details or Dashboard. Refunds are processed automatically within 24 hours.',
    },
    {
      id: 'faq-2',
      question: 'What if the assigned cook or maid does not show up?',
      answer: 'Our staff arrival is tracked via live GPS. If there is an emergency delay, our support team immediately assigns a replacement or issues a full refund + ₹100 apology credit.',
    },
    {
      id: 'faq-3',
      question: 'Are all home cooks and maids background checked?',
      answer: 'Yes! 100% of staff undergo mandatory Aadhaar verification, criminal record police check, and hygiene training before joining MaidProject.',
    },
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessAlert(true);
    setTicketDialogOpen(false);
    setTimeout(() => setSuccessAlert(false), 4000);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5, maxWidth: 700, mx: 'auto' }}>
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            24x7 Customer Help & Support
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We are here to assist you with your bookings, payments, staff queries, and feedback.
          </Typography>
        </Box>

        {successAlert && (
          <Alert severity="success" sx={{ mb: 4, borderRadius: 3 }}>
            Support ticket created successfully! Ticket ID #TCK-99410. Our support team will reply within 15 minutes.
          </Alert>
        )}

        {/* Support Options Cards */}
        <Grid2 container spacing={3.5} sx={{ mb: 6 }}>
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SupportCard
              title="Call Toll-Free Support"
              description="Speak directly with our customer happiness manager."
              actionText="Call 1800-123-4567"
              icon={<PhoneInTalkIcon fontSize="large" />}
              color="primary"
              onClick={() => alert('Dialing Toll-Free Customer Support: 1800-123-4567')}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SupportCard
              title="WhatsApp Chat Support"
              description="Instant chat assistance for quick booking queries."
              actionText="Chat on WhatsApp"
              icon={<WhatsAppIcon fontSize="large" />}
              color="success"
              onClick={() => alert('Opening WhatsApp Chat Support...')}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SupportCard
              title="In-App Live Agent Chat"
              description="Chat live with our AI assistant & support representative."
              actionText="Start Live Chat"
              icon={<ChatIcon fontSize="large" />}
              color="secondary"
              onClick={() => alert('Launching In-App Live Support Widget...')}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SupportCard
              title="Raise Support Ticket"
              description="Submit detailed issue ticket for payment or service refund."
              actionText="Raise Ticket"
              icon={<ConfirmationNumberIcon fontSize="large" />}
              color="warning"
              onClick={() => setTicketDialogOpen(true)}
            />
          </Grid2>
        </Grid2>

        {/* Frequently Asked Questions */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
          <Typography variant="h5" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
            Frequently Asked Support Questions
          </Typography>

          <HelpAccordion items={faqItems} />
        </Paper>

        {/* Create Ticket Modal */}
        <Dialog open={ticketDialogOpen} onClose={() => setTicketDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#0F172A', color: '#FFF' }}>
            <Typography variant="h6" fontWeight={800}>
              Raise Support Ticket
            </Typography>
            <IconButton onClick={() => setTicketDialogOpen(false)} sx={{ color: '#FFF' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3, pt: 4 }}>
            <Box component="form" onSubmit={handleCreateTicket}>
              <Input
                label="Subject / Issue Overview *"
                placeholder="e.g. Refund issue for Booking #BK-89421"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                sx={{ mb: 2.5 }}
              />

              <Input
                label="Detailed Explanation *"
                placeholder="Describe what went wrong or how we can assist you..."
                multiline
                rows={4}
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
              />

              <DialogActions sx={{ px: 0, pt: 3 }}>
                <Button variant="outlined" onClick={() => setTicketDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" sx={{ px: 3, fontWeight: 800 }}>
                  Submit Support Ticket
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SupportPage;
