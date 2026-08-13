import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface HelpAccordionProps {
  items: FAQItem[];
}

export const HelpAccordion: React.FC<HelpAccordionProps> = ({ items }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {items.map((item) => (
        <Accordion
          key={item.id}
          elevation={0}
          sx={{
            borderRadius: '12px !important',
            border: '1px solid #E2E8F0',
            before: { display: 'none' },
            '&.Mui-expanded': { bgcolor: '#F8FAFC' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default HelpAccordion;
