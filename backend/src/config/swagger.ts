import type { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from './env.js';

const bearerAuth = {
  type: 'http' as const,
  scheme: 'bearer',
  bearerFormat: 'JWT',
};

const errorResponse = {
  type: 'object' as const,
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string' },
    errors: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  },
};

const successEnvelope = (dataSchema: Record<string, unknown>) => ({
  type: 'object' as const,
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' },
    data: dataSchema,
  },
});

const userSchema = {
  type: 'object' as const,
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    name: { type: 'string', example: 'Jane Doe' },
    email: { type: 'string', format: 'email', example: 'jane@example.com' },
    phone: { type: 'string', example: '+919876543210' },
    role: { type: 'string', enum: ['customer', 'cook', 'maid', 'admin'], example: 'customer' },
    isPhoneVerified: { type: 'boolean', example: false },
    isEmailVerified: { type: 'boolean', example: false },
    isActive: { type: 'boolean', example: true },
    avatar: { type: 'string', format: 'uri', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const addressSchema = {
  type: 'object' as const,
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    customer: { type: 'string', example: '507f1f77bcf86cd799439011' },
    fullName: { type: 'string', example: 'John Doe' },
    mobile: { type: 'string', example: '+919876543210' },
    houseNo: { type: 'string', example: 'A-102' },
    floor: { type: 'string', example: '1st Floor' },
    landmark: { type: 'string', example: 'Near Metro Station' },
    addressLine1: { type: 'string', example: 'MG Road' },
    addressLine2: { type: 'string', example: 'Indiranagar' },
    city: { type: 'string', example: 'Bengaluru' },
    state: { type: 'string', example: 'Karnataka' },
    country: { type: 'string', example: 'India' },
    pincode: { type: 'string', example: '560038' },
    latitude: { type: 'number', example: 12.9716 },
    longitude: { type: 'number', example: 77.5946 },
    addressType: { type: 'string', enum: ['Home', 'Office', 'Other'], example: 'Home' },
    isDefault: { type: 'boolean', example: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const authTokensSchema = {
  type: 'object' as const,
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
    expiresIn: { type: 'string', example: '15m' },
  },
};

const cookSchema = {
  type: 'object' as const,
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    userId: { $ref: '#/components/schemas/User' },
    bio: { type: 'string', example: 'Specialist in North & South Indian dishes' },
    experienceYears: { type: 'number', example: 5 },
    serviceTypes: { type: 'array', items: { type: 'string', enum: ['cook', 'maid', 'both'] }, example: ['cook'] },
    skills: { type: 'array', items: { type: 'string' }, example: ['North Indian', 'South Indian', 'Baking'] },
    languages: { type: 'array', items: { type: 'string' }, example: ['Hindi', 'English'] },
    verificationStatus: { type: 'string', enum: ['pending', 'verified', 'rejected'], example: 'verified' },
    averageRating: { type: 'number', example: 4.8 },
    totalRatings: { type: 'number', example: 25 },
    totalBookings: { type: 'number', example: 40 },
    completedBookings: { type: 'number', example: 38 },
    isAvailable: { type: 'boolean', example: true },
    isFeatured: { type: 'boolean', example: false },
    hourlyRate: { type: 'number', example: 250 },
    currency: { type: 'string', example: 'INR' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const maidSchema = {
  type: 'object' as const,
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
    userId: { $ref: '#/components/schemas/User' },
    bio: { type: 'string', example: 'Professional home cleaning and housekeeping maid' },
    experienceYears: { type: 'number', example: 4 },
    services: { type: 'array', items: { type: 'string' }, example: ['cleaning', 'dusting', 'utensil_washing', 'laundry'] },
    skills: { type: 'array', items: { type: 'string' }, example: ['Deep Cleaning', 'Sanitization'] },
    languages: { type: 'array', items: { type: 'string' }, example: ['Hindi', 'Kannada'] },
    verificationStatus: { type: 'string', enum: ['pending', 'verified', 'rejected'], example: 'verified' },
    averageRating: { type: 'number', example: 4.7 },
    totalRatings: { type: 'number', example: 18 },
    totalBookings: { type: 'number', example: 30 },
    completedBookings: { type: 'number', example: 29 },
    isAvailable: { type: 'boolean', example: true },
    isFeatured: { type: 'boolean', example: false },
    hourlyRate: { type: 'number', example: 200 },
    currency: { type: 'string', example: 'INR' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const bookingSchema = {
  type: 'object' as const,
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
    bookingNumber: { type: 'string', example: 'BK-20260731-1234' },
    customerId: { $ref: '#/components/schemas/User' },
    cookId: { $ref: '#/components/schemas/User' },
    serviceType: { type: 'string', enum: ['cook', 'maid', 'both'], example: 'cook' },
    status: { type: 'string', enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'], example: 'pending' },
    scheduledDate: { type: 'string', format: 'date', example: '2026-08-01' },
    startTime: { type: 'string', example: '10:00' },
    endTime: { type: 'string', example: '12:00' },
    durationHours: { type: 'number', example: 2 },
    serviceAddress: {
      type: 'object',
      properties: {
        street: { type: 'string', example: '123 Main St' },
        city: { type: 'string', example: 'Bengaluru' },
        state: { type: 'string', example: 'Karnataka' },
        pincode: { type: 'string', example: '560001' },
        country: { type: 'string', example: 'India' },
      },
    },
    pricing: {
      type: 'object',
      properties: {
        baseAmount: { type: 'number', example: 500 },
        discountAmount: { type: 'number', example: 0 },
        taxAmount: { type: 'number', example: 25 },
        platformFee: { type: 'number', example: 50 },
        totalAmount: { type: 'number', example: 575 },
        currency: { type: 'string', example: 'INR' },
      },
    },
    notes: { type: 'string', example: 'Please bring eco-friendly cleaning supplies' },
    cancellationReason: { type: 'string', nullable: true },
    cancelledAt: { type: 'string', format: 'date-time', nullable: true },
    startedAt: { type: 'string', format: 'date-time', nullable: true },
    completedAt: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const countrySchema = {
  type: 'object' as const,
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    name: { type: 'string', example: 'India' },
    isoCode: { type: 'string', example: 'IN' },
    phoneCode: { type: 'string', example: '+91' },
    currency: { type: 'string', example: 'INR' },
    isActive: { type: 'boolean', example: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const stateSchema = {
  type: 'object' as const,
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
    countryId: { type: 'string', example: '507f1f77bcf86cd799439011' },
    name: { type: 'string', example: 'Karnataka' },
    code: { type: 'string', example: 'KA' },
    isActive: { type: 'boolean', example: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const citySchema = {
  type: 'object' as const,
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
    stateId: { type: 'string', example: '507f1f77bcf86cd799439012' },
    countryId: { type: 'string', example: '507f1f77bcf86cd799439011' },
    name: { type: 'string', example: 'Bengaluru' },
    slug: { type: 'string', example: 'bengaluru' },
    latitude: { type: 'number', example: 12.9716, nullable: true },
    longitude: { type: 'number', example: 77.5946, nullable: true },
    isActive: { type: 'boolean', example: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const providerSchema = {
  type: 'object' as const,
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
    userId: { type: 'string', example: '507f1f77bcf86cd799439010' },
    providerType: { type: 'string', enum: ['cook', 'maid', 'babysitter', 'eldercare', 'cleaning', 'other'], example: 'cook' },
    fullName: { type: 'string', example: 'Ramesh Sharma' },
    gender: { type: 'string', enum: ['male', 'female', 'other', 'unspecified'], example: 'male' },
    experienceYears: { type: 'number', example: 5 },
    languages: { type: 'array', items: { type: 'string' }, example: ['Hindi', 'English'] },
    skills: { type: 'array', items: { type: 'string' }, example: ['North Indian', 'South Indian', 'Baking'] },
    bio: { type: 'string', example: 'Expert cook with 5+ years of experience' },
    verificationStatus: { type: 'string', enum: ['pending', 'verified', 'rejected'], example: 'verified' },
    isAvailable: { type: 'boolean', example: true },
    averageRating: { type: 'number', example: 4.8 },
    totalReviews: { type: 'number', example: 25 },
    location: {
      type: 'object',
      properties: {
        city: { type: 'string', example: 'Bengaluru' },
        state: { type: 'string', example: 'Karnataka' },
        country: { type: 'string', example: 'India' },
        latitude: { type: 'number', example: 12.9716 },
        longitude: { type: 'number', example: 77.5946 },
        serviceRadiusKm: { type: 'number', example: 10 },
      },
    },
    pricing: {
      type: 'object',
      properties: {
        hourlyPrice: { type: 'number', example: 150 },
        dailyPrice: { type: 'number', example: 1000 },
        visitCharge: { type: 'number', example: 200 },
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Cook & Home Maid Booking API',
    version: '1.0.0',
    description:
      'REST API for the Cook & Home Maid Booking platform. Authentication uses JWT access tokens and httpOnly refresh-token cookies.',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      description: 'Local development',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service health and readiness' },
    { name: 'Locations', description: 'PAN India location hierarchy (Countries, States, Cities) and search' },
    { name: 'Authentication', description: 'Registration, login, OTP, token management, password operations, and verification' },
    { name: 'Users', description: 'Authenticated user profile and avatar operations' },
    { name: 'Addresses', description: 'Customer address CRUD and default address management' },
    { name: 'Providers', description: 'Provider discovery, search, profile management, availability, and gallery management' },
    { name: 'Cooks', description: 'Cook discovery, search, profile management, and availability toggle' },
    { name: 'Maids', description: 'Maid discovery, search, profile management, and availability toggle' },
    { name: 'Bookings', description: 'Booking lifecycle management, search, availability checks, state transitions, and history' },
    { name: 'Payments', description: 'Payment processing, invoices, Razorpay/Stripe intents, COD, and refund management' },
    { name: 'Notifications', description: 'User push, email, SMS, and in-app notifications and read statuses' },
    { name: 'ActivityLogs', description: 'Audit trail and system activity logs' },
  ],
  components: {
    securitySchemes: {
      bearerAuth,
    },
    schemas: {
      ErrorResponse: errorResponse,
      User: userSchema,
      Address: addressSchema,
      Cook: cookSchema,
      Maid: maidSchema,
      Provider: providerSchema,
      Booking: bookingSchema,
      Country: countrySchema,
      State: stateSchema,
      City: citySchema,
      AuthTokens: authTokensSchema,
      AuthResponse: successEnvelope({
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          tokens: { $ref: '#/components/schemas/AuthTokens' },
        },
      }),
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns API availability, uptime, and MongoDB connection status.',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number', example: 123.45 },
                    environment: { type: 'string', example: 'development' },
                    database: { type: 'string', enum: ['connected', 'disconnected', 'connecting', 'disconnecting'] },
                    version: { type: 'string', example: 'v1' },
                  },
                }),
              },
            },
          },
          503: {
            description: 'API is degraded (database unavailable)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a Customer, Cook, or Maid account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'password'],
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 100 },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', example: '+919876543210' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['customer', 'cook', 'maid'], default: 'customer' },
                  hourlyRate: { type: 'number', example: 150 },
                  experienceYears: { type: 'number', example: 3 },
                  bio: { type: 'string', example: 'Experienced South Indian Cook' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Email or phone already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with email/phone and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', example: '+919876543210' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/send-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Initiate Firebase OTP flow',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone'],
                properties: {
                  phone: { type: 'string', example: '+919876543210' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP flow acknowledged',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    phone: { type: 'string', example: '+919876543210' },
                  },
                }),
              },
            },
          },
        },
      },
    },
    '/auth/verify-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify Firebase OTP token and auto-register/login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken', 'phone'],
                properties: {
                  idToken: { type: 'string', description: 'Firebase ID token' },
                  phone: { type: 'string', example: '+919876543210' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP verified and user authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { description: 'Invalid OTP token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate refresh token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Tokens refreshed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { description: 'Invalid refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate refresh token (alias)',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Tokens refreshed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { description: 'Invalid refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                }),
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Authentication'],
        summary: 'Update authenticated user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  avatar: { type: 'string' },
                  phone: { type: 'string' },
                  address: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout and revoke refresh token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: successEnvelope({ type: 'object' }),
              },
            },
          },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset instructions',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string', example: '+919876543210' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset instructions sent' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password using reset token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset successful' },
          400: { description: 'Invalid or expired reset token' },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Change password for authenticated user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed successfully' },
          401: { description: 'Current password incorrect' },
        },
      },
    },
    '/auth/send-email-verification': {
      post: {
        tags: ['Authentication'],
        summary: 'Send email verification token',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Verification token generated' },
        },
      },
    },
    '/auth/verify-email': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify email using token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Email verified successfully' },
          400: { description: 'Invalid or expired token' },
        },
      },
    },
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get authenticated user profile and role details',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile retrieved',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                }),
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update authenticated user profile and role preferences',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  avatar: { type: 'string', format: 'uri' },
                  address: { type: 'object' },
                  preferences: { type: 'object' },
                  bio: { type: 'string' },
                  experienceYears: { type: 'number' },
                  hourlyRate: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/users/avatar': {
      post: {
        tags: ['Users'],
        summary: 'Upload user profile avatar image to Cloudinary',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['avatar'],
                properties: {
                  avatar: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Avatar uploaded',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    avatar: { type: 'string', format: 'uri' },
                  },
                }),
              },
            },
          },
          400: { description: 'Invalid image file' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/addresses': {
      get: {
        tags: ['Addresses'],
        summary: 'Get all addresses for authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Addresses list retrieved',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    addresses: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Address' },
                    },
                  },
                }),
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Addresses'],
        summary: 'Add a new address for authenticated user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'mobile', 'houseNo', 'addressLine1', 'city', 'state', 'pincode'],
                properties: {
                  fullName: { type: 'string', example: 'John Doe' },
                  mobile: { type: 'string', example: '+919876543210' },
                  houseNo: { type: 'string', example: 'A-102' },
                  floor: { type: 'string', example: '1st Floor' },
                  landmark: { type: 'string', example: 'Near Metro Station' },
                  addressLine1: { type: 'string', example: 'MG Road' },
                  addressLine2: { type: 'string', example: 'Indiranagar' },
                  city: { type: 'string', example: 'Bengaluru' },
                  state: { type: 'string', example: 'Karnataka' },
                  country: { type: 'string', default: 'India' },
                  pincode: { type: 'string', example: '560038' },
                  latitude: { type: 'number', example: 12.9716 },
                  longitude: { type: 'number', example: 77.5946 },
                  addressType: { type: 'string', enum: ['Home', 'Office', 'Other'], default: 'Home' },
                  isDefault: { type: 'boolean', default: false },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Address created successfully',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    address: { $ref: '#/components/schemas/Address' },
                  },
                }),
              },
            },
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/addresses/default': {
      get: {
        tags: ['Addresses'],
        summary: 'Get default address for authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Default address retrieved',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    address: { $ref: '#/components/schemas/Address', nullable: true },
                  },
                }),
              },
            },
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/addresses/{id}': {
      patch: {
        tags: ['Addresses'],
        summary: 'Update address by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  mobile: { type: 'string' },
                  houseNo: { type: 'string' },
                  floor: { type: 'string' },
                  landmark: { type: 'string' },
                  addressLine1: { type: 'string' },
                  addressLine2: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  country: { type: 'string' },
                  pincode: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  addressType: { type: 'string', enum: ['Home', 'Office', 'Other'] },
                  isDefault: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Address updated successfully' },
          404: { description: 'Address not found' },
          401: { description: 'Unauthorized' },
        },
      },
      delete: {
        tags: ['Addresses'],
        summary: 'Delete address by ID (Soft delete)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Address deleted successfully' },
          404: { description: 'Address not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/addresses/{id}/default': {
      patch: {
        tags: ['Addresses'],
        summary: 'Set address as default for authenticated user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Default address updated successfully' },
          404: { description: 'Address not found' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/cooks': {
      get: {
        tags: ['Cooks'],
        summary: 'Search and filter cooks',
        description: 'Public endpoint to search cooks by keyword, city, experience range, price range, availability, rating, and pagination.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search in bio, skills, or languages' },
          { name: 'city', in: 'query', schema: { type: 'string' }, description: 'Filter by city' },
          { name: 'minExperience', in: 'query', schema: { type: 'integer', minimum: 0 }, description: 'Minimum years of experience' },
          { name: 'maxExperience', in: 'query', schema: { type: 'integer', minimum: 0 }, description: 'Maximum years of experience' },
          { name: 'minPrice', in: 'query', schema: { type: 'number', minimum: 0 }, description: 'Minimum hourly rate' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number', minimum: 0 }, description: 'Maximum hourly rate' },
          { name: 'isAvailable', in: 'query', schema: { type: 'boolean' }, description: 'Filter by availability status' },
          { name: 'serviceType', in: 'query', schema: { type: 'string', enum: ['cook', 'maid', 'both'] }, description: 'Filter by service type' },
          { name: 'minRating', in: 'query', schema: { type: 'number', minimum: 0, maximum: 5 }, description: 'Minimum average rating' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items per page' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['averageRating', 'hourlyRate', 'experienceYears', 'createdAt'], default: 'averageRating' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Cooks retrieved successfully',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    cooks: { type: 'array', items: { $ref: '#/components/schemas/Cook' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                }),
              },
            },
          },
        },
      },
    },
    '/cooks/me': {
      get: {
        tags: ['Cooks'],
        summary: 'Get current cook profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Cook profile retrieved',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    cook: { $ref: '#/components/schemas/Cook' },
                  },
                }),
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Cook profile not found' },
        },
      },
      patch: {
        tags: ['Cooks'],
        summary: 'Update current cook profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  bio: { type: 'string', maxLength: 1000 },
                  experienceYears: { type: 'number', minimum: 0, maximum: 60 },
                  serviceTypes: { type: 'array', items: { type: 'string', enum: ['cook', 'maid', 'both'] } },
                  skills: { type: 'array', items: { type: 'string' } },
                  languages: { type: 'array', items: { type: 'string' } },
                  hourlyRate: { type: 'number', minimum: 0 },
                  currency: { type: 'string', default: 'INR' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cook profile updated successfully' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/cooks/me/availability': {
      patch: {
        tags: ['Cooks'],
        summary: 'Toggle cook availability',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isAvailable: { type: 'boolean', description: 'Explicit availability flag. If omitted, toggles current state.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Availability updated' },
          401: { description: 'Unauthorized' },
          404: { description: 'Cook profile not found' },
        },
      },
    },
    '/cooks/{id}': {
      get: {
        tags: ['Cooks'],
        summary: 'Get cook details by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Cook profile retrieved',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    cook: { $ref: '#/components/schemas/Cook' },
                  },
                }),
              },
            },
          },
          404: { description: 'Cook profile not found' },
        },
      },
    },
    '/maids': {
      get: {
        tags: ['Maids'],
        summary: 'Search and filter maids',
        description: 'Public endpoint to search maids by keyword, city, services offered, experience range, price range, availability, rating, and pagination.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search in bio, services, skills, or languages' },
          { name: 'city', in: 'query', schema: { type: 'string' }, description: 'Filter by city' },
          { name: 'service', in: 'query', schema: { type: 'string' }, description: 'Filter by specific maid service (e.g. cleaning, laundry)' },
          { name: 'minExperience', in: 'query', schema: { type: 'integer', minimum: 0 }, description: 'Minimum years of experience' },
          { name: 'maxExperience', in: 'query', schema: { type: 'integer', minimum: 0 }, description: 'Maximum years of experience' },
          { name: 'minPrice', in: 'query', schema: { type: 'number', minimum: 0 }, description: 'Minimum hourly rate' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number', minimum: 0 }, description: 'Maximum hourly rate' },
          { name: 'isAvailable', in: 'query', schema: { type: 'boolean' }, description: 'Filter by availability status' },
          { name: 'minRating', in: 'query', schema: { type: 'number', minimum: 0, maximum: 5 }, description: 'Minimum average rating' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items per page' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['averageRating', 'hourlyRate', 'experienceYears', 'createdAt'], default: 'averageRating' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Maids retrieved successfully',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    maids: { type: 'array', items: { $ref: '#/components/schemas/Maid' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                }),
              },
            },
          },
        },
      },
    },
    '/maids/me': {
      get: {
        tags: ['Maids'],
        summary: 'Get current maid profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Maid profile retrieved',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    maid: { $ref: '#/components/schemas/Maid' },
                  },
                }),
              },
            },
          },
          401: { description: 'Unauthorized' },
          404: { description: 'Maid profile not found' },
        },
      },
      patch: {
        tags: ['Maids'],
        summary: 'Update current maid profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  bio: { type: 'string', maxLength: 1000 },
                  experienceYears: { type: 'number', minimum: 0, maximum: 60 },
                  services: { type: 'array', items: { type: 'string' } },
                  skills: { type: 'array', items: { type: 'string' } },
                  languages: { type: 'array', items: { type: 'string' } },
                  hourlyRate: { type: 'number', minimum: 0 },
                  currency: { type: 'string', default: 'INR' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Maid profile updated successfully' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/maids/me/availability': {
      patch: {
        tags: ['Maids'],
        summary: 'Toggle maid availability',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isAvailable: { type: 'boolean', description: 'Explicit availability flag. If omitted, toggles current state.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Availability updated' },
          401: { description: 'Unauthorized' },
          404: { description: 'Maid profile not found' },
        },
      },
    },
    '/maids/{id}': {
      get: {
        tags: ['Maids'],
        summary: 'Get maid details by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Maid profile retrieved',
            content: {
              'application/json': {
                schema: successEnvelope({
                  type: 'object',
                  properties: {
                    maid: { $ref: '#/components/schemas/Maid' },
                  },
                }),
              },
            },
          },
          404: { description: 'Maid profile not found' },
        },
      },
    },
    '/bookings': {
      post: {
        tags: ['Bookings'],
        summary: 'Create a new booking reservation (Customer only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cookId', 'serviceType', 'scheduledDate', 'startTime', 'endTime', 'durationHours', 'serviceAddress', 'hourlyRate'],
                properties: {
                  cookId: { type: 'string', description: 'Provider User/Profile ID' },
                  serviceType: { type: 'string', enum: ['cook', 'maid', 'both'] },
                  scheduledDate: { type: 'string', format: 'date' },
                  startTime: { type: 'string', example: '10:00' },
                  endTime: { type: 'string', example: '12:00' },
                  durationHours: { type: 'number', example: 2 },
                  hourlyRate: { type: 'number', example: 250 },
                  notes: { type: 'string' },
                  serviceAddress: { $ref: '#/components/schemas/Address' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking created' },
          400: { description: 'Validation or time slot error' },
          409: { description: 'Provider double booking conflict' },
        },
      },
      get: {
        tags: ['Bookings'],
        summary: 'Search and filter bookings with pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'serviceType', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Bookings list retrieved' },
        },
      },
    },
    '/bookings/check-availability': {
      get: {
        tags: ['Bookings'],
        summary: 'Check if provider is available for slot',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'cookId', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'startTime', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'endTime', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Slot availability status returned' },
        },
      },
    },
    '/bookings/upcoming': {
      get: {
        tags: ['Bookings'],
        summary: 'Get upcoming bookings for authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Upcoming bookings retrieved' },
        },
      },
    },
    '/bookings/customer/history': {
      get: {
        tags: ['Bookings'],
        summary: 'Get customer booking history',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Customer booking history retrieved' } },
      },
    },
    '/bookings/cook/history': {
      get: {
        tags: ['Bookings'],
        summary: 'Get cook booking history',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Cook booking history retrieved' } },
      },
    },
    '/bookings/maid/history': {
      get: {
        tags: ['Bookings'],
        summary: 'Get maid booking history',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Maid booking history retrieved' } },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Booking details retrieved' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Bookings'],
        summary: 'Update pending booking details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Booking updated' } },
      },
    },
    '/bookings/{id}/timeline': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking status timeline history',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Timeline retrieved' } },
      },
    },
    '/bookings/{id}/accept': {
      patch: {
        tags: ['Bookings'],
        summary: 'Accept pending booking (Provider only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Booking accepted' } },
      },
    },
    '/bookings/{id}/reject': {
      patch: {
        tags: ['Bookings'],
        summary: 'Reject pending booking (Provider only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Booking rejected' } },
      },
    },
    '/bookings/{id}/start': {
      patch: {
        tags: ['Bookings'],
        summary: 'Start service (Provider only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Service started' } },
      },
    },
    '/bookings/{id}/complete': {
      patch: {
        tags: ['Bookings'],
        summary: 'Mark service completed (Provider only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Service completed' } },
      },
    },
    '/bookings/{id}/cancel': {
      patch: {
        tags: ['Bookings'],
        summary: 'Cancel booking',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cancellationReason'],
                properties: { cancellationReason: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Booking cancelled' } },
      },
    },
  },
};

export const serveOpenApiJson = (_req: Request, res: Response): void => {
  res.status(200).json(openApiSpec);
};

export const swaggerUiMiddleware = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'Cook & Maid Booking API',
  customCss: '.swagger-ui .topbar { display: none }',
});
