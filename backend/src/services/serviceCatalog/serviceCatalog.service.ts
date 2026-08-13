import { ServiceCategory, type IServiceCategoryDocument } from '../../models/serviceCategory.model.js';
import { ServiceCatalog, type IServiceCatalogDocument } from '../../models/serviceCatalog.model.js';
import { SubService, type ISubServiceDocument } from '../../models/subService.model.js';
import { ServicePricing } from '../../models/servicePricing.model.js';
import { Booking } from '../../models/booking.model.js';
import { Types } from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export interface PriceCalculationInput {
  serviceId: string;
  subServiceId?: string;
  quantity?: number;
  city?: string;
  branchId?: string;
  providerId?: string;
  isWeekend?: boolean;
  isFestival?: boolean;
  isEmergency?: boolean;
}

export class ServiceCatalogService {
  async getCategories(isFeaturedOnly = false): Promise<IServiceCategoryDocument[]> {
    const query: any = { isActive: true, isDeleted: false };
    if (isFeaturedOnly) query.isFeatured = true;
    return ServiceCategory.find(query).sort({ displayOrder: 1, name: 1 });
  }

  async createCategory(data: Partial<IServiceCategoryDocument>): Promise<IServiceCategoryDocument> {
    if (!data.name) throw ApiError.badRequest('Category name is required');
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return ServiceCategory.create({ ...data, slug });
  }

  async getServicesByCategory(categoryId: string): Promise<IServiceCatalogDocument[]> {
    return ServiceCatalog.find({ categoryId: new Types.ObjectId(categoryId), isActive: true, isDeleted: false }).sort({ name: 1 });
  }

  async getServiceDetails(serviceId: string) {
    const service = await ServiceCatalog.findById(serviceId);
    if (!service) throw ApiError.notFound('Service not found');

    const subServices = await SubService.find({ serviceId: service._id, isActive: true, isDeleted: false });
    return { service, subServices };
  }

  async createService(data: Partial<IServiceCatalogDocument>): Promise<IServiceCatalogDocument> {
    if (!data.name || !data.categoryId || data.basePrice === undefined) {
      throw ApiError.badRequest('Name, categoryId, and basePrice are required');
    }
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return ServiceCatalog.create({ ...data, slug });
  }

  async createSubService(data: Partial<ISubServiceDocument>): Promise<ISubServiceDocument> {
    if (!data.serviceId || !data.name || data.basePrice === undefined) {
      throw ApiError.badRequest('ServiceId, name, and basePrice are required');
    }
    return SubService.create(data);
  }

  async calculateDynamicPrice(input: PriceCalculationInput) {
    const service = await ServiceCatalog.findById(input.serviceId);
    if (!service) throw ApiError.notFound('Service not found');

    let baseAmount = service.basePrice;
    let durationMinutes = service.estimatedDurationMinutes;

    if (input.subServiceId) {
      const sub = await SubService.findById(input.subServiceId);
      if (sub) {
        baseAmount = sub.basePrice;
        durationMinutes = sub.estimatedDurationMinutes;
      }
    }

    const quantity = Math.max(1, input.quantity ?? 1);
    let subtotal = baseAmount * quantity;

    // Check custom pricing rules
    let multiplier = 1.0;
    if (input.city) {
      const rule = await ServicePricing.findOne({ serviceId: service._id, city: new RegExp(`^${input.city}$`, 'i'), isActive: true });
      if (rule) {
        if (input.isWeekend) multiplier *= rule.weekendMultiplier;
        if (input.isFestival) multiplier *= rule.festivalMultiplier;
        if (input.isEmergency) multiplier *= rule.emergencyMultiplier;
        if (rule.discountPrice) subtotal = rule.discountPrice * quantity;
      }
    }

    const finalSubtotal = Math.round(subtotal * multiplier);
    const gstAmount = Math.round((finalSubtotal * (service.gstPercentage || 18)) / 100);
    const finalTotal = finalSubtotal + gstAmount;

    return {
      serviceId: service._id.toString(),
      serviceName: service.name,
      subServiceId: input.subServiceId,
      quantity,
      baseAmount,
      multiplier,
      subtotal: finalSubtotal,
      gstPercentage: service.gstPercentage || 18,
      gstAmount,
      finalTotal,
      estimatedDurationMinutes: durationMinutes * quantity,
    };
  }

  async searchServices(keyword: string) {
    if (!keyword.trim()) return [];
    const regex = new RegExp(keyword, 'i');
    return ServiceCatalog.find({
      $or: [{ name: regex }, { description: regex }, { shortDescription: regex }],
      isActive: true,
      isDeleted: false,
    }).limit(20);
  }

  async getServiceAnalytics() {
    const [totalCategories, totalServices] = await Promise.all([
      ServiceCategory.countDocuments({ isDeleted: false }),
      ServiceCatalog.countDocuments({ isDeleted: false }),
    ]);

    const revenueByCategory = await Booking.aggregate([
      { $match: { status: 'completed', isDeleted: false } },
      { $group: { _id: '$serviceType', totalRevenue: { $sum: '$pricing.totalAmount' }, totalBookings: { $sum: 1 } } },
      { $sort: { totalRevenue: -1 } },
    ]);

    return {
      totalCategories,
      totalServices,
      revenueByCategory,
    };
  }

