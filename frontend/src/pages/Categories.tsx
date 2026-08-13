import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid2,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ElderlyIcon from '@mui/icons-material/Elderly';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import KitchenIcon from '@mui/icons-material/Kitchen';
import { useNavigate } from 'react-router-dom';

export interface ICategoryCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactElement;
  image: string;
  startingPrice: string;
  activeStaffCount: number;
  popularServices: string[];
  routeCategory: string;
}

export const MOCK_CATEGORIES_DATA: ICategoryCard[] = [
  {
    id: 'cook',
    title: 'Professional Home Cook',
    subtitle: 'Daily Meals & Regional Cuisine Chefs',
    description: 'Expert cooks for daily breakfast, lunch, and dinner thalis. Customized North/South Indian, Gujarati, Jain, Keto & party menus.',
    icon: <RestaurantIcon sx={{ fontSize: 32, color: '#2563EB' }} />,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹250 / hr',
    activeStaffCount: 1450,
    popularServices: ['Daily Meal Cook', 'North & South Indian', 'Party Chef', 'Dietary/Jain Cooking'],
    routeCategory: 'cook',
  },
  {
    id: 'maid',
    title: 'Trusted House Maid',
    subtitle: 'Floor Sweeping, Mopping & Utensil Cleaning',
    description: 'Police-verified housemaids for daily sweeping, mopping, utensil washing, bathroom sanitization, and laundry maintenance.',
    icon: <CleaningServicesIcon sx={{ fontSize: 32, color: '#0D9488' }} />,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹180 / hr',
    activeStaffCount: 2200,
    popularServices: ['Daily Housemaid', 'Utensil Cleaning', 'Dusting & Mopping', 'Monthly Maid Subscription'],
    routeCategory: 'maid',
  },
  {
    id: 'baby_sitter',
    title: 'Babysitter & Nanny',
    subtitle: 'Gentle & Certified Child Caretaker',
    description: 'Trained and background-checked nannies for infant care, toddler Supervision, after-school activity support, and evening babysitting.',
    icon: <ChildCareIcon sx={{ fontSize: 32, color: '#EC4899' }} />,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹300 / hr',
    activeStaffCount: 680,
    popularServices: ['Infant Care', 'Full Day Nanny', 'After School Care', 'Weekend Babysitting'],
    routeCategory: 'baby_sitter',
  },
  {
    id: 'elder_care',
    title: 'Elder Care & Companion',
    subtitle: 'Empathetic Senior Citizen Assistance',
    description: 'Compassionate caretakers for elderly family members, offering mobility support, medicine reminders, companionship, and daily assistance.',
    icon: <ElderlyIcon sx={{ fontSize: 32, color: '#8B5CF6' }} />,
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹350 / hr',
    activeStaffCount: 420,
    popularServices: ['Senior Assistance', '24x7 Elder Care', 'Medicine Tracking', 'Companion Care'],
    routeCategory: 'elder_care',
  },
  {
    id: 'patient_care',
    title: 'Patient Care Provider',
    subtitle: 'Attendant & Health Recovery',
    description: 'Qualified attendants for post-surgery recovery, bedridden patient support, vital monitoring, and home nursing help.',
    icon: <ElderlyIcon sx={{ fontSize: 32, color: '#EF4444' }} />,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹400 / hr',
    activeStaffCount: 310,
    popularServices: ['Post-Op Attendant', 'Bedridden Care', 'Vital Checks', 'Night Shift Care'],
    routeCategory: 'patient_care',
  },
  {
    id: 'cleaner',
    title: 'Home Cleaner',
    subtitle: 'Deep House Sanitization & Scrubbing',
    description: 'Deep cleaning experts utilizing industrial vacuuming, tile scrubbing, kitchen degreasing, sofa shampooing, and bathroom sanitization.',
    icon: <AutoAwesomeIcon sx={{ fontSize: 32, color: '#06B6D4' }} />,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹1,499 / session',
    activeStaffCount: 890,
    popularServices: ['Full Home Deep Clean', 'Kitchen Degreasing', 'Bathroom Scrubbing', 'Sofa Shampooing'],
    routeCategory: 'cleaner',
  },
  {
    id: 'gardener',
    title: 'Gardener & Lawn Care',
    subtitle: 'Plant Trimming, Pruning & Potting',
    description: 'Expert gardeners for balcony garden setup, lawn mowing, hedge trimming, organic fertilizing, and seasonal plant maintenance.',
    icon: <KitchenIcon sx={{ fontSize: 32, color: '#10B981' }} />,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹200 / hr',
    activeStaffCount: 380,
    popularServices: ['Balcony Garden Setup', 'Lawn Mowing', 'Plant Pruning', 'Organic Soil Prep'],
    routeCategory: 'gardener',
  },
  {
    id: 'laundry',
    title: 'Laundry & Steam Ironing',
    subtitle: 'Washing, Pressing & Wardrobe Setup',
    description: 'Dedicated staff for washing delicates, machine washing, crisp steam ironing, bed linen changing, and neat wardrobe organization.',
    icon: <LocalLaundryServiceIcon sx={{ fontSize: 32, color: '#3B82F6' }} />,
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹150 / hr',
    activeStaffCount: 1100,
    popularServices: ['Steam Ironing', 'Daily Washing', 'Wardrobe Arrangement', 'Curtain & Linen Wash'],
    routeCategory: 'laundry',
  },
  {
    id: 'home_helper',
    title: 'General Home Helper',
    subtitle: 'Grocery Errands & Heavy Lifting',
    description: 'Versatile home assistants for grocery shopping, package pickup, furniture moving, event setup, and general household tasks.',
    icon: <KitchenIcon sx={{ fontSize: 32, color: '#6366F1' }} />,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹170 / hr',
    activeStaffCount: 540,
    popularServices: ['Grocery Errands', 'Furniture Assembly', 'Event Setup', 'Heavy Lifting'],
    routeCategory: 'home_helper',
  },
  {
    id: 'other',
    title: 'Other Home Services',
    subtitle: 'Custom Assistance & Special Requests',
    description: 'Flexible, verified home help professionals available for tailored household requirements and specialized home services.',
    icon: <KitchenIcon sx={{ fontSize: 32, color: '#F59E0B' }} />,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    startingPrice: '₹200 / hr',
    activeStaffCount: 290,
    popularServices: ['Custom Home Help', 'Event Assistance', 'Specialized Care', 'On-Demand Help'],
    routeCategory: 'other',
  },
];

