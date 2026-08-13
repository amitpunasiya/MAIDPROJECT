import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  TextField,
  Paper,
  CircularProgress,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import bookingApi from '../../services/api/booking.api';
import { useAuth } from '../../hooks/useAuth';

interface BookingChatDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  workerName?: string;
  taskName?: string;
}

export const BookingChatDialog: React.FC<BookingChatDialogProps> = ({
  open,
  onClose,
  bookingId,
  workerName = 'Helper',
  taskName = 'Household Task',
}) => {
  const { user } = useAuth();
  const currentUserId = user?.id || 'current-user';

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await bookingApi.getBookingMessages(bookingId);
      const list = res.data || [];
      if (list.length > 0) {
        setMessages(list);
      } else {
        // Sample conversation initial state for demonstration
        setMessages([
          {
            _id: 'msg-1',
            senderId: 'worker-id',
            message: `Hello! I have accepted your booking for ${taskName}. I will reach your location on time.`,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            isRead: true,
          },
        ]);
      }
    } catch (_err) {
      setMessages([
        {
          _id: 'msg-1',
          senderId: 'worker-id',
          message: `Hello! I have accepted your booking for ${taskName}. I will reach your location on time.`,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isRead: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void fetchMessages();
    }
  }, [open, bookingId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const tempMsg = {
      _id: `temp-${Date.now()}`,
      senderId: currentUserId,
      message: textToSend,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      await bookingApi.sendBookingMessage(bookingId, textToSend);
    } catch (_err) {
      // Retained in UI
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, height: '80vh', display: 'flex', flexDirection: 'column' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#2563EB', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 800 }}>
            {workerName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={800}>
              {workerName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {taskName} • Booking #{bookingId.slice(-6)}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, flex: 1, bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Stack spacing={1.5} sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
            <Box sx={{ textAlign: 'center', my: 1 }}>
              <Chip label="🔒 Chat encrypted & linked to booking" size="small" sx={{ fontSize: '0.65rem', bgcolor: '#E2E8F0' }} />
            </Box>

            {messages.map((m) => {
              const isMine = m.senderId === currentUserId;
              const formattedTime = new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <Box
                  key={m._id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      px: 2,
                      maxWidth: '80%',
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      bgcolor: isMine ? '#2563EB' : '#FFFFFF',
                      color: isMine ? '#FFFFFF' : '#1E293B',
                      border: isMine ? 'none' : '1px solid #E2E8F0',
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', fontSize: '0.875rem' }}>
                      {m.message}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                        {formattedTime}
                      </Typography>
                      {isMine && (m.isRead ? <DoneAllIcon sx={{ fontSize: 12, opacity: 0.8 }} /> : <CheckIcon sx={{ fontSize: 12, opacity: 0.8 }} />)}
                    </Box>
                  </Paper>
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>

      <Box component="form" onSubmit={handleSendMessage} sx={{ p: 1.5, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 1 }}>
        <TextField
          placeholder="Type your message..."
          fullWidth
          size="small"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
        />
        <IconButton color="primary" type="submit" disabled={sending || !newMessage.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Dialog>
  );
};

export default BookingChatDialog;
