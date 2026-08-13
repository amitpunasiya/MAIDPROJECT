import React, { useState } from 'react';
import { Paper, Box, Typography, Grid2, Dialog, IconButton } from '@mui/material';
import CollectionsIcon from '@mui/icons-material/Collections';
import CloseIcon from '@mui/icons-material/Close';

interface GalleryProps {
  images?: string[];
  title?: string;
}

const defaultGalleryImages = [
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
];

export const Gallery: React.FC<GalleryProps> = ({
  images = defaultGalleryImages,
  title = 'Work Showcase & Gallery',
}) => {
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const displayImages = images.length > 0 ? images : defaultGalleryImages;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        mb: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CollectionsIcon color="primary" />
        <Typography variant="h6" fontWeight={800} color="text.primary">
          {title}
        </Typography>
      </Box>

      <Grid2 container spacing={2}>
        {displayImages.map((imgUrl, idx) => (
          <Grid2 key={idx} size={{ xs: 6, sm: 3 }}>
            <Box
              onClick={() => setActiveImg(imgUrl)}
              sx={{
                height: 140,
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #E2E8F0',
                '& img': { transition: 'transform 0.35s ease' },
                '&:hover img': { transform: 'scale(1.08)' },
              }}
            >
              <Box
                component="img"
                src={imgUrl}
                alt={`Gallery image ${idx + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Grid2>
        ))}
      </Grid2>

      {/* Lightbox Dialog */}
      <Dialog open={Boolean(activeImg)} onClose={() => setActiveImg(null)} maxWidth="md">
        <Box sx={{ position: 'relative', p: 1, bgcolor: '#0F172A' }}>
          <IconButton
            onClick={() => setActiveImg(null)}
            sx={{ position: 'absolute', top: 12, right: 12, color: '#FFF', bgcolor: 'rgba(255,255,255,0.2)' }}
          >
            <CloseIcon />
          </IconButton>
          {activeImg && (
            <Box
              component="img"
              src={activeImg}
              alt="Work preview"
              sx={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 2 }}
            />
          )}
        </Box>
      </Dialog>
    </Paper>
  );
};

export default Gallery;
