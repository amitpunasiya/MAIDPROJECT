import React from 'react';
import { Paper, Box, Typography, Button as MuiButton, Chip } from '@mui/material';
import DiscountIcon from '@mui/icons-material/Discount';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface OfferCardProps {
  code: string;
  discount: string;
  description: string;
  validTill: string;
  tag?: string;
  onApply?: (code: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  code,
  discount,
  description,
  validTill,
  tag = 'FEATURED OFFER',
  onApply,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px dashed #2563EB',
        bgcolor: '#EFF6FF',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.12)',
        },
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Chip label={tag} color="primary" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Valid till {validTill}
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight={800} color="primary.main" gutterBottom>
          {discount}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
          {description}
        </Typography>
      </Box>

      <Box sx={{ pt: 2, borderTop: '1px dashed #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DiscountIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight={800} color="text.primary">
            {code}
          </Typography>
        </Box>

        <MuiButton
          size="small"
          variant="contained"
          color="primary"
          startIcon={<ContentCopyIcon fontSize="small" />}
          onClick={() => onApply && onApply(code)}
          sx={{ borderRadius: '8px', fontWeight: 800, textTransform: 'none' }}
        >
          Copy Code
        </MuiButton>
      </Box>
    </Paper>
  );
};

export default OfferCard;
