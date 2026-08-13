import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { AdminDataTable, ColumnDef, MediaUploader, MediaFile } from '../../components';

const MOCK_MEDIA: MediaFile[] = [
  { id: 'm-1', name: 'Aadhaar_Card_Verify.pdf', url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80', category: 'aadhaar' },
  { id: 'm-2', name: 'PAN_Card_Verify.png', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', category: 'pan' },
];

export const AdminMedia: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>(MOCK_MEDIA);

  const columns: ColumnDef<MediaFile>[] = [
    { id: 'name', label: 'FILE NAME' },
    { id: 'category', label: 'CATEGORY', render: (r) => (r.category || 'document').toUpperCase() },
    { id: 'url', label: 'PREVIEW URL', render: (r) => <a href={r.url} target="_blank" rel="noreferrer">View File</a> },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>
          Platform Media Vault & Storage
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Audit stored media assets, provider KYC documents, and platform banners.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <MediaUploader
          label="Upload System Asset or Document"
          files={files}
          onUpload={(f) => {
            const created: MediaFile = { id: `m-${Date.now()}`, name: f.name, url: URL.createObjectURL(f), category: 'asset' };
            setFiles([created, ...files]);
          }}
          onDelete={(id) => setFiles(files.filter((f) => f.id !== id))}
        />
      </Box>

      <AdminDataTable title="System Media File Registry" columns={columns} data={files} />
    </Box>
  );
};

export default AdminMedia;
