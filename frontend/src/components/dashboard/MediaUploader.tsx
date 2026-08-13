import React, { useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  category?: string;
  sizeBytes?: number;
  mimeType?: string;
}

export interface MediaUploaderProps {
  label?: string;
  accept?: string;
  category?: string;
  files?: MediaFile[];
  onUpload: (file: File, category?: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  isUploading?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label = 'Upload Document or Photo',
  accept = 'image/*,application/pdf',
  category = 'document',
  files = [],
  onUpload,
  onDelete,
  isUploading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    try {
      setProgress(25);
      const interval = setInterval(() => {
        setProgress((prev) => (prev && prev < 90 ? prev + 15 : prev));
      }, 150);

      await onUpload(file, category);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setProgress(null), 800);
    } catch {
      setProgress(null);
    }
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Drag & Drop Upload Zone */}
      <Paper
        elevation={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          p: 4,
          borderRadius: 3.5,
          border: `2px dashed ${dragOver ? '#2563EB' : '#CBD5E1'}`,
          bgcolor: dragOver ? '#EFF6FF' : '#F8FAFC',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.25s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: '#EFF6FF',
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#EFF6FF',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            mx: 'auto',
            mb: 1.5,
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 28 }} />
        </Box>

        <Typography variant="subtitle2" fontWeight={800} color="text.primary" gutterBottom>
          {label}
        </Typography>

        <Typography variant="caption" color="text.secondary" display="block">
          Drag and drop file here, or <b>browse computer</b> (PNG, JPG, PDF up to 10MB)
        </Typography>

        {(isUploading || progress !== null) && (
          <Box sx={{ mt: 2.5, width: '100%', maxWidth: 300, mx: 'auto' }}>
            <LinearProgress variant={progress !== null ? 'determinate' : 'indeterminate'} value={progress || 0} sx={{ borderRadius: 2 }} />
            <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ mt: 0.5, display: 'block' }}>
              Uploading media file...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Existing Uploaded Files List */}
      {files.length > 0 && (
        <Stack spacing={1.5} sx={{ mt: 2.5 }}>
          {files.map((file) => (
            <Paper
              key={file.id}
              elevation={0}
              sx={{
                p: 1.8,
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                bgcolor: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <InsertDriveFileIcon color="primary" fontSize="small" />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                    {file.name}
                  </Typography>
                  {file.category && (
                    <Chip label={file.category.toUpperCase()} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                  )}
                </Box>
              </Box>

              <Stack direction="row" spacing={1}>
                {file.url && (
                  <Tooltip title="View Media">
                    <IconButton size="small" component="a" href={file.url} target="_blank" rel="noreferrer">
                      <VisibilityIcon fontSize="small" color="action" />
                    </IconButton>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip title="Delete File">
                    <IconButton size="small" color="error" onClick={() => onDelete(file.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default MediaUploader;
