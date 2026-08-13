import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  InputBase,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface GlobalSearchBarProps {
  placeholder?: string;
  fullWidth?: boolean;
  onSelectTask?: (taskName: string) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  placeholder = 'Search cooks, maids, workers, services, tasks or locations...',
  fullWidth = true,
  onSelectTask,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{
    providers: any[];
    services: any[];
    tasks: any[];
    locations: any[];
  }>({
    providers: [],
    services: [],
    tasks: [],
    locations: [],
  });

  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ providers: [], services: [], tasks: [], locations: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        const data = res.data?.data || res.data || {};
        setResults({
          providers: data.providers || [],
          services: data.services || [],
          tasks: data.tasks || [],
          locations: data.locations || [],
        });
        setOpen(true);
      } catch (_err) {
        setResults({ providers: [], services: [], tasks: [], locations: [] });
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setOpen(false);
  };

  const handleViewAll = () => {
    setOpen(false);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasResults =
    results.providers.length > 0 ||
    results.services.length > 0 ||
    results.tasks.length > 0 ||
    results.locations.length > 0;

  return (
    <Box ref={searchBoxRef} sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto', zIndex: 1200 }}>
      <Paper
        elevation={0}
        sx={{
          p: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          border: '1.5px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          transition: 'all 0.2s ease-in-out',
          '&:focus-within': {
            borderColor: '#2563EB',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)',
          },
        }}
      >
        <SearchIcon sx={{ color: '#64748B', mr: 1.5 }} />
        <InputBase
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleViewAll();
          }}
          fullWidth
          sx={{ fontSize: '0.95rem', fontWeight: 500 }}
        />
        {loading ? (
          <CircularProgress size={20} sx={{ color: '#2563EB', mr: 1 }} />
        ) : query ? (
          <IconButton size="small" onClick={handleClear}>
            <ClearIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Paper>

      {/* Categorized Dropdown Popup */}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            maxHeight: 480,
            overflowY: 'auto',
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            p: 1.5,
          }}
        >
          {!loading && !hasResults ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                No results found for "{query}"
              </Typography>
            </Box>
          ) : (
            <>
              {/* PROVIDERS CATEGORY */}
              {results.providers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ px: 1.5, letterSpacing: 0.8 }}>
                    PROVIDERS & WORKERS
                  </Typography>
                  <List dense disablePadding>
                    {results.providers.slice(0, 3).map((p) => (
                      <ListItem
                        key={p.id}
                        onClick={() => {
                          setOpen(false);
                          navigate(`/providers/${p.id}`);
                        }}
                        sx={{
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#F1F5F9' },
                          py: 1,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={p.avatar} alt={p.name} sx={{ bgcolor: '#2563EB', fontWeight: 700 }}>
                            {p.name?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" fontWeight={800}>
                                {p.name}
                              </Typography>
                              <Chip label={p.providerType} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              ⭐ {p.rating} • {p.totalJobs} jobs • {p.distanceKm} km away • {p.city}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* SERVICES CATEGORY */}
              {results.services.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ px: 1.5, letterSpacing: 0.8 }}>
                    SERVICES
                  </Typography>
                  <List dense disablePadding>
                    {results.services.slice(0, 3).map((s) => (
                      <ListItem
                        key={s.id}
                        onClick={() => {
                          setOpen(false);
                          if (onSelectTask) {
                            onSelectTask(s.name);
                          } else {
                            navigate(`/search?q=${encodeURIComponent(s.name)}`);
                          }
                        }}
                        sx={{
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#F1F5F9' },
                          py: 0.75,
                        }}
                      >
                        <CleaningServicesIcon sx={{ color: '#2563EB', mr: 1.5, fontSize: 20 }} />
                        <ListItemText
                          primary={<Typography variant="subtitle2" fontWeight={700}>{s.name}</Typography>}
                          secondary={`Starting from ₹${s.basePrice} • ${s.categoryName}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* TASKS CATEGORY */}
              {results.tasks.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ px: 1.5, letterSpacing: 0.8 }}>
                    HOUSEHOLD TASKS
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1.5, pt: 1 }}>
                    {results.tasks.slice(0, 4).map((t) => (
                      <Chip
                        key={t.id}
                        label={t.taskName}
                        size="small"
                        onClick={() => {
                          setOpen(false);
                          if (onSelectTask) onSelectTask(t.taskName);
                          else navigate(`/search?q=${encodeURIComponent(t.taskName)}`);
                        }}
                        sx={{ bgcolor: '#EFF6FF', color: '#1E40AF', fontWeight: 700, cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* LOCATIONS CATEGORY */}
              {results.locations.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ px: 1.5, letterSpacing: 0.8 }}>
                    LOCATIONS
                  </Typography>
                  <List dense disablePadding>
                    {results.locations.slice(0, 3).map((l) => (
                      <ListItem
                        key={l.id}
                        onClick={() => {
                          setOpen(false);
                          navigate(`/search?q=${encodeURIComponent(l.city)}`);
                        }}
                        sx={{
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#F1F5F9' },
                          py: 0.75,
                        }}
                      >
                        <LocationOnIcon sx={{ color: '#E11D48', mr: 1.5, fontSize: 20 }} />
                        <ListItemText
                          primary={<Typography variant="subtitle2" fontWeight={700}>{l.city}</Typography>}
                          secondary={`${l.state}, ${l.country}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* VIEW ALL RESULTS LINK */}
              <Box
                onClick={handleViewAll}
                sx={{
                  p: 1.5,
                  mt: 1,
                  bgcolor: '#F8FAFC',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  cursor: 'pointer',
                  color: '#2563EB',
                  '&:hover': { bgcolor: '#EFF6FF' },
                }}
              >
                <Typography variant="subtitle2" fontWeight={800}>
                  View all results for "{query}"
                </Typography>
                <ArrowForwardIcon fontSize="small" />
              </Box>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default GlobalSearchBar;