export const Categories: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header Title Banner */}
        <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 700, mx: 'auto' }}>
          <Chip label="OUR SERVICE CATEGORIES" color="primary" sx={{ fontWeight: 800, mb: 1.5 }} />
          <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            Explore Verified Home Staff Categories
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
            Select a service category below to view verified staff profiles, transparent rates, and customer reviews.
          </Typography>
        </Box>

        {/* Categories Grid */}
        <Grid2 container spacing={4}>
          {MOCK_CATEGORIES_DATA.map((cat) => (
            <Grid2 key={cat.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Paper
                elevation={0}
                onClick={() => navigate(`/services?category=${cat.routeCategory}`)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px -6px rgba(15, 23, 42, 0.12)',
                    borderColor: '#2563EB',
                    '& .cat-card-img': {
                      transform: 'scale(1.08)',
                    },
                  },
                }}
              >
                {/* Image Cover */}
                <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                  <Box
                    className="cat-card-img"
                    component="img"
                    src={cat.image}
                    alt={cat.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 60%)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    {cat.icon}
                  </Box>
                  <Chip
                    label={`${cat.activeStaffCount}+ Verified`}
                    size="small"
                    sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(15,23,42,0.85)', color: '#FFF', fontWeight: 800 }}
                  />
                </Box>

                {/* Card Content Body */}
                <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="text.primary" lineHeight={1.2} gutterBottom>
                      {cat.title}
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                      {cat.subtitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5, fontSize: '0.85rem' }}>
                      {cat.description}
                    </Typography>

                    {/* Popular Tags */}
                    <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                      {cat.popularServices.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} variant="outlined" size="small" sx={{ fontSize: '0.65rem', fontWeight: 600 }} />
                      ))}
                    </Stack>
                  </Box>

                  {/* Pricing Footer CTA */}
                  <Box
                    sx={{
                      pt: 1.5,
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                        Starting From
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                        {cat.startingPrice}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        bgcolor: '#F1F5F9',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </Box>
  );
};

export default Categories;
