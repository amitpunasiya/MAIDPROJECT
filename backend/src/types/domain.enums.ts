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
  OCCUPATIONAL_THERAPIST = 'occupational_therapy',
  OCCUPATIONAL_THERAPY = 'occupational_therapy',
  CHILD_CARE = 'child_care',
  ADULT_CARE = 'adult_care',
  OTHER = 'other',
}

export enum ServiceCategory {
  COOK = 'COOK',
  MAID = 'MAID',
  BABYSITTER = 'BABYSITTER',
  HOUSEHOLD_TASK = 'HOUSEHOLD_TASK',
  HEALTHCARE = 'HEALTHCARE',
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
  OCCUPATIONAL_THERAPIST = 'OCCUPATIONAL_THERAPY',
  OCCUPATIONAL_THERAPY = 'OCCUPATIONAL_THERAPY',
  CHILD_CARE = 'CHILD_CARE',
  ADULT_CARE = 'ADULT_CARE',
}

export enum KYCStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  RESUBMISSION_REQUESTED = 'RESUBMISSION_REQUESTED',
}

export const PHYSIOTHERAPY_SPECIALIZATIONS = [
  'Physiotherapy',
  'Home Physiotherapy',
  'Post-operative rehabilitation',
  'Orthopedic rehabilitation',
  'Sports rehabilitation',
  'Neurological rehabilitation',
  'Geriatric rehabilitation',
  'Pediatric physiotherapy',
  'Pain Management',
  'Mobility & Strength Training',
  'Other specializations',
];

export const OCCUPATIONAL_THERAPIST_SPECIALIZATIONS = [
  'Occupational Therapy',
  'Pediatric occupational therapy',
  'Neurological occupational therapy',
  'Activities of daily living training',
  'Functional rehabilitation',
  'Fine motor skills',
  'Sensory integration',
  'Cognitive rehabilitation',
  'Hand Therapy',
  'Developmental Therapy',
  'Other specializations',
];

export const OCCUPATIONAL_THERAPY_SPECIALIZATIONS = OCCUPATIONAL_THERAPIST_SPECIALIZATIONS;

export const CHILD_CARE_SPECIALIZATIONS = [
  'Child Care',
  'Infant Care',
  'Baby Care',
  'Toddler Care',
  'Child Supervision',
  'Child Safety & Assistance',
  'School-age Child Care',
  'Special Needs Child Care',
  'Day Care / Home Child Care',
  'Other specializations',
];

export const ADULT_CARE_SPECIALIZATIONS = [
  'Adult Care',
  'Elderly Care',
  'Senior Citizen Assistance',
  'Daily Living Assistance',
  'Personal Care Assistance',
  'Mobility Assistance',
  'Companionship',
  'Home Support',
  'Post-Hospital Care Support',
  'Other specializations',
];

export enum BookingStatus {
  PENDING = 'pending',
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  ASSIGNED = 'assigned',
  PROVIDER_ASSIGNED = 'provider_assigned',
  CONFIRMED = 'confirmed',
  ACCEPTED = 'accepted',
  PROVIDER_ACCEPTED = 'provider_accepted',
  REJECTED = 'rejected',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  OTP_VERIFICATION_PENDING = 'otp_verification_pending',
  STARTED = 'started',
  WORK_STARTED = 'work_started',
  WORK_COMPLETED = 'work_completed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum BookingSlotStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  BLOCKED = 'blocked',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum SubscriptionPlanType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  RAZORPAY = 'razorpay',
  WALLET = 'wallet',
  COD = 'cod',
}

export enum WalletOwnerType {
  CUSTOMER = 'customer',
  COOK = 'cook',
  MAID = 'maid',
  PROVIDER = 'provider',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionReferenceType {
  BOOKING = 'booking',
  PAYMENT = 'payment',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
  TOPUP = 'topup',
  SUBSCRIPTION = 'subscription',
  ADJUSTMENT = 'adjustment',
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum DocumentType {
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  CERTIFICATE = 'certificate',
  PHOTO = 'photo',
  ADDRESS_PROOF = 'address_proof',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  WITHDRAWAL_UPDATE = 'withdrawal_update',
  REVIEW_REQUEST = 'review_request',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  VOID = 'void',
  OVERDUE = 'overdue',
}

export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum SupportTicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SupportTicketCategory {
  BOOKING = 'booking',
  PAYMENT = 'payment',
  ACCOUNT = 'account',
  PROVIDER = 'provider',
  TECHNICAL = 'technical',
  OTHER = 'other',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  SOFT_DELETE = 'soft_delete',
  RESTORE = 'restore',
  LOGIN = 'login',
  LOGOUT = 'logout',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum Currency {
  INR = 'INR',
}
