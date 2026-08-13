export enum ServiceType {
  COOK = 'cook',
  MAID = 'maid',
  BOTH = 'both',
}

export enum BookingStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  CONFIRMED = 'confirmed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
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