  async seedDefaultCatalog() {
    const categoryCount = await ServiceCategory.countDocuments();
    if (categoryCount > 0) return;

    logger.info('Seeding default Task-Based Home Services Catalog & Categories...');

    interface SeedTask {
      name: string;
      basePrice: number;
      duration: number;
      desc: string;
      verificationRequired?: boolean;
    }
    interface SeedCategory {
      name: string;
      icon: string;
      displayOrder: number;
      tasks: SeedTask[];
    }

    const taskCategories: SeedCategory[] = [
      {
        name: 'Cleaning',
        icon: 'cleaning_services',
        displayOrder: 1,
        tasks: [
          { name: 'Sweeping', basePrice: 150, duration: 30, desc: 'Quick & thorough floor sweeping' },
          { name: 'Mopping', basePrice: 150, duration: 30, desc: 'Professional wet floor mopping' },
          { name: 'Bathroom Cleaning', basePrice: 299, duration: 45, desc: 'Sanitize and clean complete bathroom' },
          { name: 'Kitchen Cleaning', basePrice: 399, duration: 60, desc: 'Countertops, sink and stove deep clean' },
          { name: 'Window Cleaning', basePrice: 250, duration: 45, desc: 'Glass & window panel cleaning' },
          { name: 'Deep Cleaning', basePrice: 999, duration: 180, desc: 'Deep house sanitization & grime removal' },
          { name: 'Full House Cleaning', basePrice: 1499, duration: 240, desc: 'Complete home sweeping, mopping & dusting' },
        ],
      },
      {
        name: 'Kitchen',
        icon: 'restaurant',
        displayOrder: 2,
        tasks: [
          { name: 'Dishwashing', basePrice: 200, duration: 30, desc: 'Washing dishes and kitchen cleanup' },
          { name: 'Cooking', basePrice: 350, duration: 60, desc: 'Fresh home cooked meal preparation' },
          { name: 'Meal Preparation', basePrice: 250, duration: 45, desc: 'Chopping vegetables & pre-cook prep' },
          { name: 'Kitchen Cleanup', basePrice: 200, duration: 30, desc: 'Wiping surfaces & trash disposal' },
        ],
      },
      {
        name: 'Laundry',
        icon: 'iron',
        displayOrder: 3,
        tasks: [
          { name: 'Washing', basePrice: 200, duration: 45, desc: 'Machine or hand washing clothes' },
          { name: 'Drying', basePrice: 100, duration: 30, desc: 'Hanging and drying washed clothes' },
          { name: 'Folding', basePrice: 150, duration: 30, desc: 'Neat wardrobe clothing folding' },
          { name: 'Ironing', basePrice: 200, duration: 45, desc: 'Steam and dry ironing for garments' },
        ],
      },
      {
        name: 'Home Help',
        icon: 'inventory_2',
        displayOrder: 4,
        tasks: [
          { name: 'Organizing', basePrice: 300, duration: 60, desc: 'Wardrobe & room decluttering' },
          { name: 'Packing / Unpacking', basePrice: 500, duration: 120, desc: 'Luggage & box packing or unpacking' },
          { name: 'General Household Assistance', basePrice: 250, duration: 60, desc: 'Errands and general home help' },
        ],
      },
      {
        name: 'Care',
        icon: 'child_care',
        displayOrder: 5,
        tasks: [
          { name: 'Childcare', basePrice: 400, duration: 120, desc: 'Attentive child supervision & care', verificationRequired: true },
          { name: 'Elder Assistance', basePrice: 450, duration: 120, desc: 'Compassionate elderly companion help', verificationRequired: true },
        ],
      },
    ];

    for (const catData of taskCategories) {
      const slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cat = await ServiceCategory.create({
        name: catData.name,
        slug,
        icon: catData.icon,
        isActive: true,
        isFeatured: true,
        displayOrder: catData.displayOrder,
      });

      for (const t of catData.tasks) {
        const taskSlug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await ServiceCatalog.create({
          categoryId: cat._id,
          name: t.name,
          slug: taskSlug,
          description: t.desc,
          shortDescription: t.desc,
          basePrice: t.basePrice,
          minPrice: Math.round(t.basePrice * 0.8),
          maxPrice: t.basePrice * 3,
          priceType: 'fixed',
          estimatedDurationMinutes: t.duration,
          requiredStaff: 1,
          verificationRequired: Boolean(t.verificationRequired),
          skillsRequired: t.verificationRequired ? ['Police Verified', 'Background Checked', 'Certified Caregiver'] : ['Household Trained'],
          isActive: true,
          isFeatured: true,
          isPopular: true,
          gstPercentage: 18,
        });
      }
    }

    logger.info('Default Task-Based Home Services Catalog seeded successfully.');
  }
}

export const serviceCatalogService = new ServiceCatalogService();
