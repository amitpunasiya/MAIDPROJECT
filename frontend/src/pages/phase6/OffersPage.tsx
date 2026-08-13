import React from 'react';
import { Box, Container, Typography, Grid2, Paper, Chip } from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import DiscountIcon from '@mui/icons-material/Discount';

import { OfferCard, Button } from '../../components';

export const OffersPage: React.FC = () => {
  const coupons = [
    { code: 'WELCOME100', discount: 'Flat ₹100 OFF', desc: 'Valid on first home cook or housemaid booking.', valid: '31 Aug 2026', tag: 'NEW USER' },
    { code: 'FESTIVE200', discount: 'Flat ₹200 OFF', desc: 'Valid on deep house cleaning & party chef orders above ₹1,000.', valid: '15 Aug 2026', tag: 'FESTIVAL SPECIAL' },
    { code: 'SAVE50', discount: 'Instant ₹50 OFF', desc: 'Valid on all daily meal cooking subscriptions.', valid: '30 Sep 2026', tag: 'DAILY MEALS' },
    { code: 'CLEAN300', discount: 'Flat ₹300 OFF', desc: 'Valid on full home sanitization & balcony scrubbing.', valid: '20 Aug 2026', tag: 'DEEP CLEANING' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5, maxWidth: 700, mx: 'auto' }}>
          <Chip icon={<DiscountIcon fontSize="small" />} label="OFFERS & PROMOTIONS" color="primary" sx={{ fontWeight: 800, mb: 1.5 }} />
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
            Promos, Coupons & Savings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Apply these exclusive discount codes during checkout to save big on home services.
          </Typography>
        </Box>

        {/* Referral Bonus Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 5,
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            color: '#FFFFFF',
            mb: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            boxShadow: '0 12px 30px rgba(49, 46, 129, 0.25)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                bgcolor: '#4338CA',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CardGiftcardIcon sx={{ fontSize: 36 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#FFFFFF">
                Refer & Earn ₹250 Wallet Cash!
              </Typography>
              <Typography variant="body2" color="#C7D2FE" sx={{ mt: 0.5 }}>
                Invite your neighbors & friends to MaidProject. You both get ₹250 on their first completed booking.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => alert('Referral Link Copied: https://maidproject.app/ref/aarav250')}
            sx={{ borderRadius: '12px', fontWeight: 800, px: 3, py: 1.2 }}
          >
            Copy Invite Link
          </Button>
        </Paper>

        {/* Coupons Grid */}
        <Typography variant="h5" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
          Active Promo Coupons
        </Typography>
        <Grid2 container spacing={3.5}>
          {coupons.map((c) => (
            <Grid2 key={c.code} size={{ xs: 12, sm: 6, lg: 3 }}>
              <OfferCard
                code={c.code}
                discount={c.discount}
                description={c.desc}
                validTill={c.valid}
                tag={c.tag}
                onApply={(code) => alert(`Coupon ${code} copied!`)}
              />
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </Box>
  );
};

export default OffersPage;
