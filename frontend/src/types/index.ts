export enum UserRole {
  CUSTOMER = 'customer',
  COOK = 'cook',
  MAID = 'maid',
  PROVIDER = 'provider',
  PHYSIOTHERAPIST = 'physiotherapist',
  OCCUPATIONAL_THERAPIST = 'occupational_therapist',
  CHILD_CARE_PROVIDER = 'child_care_provider',
  ADULT_CARE_PROVIDER = 'adult_care_provider',
  ADMIN = 'admin',
}

export enum ServiceType {
  COOK = 'cook',
  MAID = 'maid',
  BOTH = 'both',
  BABYSITTER = 'babysitter',
  CLEANER = 'cleaner',
  ELDER_CARE = 'eldercare',
  LAUNDRY = 'laundry',
  DRIVER = 'driver',
  PHYSIOTHERAPY = 'physiotherapy',
  OCCUPATIONAL_THERAPY = 'occupational_therapy',
  CHILD_CARE = 'child_care',
  ADULT_CARE = 'adult_care',
  OTHER = 'other',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roles?: UserRole[];
  avatar?: string;
  city?: string;
}

export interface IProviderReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ICookProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  bio: string;
  experienceYears: number;
  serviceTypes: ServiceType[];
  skills: string[];
  languages: string[];
  averageRating: number;
  totalRatings: number;
  completedBookings: number;
  isAvailable: boolean;
  hourlyRate: number;
  monthlyRate: number;
  city: string;
  area: string;
  gender: 'Male' | 'Female';
  verified: boolean;
  distance?: string;
  gallery?: string[];
  certificates?: string[];
  availableSlots?: string[];
  reviewsList?: IProviderReview[];
  createdAt?: string;
}

export interface IMaidProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  bio: string;
  experienceYears: number;
  services: string[];
  skills?: string[];
  languages: string[];
  averageRating: number;
  totalRatings: number;
  completedBookings: number;
  isAvailable: boolean;
  hourlyRate: number;
  monthlyRate: number;
  city: string;
  area: string;
  gender: 'Male' | 'Female';
  verified: boolean;
  distance?: string;
  gallery?: string[];
  certificates?: string[];
  availableSlots?: string[];
  reviewsList?: IProviderReview[];
  createdAt?: string;
}

export type IUnifiedProvider = (ICookProfile | IMaidProfile) & {
  type: 'cook' | 'maid';
};

export interface IBookingRecord {
  id: string;
  bookingIdNumber: string;
  serviceType: 'cook' | 'maid';
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  date: string;
  timeSlot: string;
  workingHours: number;
  slotType?: 'PREDEFINED' | 'CUSTOM';
  specialInstructions?: string;
  paymentMethod: 'upi' | 'card' | 'debit' | 'cash';
  paymentStatus: 'paid' | 'pending';
  serviceCharge: number;
  platformFee: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
}

export type IBooking = IBookingRecord;

export interface ICustomerReview {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  serviceType: string;
  comment: string;
  date: string;
}

export interface ISearchFilters {
  city?: string;
  serviceType?: string;
  date?: string;
  timeSlot?: string;
  keyword?: string;
  minExperience?: number;
  minRating?: number;
  gender?: string;
  languages?: string[];
  priceRange?: [number, number];
  availableOnly?: boolean;
  verifiedOnly?: boolean;
  sortBy?: string;
}

export interface IBookingSearchFilters {
  serviceType: string;
  city: string;
  date?: string;
  timeSlot?: string;
}
