import { ServiceCatalog } from '../../models/serviceCatalog.model.js';
import { Booking } from '../../models/booking.model.js';

export interface AiPriceSuggestionInput {
  basePrice: number;
  city?: string;
  demandFactor?: number;
  isWeekend?: boolean;
}

export interface AiDemandPredictionInput {
  city: string;
  category: string;
}

export class AiEngineService {
  async getRecommendedServices(_userId?: string) {
    return ServiceCatalog.find({ isActive: true, isDeleted: false })
      .sort({ isPopular: -1, isFeatured: -1, basePrice: 1 })
      .limit(6);
  }

  async getPriceSuggestion(input: AiPriceSuggestionInput) {
    let suggestedPrice = input.basePrice;
    let multiplier = 1.0;

    if (input.isWeekend) multiplier += 0.15;
    if (input.demandFactor && input.demandFactor > 1.2) multiplier += 0.2;

    suggestedPrice = Math.round(suggestedPrice * multiplier);

    return {
      basePrice: input.basePrice,
      suggestedPrice,
      multiplier,
      confidenceScore: 0.92,
      recommendation: multiplier > 1.0 ? 'High demand surge pricing recommended' : 'Optimal standard pricing',
    };
  }

  async detectBookingFraud(bookingData: { customerId: string; totalAmount: number; ipAddress?: string }) {
    let fraudRiskScore = 0;
    const reasons: string[] = [];

    if (bookingData.totalAmount > 15000) {
      fraudRiskScore += 30;
      reasons.push('Unusually high booking amount');
    }

    const recentCount = await Booking.countDocuments({
      customerId: bookingData.customerId,
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
    });

    if (recentCount > 3) {
      fraudRiskScore += 45;
      reasons.push('High booking frequency within short timeframe');
    }

    return {
      fraudRiskScore,
      isSuspicious: fraudRiskScore >= 50,
      reasons,
      action: fraudRiskScore >= 50 ? 'FLAG_FOR_ADMIN_REVIEW' : 'ALLOW',
    };
  }

  async predictDemand(input: AiDemandPredictionInput) {
    const historicalCount = await Booking.countDocuments({ status: 'completed' });
    const predictedBookings = Math.round((historicalCount || 10) * 1.3);

    return {
      city: input.city,
      category: input.category,
      predictedDemandLevel: 'HIGH',
      predictedBookingsNext7Days: predictedBookings,
      recommendedStaffCount: Math.ceil(predictedBookings * 0.4),
    };
  }

  async analyzeComplaint(complaintText: string) {
    const text = complaintText.toLowerCase();
    let urgencyLevel = 'MEDIUM';
    let suggestedRefundPercentage = 0;
    const tags: string[] = [];

    if (text.includes('delay') || text.includes('late')) {
      tags.push('PROVIDER_DELAY');
      suggestedRefundPercentage = 15;
    }
    if (text.includes('damage') || text.includes('broken')) {
      urgencyLevel = 'CRITICAL';
      tags.push('PROPERTY_DAMAGE');
      suggestedRefundPercentage = 50;
    }
    if (text.includes('behavior') || text.includes('rude')) {
      tags.push('UNPROFESSIONAL_BEHAVIOR');
    }

    return {
      complaintText,
      sentiment: urgencyLevel === 'CRITICAL' ? 'NEGATIVE' : 'NEUTRAL',
      urgencyLevel,
      suggestedRefundPercentage,
      tags,
      confidenceScore: 0.94,
    };
  }

  async assistantChat(userMessage: string) {
    const msg = userMessage.toLowerCase();
    let reply = "Hello! I am your AI Home Services Assistant. How can I help you today?";

    if (msg.includes('clean') || msg.includes('maid')) {
      reply = "We offer Full Home Cleaning, Deep Cleaning, Kitchen, Bathroom, Sofa, and Carpet cleaning. Would you like me to show available time slots?";
    } else if (msg.includes('cook') || msg.includes('food')) {
      reply = "Our verified professional cooks specialize in North Indian, South Indian, Continental, and custom dietary meals. Select a provider to view ratings and pricing!";
    } else if (msg.includes('cancel') || msg.includes('refund')) {
      reply = "You can cancel bookings up to 2 hours before scheduled time with 100% instant refund to your wallet!";
    }

    return {
      userMessage,
      reply,
      suggestedActions: ['Browse Services', 'View Top Providers', 'Check Wallet Balance'],
    };
  }
}

export const aiEngineService = new AiEngineService();
