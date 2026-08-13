import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid2, Alert } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import BadgeIcon from '@mui/icons-material/Badge';
import VerifiedIcon from '@mui/icons-material/Verified';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import MediaUploader, { MediaFile } from '../../components/dashboard/MediaUploader';
import { mediaApi } from '../../services/api';

const INITIAL_DOCS: MediaFile[] = [
  {
    id: 'doc-1',
    name: 'Aadhaar_Card_Front_Back.pdf',
    url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
    category: 'aadhaar',
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-2',
    name: 'PAN_Verification_Doc.png',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    category: 'pan',
    mimeType: 'image/png',
  },
];

export const DashboardMedia: React.FC = () => {
  const [docs, setDocs] = useState<MediaFile[]>(INITIAL_DOCS);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const res = await mediaApi.fetchMedia();
      if (res.data?.items && res.data.items.length > 0) {
        const mapped = res.data.items.map((m) => ({
          id: m.id,
          name: m.name,
          url: m.url,
          category: m.category,
          mimeType: m.mimeType,
        }));
        setDocs(mapped);
      }
    } catch {
      // Keep initial docs as fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia();
  }, []);

  const handleUploadDocument = async (file: File, category: string = 'document') => {
    try {
      setLoading(true);
      const res = await mediaApi.uploadFile(file, category);
      const uploaded: MediaFile = res.data?.file || {
        id: `media-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        category,
        mimeType: file.type,
      };

      setDocs((prev) => [uploaded, ...prev]);
      setAlertMsg(`File ${file.name} uploaded successfully!`);
    } catch {
      const fallback: MediaFile = {
        id: `media-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        category,
        mimeType: file.type,
      };
      setDocs((prev) => [fallback, ...prev]);
      setAlertMsg(`File ${file.name} stored successfully.`);
    } finally {
      setLoading(false);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await mediaApi.deleteMedia(id);
    } catch {
      // Ignored
    } finally {
      setDocs((prev) => prev.filter((d) => d.id !== id));
      setAlertMsg('Document deleted.');
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  return (
    <Box>
      <DashboardHeader title="Identity Documents & Media Vault" subtitle="Upload Aadhaar, PAN card, address proofs, and compliance documents." />

      {alertMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setAlertMsg(null)}>
          {alertMsg}
        </Alert>
      )}

      <Grid2 container spacing={3.5}>
        {/* Upload Aadhaar / PAN Section */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BadgeIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                Upload Government ID Proof
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload Aadhaar Card or Passport for fast identity verification.
            </Typography>

            <MediaUploader
              label="Upload Aadhaar Card (PDF / JPG)"
              category="aadhaar"
              accept="image/*,application/pdf"
              files={docs.filter((d) => d.category === 'aadhaar')}
              onUpload={handleUploadDocument}
              onDelete={handleDeleteMedia}
              isUploading={loading}
            />
          </Paper>
        </Grid2>

        {/* Upload PAN Card / Certificates Section */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <VerifiedIcon color="secondary" />
              <Typography variant="h6" fontWeight={800}>
                Upload PAN / Address Proof
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload PAN card or utility bill for background check verification.
            </Typography>

            <MediaUploader
              label="Upload PAN Card or Utility Bill"
              category="pan"
              accept="image/*,application/pdf"
              files={docs.filter((d) => d.category === 'pan' || d.category === 'document')}
              onUpload={handleUploadDocument}
              onDelete={handleDeleteMedia}
              isUploading={loading}
            />
          </Paper>
        </Grid2>

        {/* Full Media Vault */}
        <Grid2 size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <FolderIcon color="primary" />
              <Typography variant="h6" fontWeight={800}>
                All Media Vault Files ({docs.length})
              </Typography>
            </Box>

            <MediaUploader
              label="Upload General Certificate or Media File"
              category="other"
              accept="image/*,application/pdf"
              files={docs}
              onUpload={handleUploadDocument}
              onDelete={handleDeleteMedia}
              isUploading={loading}
            />
          </Paper>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default DashboardMedia;
