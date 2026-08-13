import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MOCK_FAQS } from '../../services/mockData';

export const FaqSection: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>('faq-1');

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box id="faq" sx={{ py: 10, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 7 }}>
          <Chip
            label="GOT QUESTIONS?"
            color="primary"
            size="small"
            sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '0.05em' }}
          />
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Find clear answers about verification, booking policies, trial meals, and pricing.
          </Typography>
        </Box>

        {/* Accordions Stack */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
          }}
        >
          {MOCK_FAQS.map((faq, idx) => {
            const isExpanded = expanded === faq.id;
            return (
              <Accordion
                key={faq.id}
                expanded={isExpanded}
                onChange={handleChange(faq.id)}
                elevation={0}
                sx={{
                  borderBottom: idx !== MOCK_FAQS.length - 1 ? '1px solid #E2E8F0' : 'none',
                  '&:before': { display: 'none' },
                  bgcolor: isExpanded ? '#F8FAFC' : '#FFFFFF',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: isExpanded ? 'primary.main' : 'text.secondary' }} />}
                  sx={{ px: 3, py: 1.5 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 1 }}>
                    <HelpOutlineIcon sx={{ color: isExpanded ? 'primary.main' : 'text.disabled' }} />
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.05rem', flex: 1 }}>
                      {faq.question}
                    </Typography>
                    <Chip
                      label={faq.category}
                      size="small"
                      variant="outlined"
                      sx={{
                        display: { xs: 'none', sm: 'inline-flex' },
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0, pl: 7 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Paper>
      </Container>
    </Box>
  );
};

export default FaqSection;
