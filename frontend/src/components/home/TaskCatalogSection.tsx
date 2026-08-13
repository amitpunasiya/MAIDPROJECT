import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import IronIcon from '@mui/icons-material/Iron';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { Button } from '../Button';
import { serviceApi, ICatalogService } from '../../services/api';

interface TaskCatalogSectionProps {
  onBookTask: (taskName: string, estimatedPrice?: string) => void;
}

const DEFAULT_TASKS: Array<ICatalogService & { iconEmoji?: string }> = [
  {
    id: 't-1',
    name: 'Sweeping',
    description: 'Quick & thorough floor sweeping for all rooms',
    basePrice: 150,
    estimatedDurationMinutes: 30,
    iconEmoji: '🧹',
  },
  {
    id: 't-2',
    name: 'Mopping',
    description: 'Professional wet floor mopping and sanitizing',
    basePrice: 150,
    estimatedDurationMinutes: 30,
    iconEmoji: '🧽',
  },
  {
    id: 't-3',
    name: 'Dishwashing',
    description: 'Washing dishes, sink and kitchen counter cleanup',
    basePrice: 200,
    estimatedDurationMinutes: 30,
    iconEmoji: '🍽',
  },
  {
    id: 't-4',
    name: 'Bathroom Cleaning',
    description: 'Sanitize tiles, sink, toilet and complete bathroom',
    basePrice: 299,
    estimatedDurationMinutes: 45,
    iconEmoji: '🚿',
  },
  {
    id: 't-5',
    name: 'Laundry & Ironing',
    description: 'Washing, drying, clothing folding and steam ironing',
    basePrice: 200,
    estimatedDurationMinutes: 45,
    iconEmoji: '👕',
  },
  {
    id: 't-6',
    name: 'Cooking',
    description: 'Fresh authentic home cooked meal preparation',
    basePrice: 350,
    estimatedDurationMinutes: 60,
    iconEmoji: '👨‍🍳',
  },
  {
    id: 't-7',
    name: 'Kitchen Deep Clean',
    description: 'Countertops, stove, microwave & sink grease removal',
    basePrice: 399,
    estimatedDurationMinutes: 60,
    iconEmoji: '🍳',
  },
  {
    id: 't-8',
    name: 'Childcare Assistance',
    description: 'Attentive child supervision & activity care',
    basePrice: 400,
    estimatedDurationMinutes: 120,
    verificationRequired: true,
    skillsRequired: ['Police Verified', 'Certified Caregiver'],
    iconEmoji: '👶',
  },
  {
    id: 't-9',
    name: 'Elder Assistance',
    description: 'Compassionate elderly companion help & supervision',
    basePrice: 450,
    estimatedDurationMinutes: 120,
    verificationRequired: true,
    skillsRequired: ['Police Verified', 'Background Checked'],
    iconEmoji: '👵',
  },
];

