import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Customer } from '../models/customer.model.js';
import { Provider } from '../models/provider.model.js';
import { Booking } from '../models/booking.model.js';
import { Payment } from '../models/payment.model.js';
import { UserRole } from '../types/auth.types.js';
import { BookingStatus, ServiceType, Currency } from '../types/domain.enums.js';
import { logger } from '../utils/logger.js';

export const ensureAdminExists = async (): Promise<void> => {
  try {
    // 1. Seed Admin Accounts
    const adminAccounts = [
      {
        email: 'admin@maidproject.com',
        password: 'Admin@1234',
        name: 'Super Admin',
        phone: '+919000000000',
        role: UserRole.ADMIN,
      },
      {
        email: 'admin@maidapp.com',
        password: 'Admin@123456',
        name: 'Enterprise Admin',
        phone: '+919999999999',
        role: UserRole.SUPER_ADMIN,
      },
    ];

    for (const acc of adminAccounts) {
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(acc.password, 12);
        await User.create({
          name: acc.name,
          email: acc.email,
          phone: acc.phone,
          password: hashedPassword,
          role: acc.role,
          roles: [acc.role],
          isActive: true,
          isPhoneVerified: true,
          isEmailVerified: true,
          failedLoginAttempts: 0,
        });
        logger.info(`✅ Admin user seeded: ${acc.email}`);
      }
    }

    // 2. Seed Sample Customers if empty
    const customerCount = await User.countDocuments({ role: UserRole.CUSTOMER });
    if (customerCount === 0) {
      const defaultPass = await bcrypt.hash('User@1234', 10);
      const sampleCustomers = [
        { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+919876543210' },
        { name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+919876543211' },
        { name: 'Amit Verma', email: 'amit.verma@example.com', phone: '+919876543212' },
      ];

      for (const cust of sampleCustomers) {
        const u = await User.create({
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          password: defaultPass,
          role: UserRole.CUSTOMER,
          roles: [UserRole.CUSTOMER],
          isActive: true,
          isPhoneVerified: true,
          isEmailVerified: true,
        });
        await Customer.create({
          userId: u._id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          isActive: true,
        });
      }
      logger.info('✅ Sample customer accounts seeded.');
    }

    // 3. Seed Sample Providers if empty
    const providerCount = await Provider.countDocuments();
    if (providerCount === 0) {
      const defaultPass = await bcrypt.hash('Provider@1234', 10);
      const sampleProviders = [
        {
          name: 'Sunita Devi',
          email: 'sunita.cook@example.com',
          phone: '+919111111111',
          type: 'cook',
          rating: 4.9,
          experience: 6,
          city: 'Mumbai',
        },
        {
          name: 'Rajesh Kumar',
          email: 'rajesh.maid@example.com',
          phone: '+919222222222',
          type: 'maid',
          rating: 4.8,
          experience: 4,
          city: 'Delhi',
        },
        {
          name: 'Meena Kumari',
          email: 'meena.cook@example.com',
          phone: '+919333333333',
          type: 'cook',
          rating: 4.7,
          experience: 8,
          city: 'Bangalore',
          role: UserRole.PROVIDER,
        },
        {
          name: 'Dr. Ananya Roy (MPT)',
          email: 'ananya.physio@example.com',
          phone: '+919444444444',
          type: 'physiotherapist',
          rating: 4.9,
          experience: 7,
          city: 'Mumbai',
          role: UserRole.PHYSIOTHERAPIST,
          qualification: 'Master of Physiotherapy (MPT - Orthopedics)',
          specializations: ['Physiotherapy', 'Home Physiotherapy', 'Post-operative rehabilitation', 'Orthopedic rehabilitation', 'Sports rehabilitation'],
          fee: 800,
        },
        {
          name: 'Karan Malhotra (MOT)',
          email: 'karan.ot@example.com',
          phone: '+919555555555',
          type: 'occupational_therapist',
          rating: 4.8,
          experience: 5,
          city: 'Delhi',
          role: UserRole.OCCUPATIONAL_THERAPIST,
          qualification: 'Master of Occupational Therapy (MOT - Pediatrics)',
          specializations: ['Occupational Therapy', 'Pediatric occupational therapy', 'Activities of daily living training', 'Fine motor skills', 'Sensory integration'],
          fee: 850,
        },
        {
          name: 'Priya Sharma (Child Care Specialist)',
          email: 'priya.childcare@example.com',
          phone: '+919666666666',
          type: 'child_care_provider',
          rating: 4.9,
          experience: 6,
          city: 'Bangalore',
          role: UserRole.CHILD_CARE_PROVIDER,
          qualification: 'Diploma in Early Childhood Care & Education',
          specializations: ['Child Care', 'Infant Care', 'Baby Care', 'Toddler Care', 'Child Safety & Assistance'],
          fee: 450,
        },
        {
          name: 'Rajesh Verma (Elderly & Adult Care Specialist)',
          email: 'rajesh.adultcare@example.com',
          phone: '+919777777777',
          type: 'adult_care_provider',
          rating: 4.85,
          experience: 8,
          city: 'Mumbai',
          role: UserRole.ADULT_CARE_PROVIDER,
          qualification: 'Certified Geriatric & Daily Living Assistant',
          specializations: ['Adult Care', 'Elderly Care', 'Senior Citizen Assistance', 'Daily Living Assistance', 'Post-Hospital Care Support'],
          fee: 550,
        },
      ];

      for (const prov of sampleProviders) {
        const provRole = (prov as any).role || UserRole.PROVIDER;
        const u = await User.create({
          name: prov.name,
          email: prov.email,
          phone: prov.phone,
          password: defaultPass,
          role: provRole,
          roles: [provRole],
          isActive: true,
          isPhoneVerified: true,
          isEmailVerified: true,
        });

        await Provider.create({
          userId: u._id,
          fullName: prov.name,
          providerType: prov.type,
          gender: 'female',
          experienceYears: prov.experience,
          qualification: (prov as any).qualification || '',
          specializations: (prov as any).specializations || [],
          homeVisitAvailability: true,
          consultationFee: (prov as any).fee || 500,
          verificationStatus: 'APPROVED',
          kycStatus: 'VERIFIED',
          isAvailable: true,
          averageRating: prov.rating,
          totalRatings: 45,
          completedBookings: 120,
          location: { city: prov.city, state: 'State', currentAddress: 'Healthcare Clinic & Home Visits' },
          pricing: { hourlyPrice: (prov as any).fee || 500, dailyPrice: 2000, visitCharge: (prov as any).fee || 500 },
          documents: {
            aadhaarNumber: '998877665544',
            panNumber: 'ABCDE1234F',
            maskedIdentityNumber: 'XXXX-XXXX-5544',
            aadhaarDoc: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
            panDoc: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80',
          },
        });
      }
      logger.info('✅ Sample provider accounts (including Physiotherapist & Occupational Therapist) seeded.');
    }

    // 4. Seed Sample Bookings & Payments if empty
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      const customerUser = await User.findOne({ role: UserRole.CUSTOMER });
      const providerUser = await User.findOne({ role: UserRole.PROVIDER });

      if (customerUser && providerUser) {
        const b = await Booking.create({
          bookingNumber: 'BK-2026-001',
          customerId: customerUser._id,
          cookId: providerUser._id,
          serviceType: ServiceType.COOK,
          status: BookingStatus.COMPLETED,
          scheduledDate: new Date(),
          startTime: '09:00',
          endTime: '11:00',
          durationHours: 2,
          serviceAddress: { street: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
          pricing: { baseAmount: 3000, discountAmount: 200, taxAmount: 140, platformFee: 60, totalAmount: 3000, currency: Currency.INR },
          completedAt: new Date(),
        });

        await Payment.create({
          bookingId: b._id,
          customerId: customerUser._id,
          providerId: providerUser._id,
          amount: 3000,
          currency: 'INR',
          paymentStatus: 'paid',
          paymentMethod: 'upi',
          transactionId: 'TXN-9988776655',
        });

        logger.info('✅ Sample booking & payment records seeded.');
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn('Failed to ensure default admin user & sample metrics exist:', { error: msg });
  }
};
