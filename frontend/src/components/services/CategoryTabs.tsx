import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AppsIcon from '@mui/icons-material/Apps';
import { ServiceCategory } from '../../store/serviceSlice';

interface CategoryTabsProps {
  selectedCategory?: ServiceCategory;
  activeCategory?: ServiceCategory;
  onCategoryChange: (category: ServiceCategory) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  activeCategory,
  onCategoryChange,
}) => {
  const currentCategory = activeCategory || selectedCategory || 'all';

  const categories: { label: string; value: ServiceCategory; icon: React.ReactElement }[] = [
    { label: 'All Services', value: 'all', icon: <AppsIcon fontSize="small" /> },
    { label: 'Home Cooks', value: 'cook', icon: <RestaurantIcon fontSize="small" /> },
    { label: 'House Maids', value: 'maid', icon: <CleaningServicesIcon fontSize="small" /> },
    { label: 'Cook + Maid Combo', value: 'combo', icon: <HandshakeIcon fontSize="small" /> },
    { label: 'Deep Cleaning', value: 'cleaning', icon: <AutoAwesomeIcon fontSize="small" /> },
    { label: 'Health Care', value: 'healthcare', icon: <MedicalServicesIcon fontSize="small" /> },
  ];

  return (
    <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={currentCategory}
        onChange={(_, val) => onCategoryChange(val as ServiceCategory)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          '& .MuiTab-root': {
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            minHeight: 48,
          },
        }}
      >
        {categories.map((cat) => (
          <Tab
            key={cat.value}
            value={cat.value}
            label={cat.label}
            icon={cat.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default CategoryTabs;
