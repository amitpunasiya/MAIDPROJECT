import React, { useState } from 'react';
import { Paper, Box, Typography, Grid2, Dialog, IconButton } from '@mui/material';
import CollectionsIcon from '@mui/icons-material/Collections';
import CloseIcon from '@mui/icons-material/Close';

interface ProviderGalleryProps {
  gallery?: string[];
  providerName: string;
}

const defaultImages = [
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
];

export const ProviderGallery: React.FC<ProviderGalleryProps> = ({
  gallery = defaultImages,
  providerName,
}) => {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const imagesToShow = gallery.length > 0 ? gallery : defaultImages;

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
          Work Showcase & Gallery
        </Typography>
      </Box>

      <Grid2 container spacing={2}>
        {imagesToShow.map((imgUrl, idx) => (
          <Grid2 key={idx} size={{ xs: 6, sm: 3 }}>
            <Box
              onClick={() => setActiveImage(imgUrl)}
              sx={{
                height: 140,
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #E2E8F0',
                position: 'relative',
                '& img': {
                  transition: 'transform 0.35s ease',
                },
                '&:hover img': {
                  transform: 'scale(1.08)',
                },
              }}
            >
              <Box
                component="img"
                src={imgUrl}
                alt={`${providerName} showcase ${idx + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Grid2>
        ))}
      </Grid2>

      {/* Lightbox Dialog */}
      <Dialog
        open={Boolean(activeImage)}
        onClose={() => setActiveImage(null)}
        maxWidth="md"
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden' } }}
      >
        <Box sx={{ position: 'relative', p: 1 }}>
          <IconButton
            onClick={() => setActiveImage(null)}
            sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(0,0,0,0.6)', color: '#FFF' }}
          >
            <CloseIcon />
          </IconButton>
          {activeImage && (
            <Box
              component="img"
              src={activeImage}
              alt="Work preview"
              sx={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            />
          )}
        </Box>
      </Dialog>
    </Paper>
  );
};

export default ProviderGallery;
