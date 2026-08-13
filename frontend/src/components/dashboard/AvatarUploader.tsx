import React, { useRef, useState } from 'react';
import { Box, Avatar, IconButton, CircularProgress, Tooltip } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

export interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  userName?: string;
  size?: number;
  onAvatarUpload: (file: File) => Promise<void> | void;
  onAvatarRemove?: () => void;
  isLoading?: boolean;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  userName = 'User',
  size = 120,
  onAvatarUpload,
  onAvatarRemove,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local Preview URL
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    try {
      setUploading(true);
      await onAvatarUpload(file);
    } catch {
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Avatar
        src={displayUrl}
        alt={userName}
        sx={{
          width: size,
          height: size,
          border: '4px solid #FFFFFF',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          bgcolor: 'primary.main',
          fontSize: `${size / 3}px`,
          fontWeight: 800,
        }}
      >
        {userName.charAt(0).toUpperCase()}
      </Avatar>

      {(isLoading || uploading) && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            bgcolor: 'rgba(15, 23, 42, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            color: '#FFF',
          }}
        >
          <CircularProgress size={size / 3} color="inherit" />
        </Box>
      )}

      {/* Camera Action Button */}
      <Tooltip title="Upload Profile Picture">
        <IconButton
          onClick={handleTriggerClick}
          disabled={isLoading || uploading}
          sx={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            bgcolor: 'primary.main',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            '&:hover': { bgcolor: 'primary.dark' },
            p: 1,
          }}
        >
          <PhotoCameraIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      {displayUrl && onAvatarRemove && (
        <Tooltip title="Remove Avatar">
          <IconButton
            onClick={onAvatarRemove}
            size="small"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'error.main',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              '&:hover': { bgcolor: 'error.dark' },
              p: 0.6,
            }}
          >
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default AvatarUploader;