export const TaskCatalogSection: React.FC<TaskCatalogSectionProps> = ({ onBookTask }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Array<ICatalogService & { iconEmoji?: string }>>(DEFAULT_TASKS);
  const [loading, setLoading] = useState(false);
  const [customRequestOpen, setCustomRequestOpen] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search against live API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTasks(DEFAULT_TASKS);
      return;
    }

    setLoading(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await serviceApi.searchServices(searchQuery.trim());
        const list = res.data || [];
        if (list.length > 0) {
          setTasks(list);
        } else {
          // Local filter fallback
          const filtered = DEFAULT_TASKS.filter(
            (t) =>
              t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setTasks(filtered);
        }
      } catch (_e) {
        const filtered = DEFAULT_TASKS.filter(
          (t) =>
            t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setTasks(filtered);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const categories = [
    { label: 'All Tasks', icon: <AutoAwesomeIcon fontSize="small" /> },
    { label: 'Cleaning', icon: <CleaningServicesIcon fontSize="small" /> },
    { label: 'Kitchen', icon: <RestaurantIcon fontSize="small" /> },
    { label: 'Laundry', icon: <IronIcon fontSize="small" /> },
    { label: 'Home Help', icon: <Inventory2Icon fontSize="small" /> },
    { label: 'Care', icon: <ChildCareIcon fontSize="small" /> },
  ];

  const filteredByTab = tasks.filter((t) => {
    if (selectedTab === 0) return true;
    const catLabel = categories[selectedTab]?.label.toLowerCase();
    if (!catLabel) return true;
    if (catLabel === 'cleaning') return t.name?.toLowerCase().includes('clean') || t.name?.toLowerCase().includes('sweep') || t.name?.toLowerCase().includes('mop');
    if (catLabel === 'kitchen') return t.name?.toLowerCase().includes('cook') || t.name?.toLowerCase().includes('dish') || t.name?.toLowerCase().includes('meal') || t.name?.toLowerCase().includes('kitchen');
    if (catLabel === 'laundry') return t.name?.toLowerCase().includes('laundry') || t.name?.toLowerCase().includes('wash') || t.name?.toLowerCase().includes('iron') || t.name?.toLowerCase().includes('fold');
    if (catLabel === 'home help') return t.name?.toLowerCase().includes('organiz') || t.name?.toLowerCase().includes('pack') || t.name?.toLowerCase().includes('general');
    if (catLabel === 'care') return t.verificationRequired || t.name?.toLowerCase().includes('child') || t.name?.toLowerCase().includes('elder') || t.name?.toLowerCase().includes('care');
    return true;
  });

  return (
    <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F8FAFC' }} id="task-catalog">
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 5 }}>
          <Typography
            variant="caption"
            fontWeight={800}
            color="primary.main"
            sx={{ letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1, display: 'block' }}
          >
            TASK-BASED SERVICE MARKETPLACE
          </Typography>
          <Typography variant="h3" fontWeight={900} color="text.primary" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            What do you need help with?
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            Book help for exactly the task you need — pay starting prices per task or hour.
          </Typography>
        </Box>

        {/* Task Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            px: 2.5,
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05)',
            maxWidth: 680,
            mx: 'auto',
            mb: 4,
          }}
        >
          <TextField
            fullWidth
            placeholder="What task do you need help with? (e.g. Dishwashing, Sweeping, Laundry)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" sx={{ mr: 1, fontSize: 24 }} />
                  </InputAdornment>
                ),
                endAdornment: loading ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Paper>

        {/* Category Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
          <Tabs
            value={selectedTab}
            onChange={(_e, val) => setSelectedTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                borderRadius: '20px',
                px: 2.5,
                py: 1,
                minHeight: 44,
                mr: 1,
                textTransform: 'none',
              },
            }}
          >
            {categories.map((c, idx) => (
              <Tab key={c.label} icon={c.icon} iconPosition="start" label={c.label} id={`task-tab-${idx}`} />
            ))}
          </Tabs>
        </Box>

        {/* Task Cards Grid */}
        {filteredByTab.length > 0 ? (
          <Grid2 container spacing={3}>
            {filteredByTab.map((t) => {
              const priceDisplay = t.startingPrice || (t.basePrice ? `₹${t.basePrice}` : '₹150');
              return (
                <Grid2 key={t.id || t._id || t.name} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: '1px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 16px 32px -8px rgba(37, 99, 235, 0.12)',
                        borderColor: '#2563EB',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          bgcolor: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                        }}
                      >
                        {t.iconEmoji || '🧹'}
                      </Box>

                      {t.verificationRequired ? (
                        <Chip
                          icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#16A34A !important' }} />}
                          label="Verified Staff Only"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      ) : (
                        <Chip label={`${t.estimatedDurationMinutes || 30} mins`} size="small" icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />} sx={{ bgcolor: '#F1F5F9', fontWeight: 700 }} />
                      )}
                    </Box>

                    <Typography variant="h6" fontWeight={800} gutterBottom>
                      {t.name || t.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1, minHeight: 40, lineHeight: 1.5 }}>
                      {t.description || t.shortDescription}
                    </Typography>

                    <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                          Starting from
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={900} color="primary.main">
                          {priceDisplay}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => onBookTask(t.name || t.title || 'Task Service', String(priceDisplay))}
                        endIcon={<ArrowForwardIcon />}
                        sx={{ borderRadius: '10px', fontWeight: 800, px: 2.5 }}
                      >
                        Book Now
                      </Button>
                    </Box>
                  </Paper>
                </Grid2>
              );
            })}
          </Grid2>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
              No specific task found for "{searchQuery}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Don't worry! You can request a custom household task assistant.
            </Typography>
            <Button variant="outlined" color="primary" onClick={() => setCustomRequestOpen(true)} startIcon={<SupportAgentIcon />}>
              Request Custom Household Task
            </Button>
          </Box>
        )}

        {/* Fallback Custom Task Request Banner */}
        <Paper
          elevation={0}
          sx={{
            mt: 6,
            p: 3,
            borderRadius: 4,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <SupportAgentIcon sx={{ fontSize: 36, color: '#60A5FA' }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Can't find your specific household task?
              </Typography>
              <Typography variant="body2" color="#94A3B8">
                Tell us what you need done and we will assign a qualified helper.
              </Typography>
            </Box>
          </Stack>

          <Button variant="contained" color="secondary" onClick={() => onBookTask('Custom Household Task', '₹200')} sx={{ fontWeight: 800, borderRadius: '10px' }}>
            Book Custom Task Assistance
          </Button>
        </Paper>

        {customRequestOpen && (
          <Alert severity="info" onClose={() => setCustomRequestOpen(false)} sx={{ mt: 2, borderRadius: 3 }}>
            Callback requested! Our team will contact you shortly to assign a verified helper for your custom task.
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default TaskCatalogSection;
