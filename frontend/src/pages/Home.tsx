import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import {
  HeroSection,
  MainServicesSection,
  TaskCatalogSection,
  PopularServicesSection,
  WhyChooseUsSection,
  HowItWorksSection,
  FeaturedProvidersSection,
  CustomerReviewsSection,
  FaqSection,
  QuickBookingDialog,
  TaskBookingDialog,
} from '../components';
import { IMainServiceCard, IPopularService } from '../services/mockData';
import { ICookProfile, IMaidProfile } from '../types';
import { useAppDispatch } from '../hooks/useAppStore';
import { getCategories, getProviders } from '../store/serviceSlice';

export const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string>('Home Care Service');
  const [selectedProviderName, setSelectedProviderName] = useState<string | undefined>(undefined);
  const [selectedPrice, setSelectedPrice] = useState<string>('₹250/hr');

  useEffect(() => {
    // Fetch live categories and featured top providers on Home mount
    void dispatch(getCategories());
    void dispatch(getProviders({ limit: 6, sortBy: 'rating' }));
  }, [dispatch]);

  const handleOpenBookingForMainService = (service: IMainServiceCard) => {
    setSelectedServiceTitle(service.title);
    setSelectedProviderName(undefined);
    setSelectedPrice(service.startingPrice);
    setBookingDialogOpen(true);
  };

  const handleOpenBookingForPopularService = (service: IPopularService) => {
    setSelectedServiceTitle(service.title);
    setSelectedProviderName(undefined);
    setSelectedPrice(service.price);
    setBookingDialogOpen(true);
  };

  const handleOpenBookingForProvider = (provider: ICookProfile | IMaidProfile, type: 'cook' | 'maid') => {
    setSelectedServiceTitle(type === 'cook' ? 'Home Chef Service' : 'Housekeeping Maid Service');
    setSelectedProviderName(provider.name);
    setSelectedPrice(`₹${provider.hourlyRate}/hr`);
    setBookingDialogOpen(true);
  };

  const handleQuickBookFromHero = () => {
    setSelectedServiceTitle('Cook & Maid Instant Booking');
    setSelectedProviderName(undefined);
    setSelectedPrice('₹250/hr');
    setBookingDialogOpen(true);
  };

  const handleOpenTaskBooking = (taskName: string, estimatedPrice?: string) => {
    setSelectedServiceTitle(taskName);
    setSelectedPrice(estimatedPrice || '₹200');
    setTaskDialogOpen(true);
  };

  return (
    <Box sx={{ overflowX: 'hidden', bgcolor: 'background.default' }}>
      {/* 1. HERO SECTION */}
      <HeroSection onQuickBookClick={handleQuickBookFromHero} />

      {/* 2. CORE SERVICES SECTION (Cook, Maid, Cook+Maid Combo) */}
      <MainServicesSection onBookServiceClick={handleOpenBookingForMainService} />

      {/* 3. TASK-BASED SERVICE MARKETPLACE (Task Catalog Discovery) */}
      <TaskCatalogSection onBookTask={handleOpenTaskBooking} />

      {/* 4. POPULAR SERVICES SECTION */}
      <PopularServicesSection onBookPopularService={handleOpenBookingForPopularService} />

      {/* 4. WHY CHOOSE US SECTION */}
      <WhyChooseUsSection />

      {/* 5. HOW IT WORKS SECTION (TIMELINE UI) */}
      <HowItWorksSection />

      {/* 6. FEATURED PROVIDERS SECTION */}
      <FeaturedProvidersSection onBookProvider={handleOpenBookingForProvider} />

      {/* 7. CUSTOMER REVIEWS CAROUSEL */}
      <CustomerReviewsSection />

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <FaqSection />

      {/* REUSABLE CORE BOOKING DIALOG MODAL */}
      <QuickBookingDialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        serviceTitle={selectedServiceTitle}
        providerName={selectedProviderName}
        estimatedPrice={selectedPrice}
      />

      {/* TASK-SPECIFIC BOOKING DIALOG MODAL */}
      <TaskBookingDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        taskName={selectedServiceTitle}
        estimatedPrice={selectedPrice}
      />
    </Box>
  );
};

export default Home;
