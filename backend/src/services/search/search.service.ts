import { Provider } from '../../models/provider.model.js';
import { ServiceCatalog } from '../../models/serviceCatalog.model.js';
import { City } from '../../models/city.model.js';
import { User } from '../../models/user.model.js';

export interface GlobalSearchQuery {
  q: string;
  type?: string; // 'all' | 'providers' | 'services' | 'tasks' | 'locations'
  city?: string;
  state?: string;
  country?: string;
  providerType?: string;
  minRating?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  limit?: number;
  page?: number;
}

export class SearchService {
  async globalSearch(params: GlobalSearchQuery) {
    const { q, type = 'all', limit = 10, lat, lng } = params;
    const queryRegex = new RegExp(q.trim(), 'i');

    const results: {
      providers: any[];
      services: any[];
      tasks: any[];
      locations: any[];
    } = {
      providers: [],
      services: [],
      tasks: [],
      locations: [],
    };

    // 1. PROVIDERS SEARCH
    if (type === 'all' || type === 'providers') {
      const userMatches = await User.find({
        fullName: queryRegex,
        isDeleted: { $ne: true },
      }).select('_id fullName email phone profilePicture');

      const userIds = userMatches.map((u) => u._id);

      const providerQuery: any = {
        isDeleted: { $ne: true },
        $or: [
          { userId: { $in: userIds } },
          { providerType: queryRegex },
          { skills: queryRegex },
          { 'location.city': queryRegex },
          { 'location.state': queryRegex },
          { 'location.country': queryRegex },
        ],
      };

      if (params.providerType) {
        providerQuery.providerType = new RegExp(params.providerType, 'i');
      }
      if (params.minRating) {
        providerQuery.averageRating = { $gte: Number(params.minRating) };
      }

      const providers = await Provider.find(providerQuery)
        .populate('userId', 'fullName email phone profilePicture')
        .limit(limit)
        .lean();

      results.providers = providers.map((p: any) => {
        const uName = p.userId?.fullName || p.businessName || 'Staff Partner';
        let distKm = 0;
        if (lat && lng && p.location?.latitude && p.location?.longitude) {
          const R = 6371; // Earth radius km
          const dLat = ((p.location.latitude - lat) * Math.PI) / 180;
          const dLng = ((p.location.longitude - lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) *
              Math.cos((p.location.latitude * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distKm = Math.round(R * c * 10) / 10;
        }

        return {
          id: p._id.toString(),
          _id: p._id.toString(),
          name: uName,
          providerType: p.providerType || 'Household Staff',
          avatar: p.userId?.profilePicture || p.avatar || '',
          rating: p.averageRating || 4.8,
          totalJobs: p.completedBookingsCount || p.totalBookings || 120,
          city: p.location?.city || 'Bengaluru',
          state: p.location?.state || 'Karnataka',
          country: p.location?.country || 'India',
          distanceKm: distKm || 2.1,
          skills: p.skills || [],
          hourlyPrice: p.pricing?.hourlyPrice || 250,
          isAvailable: p.isAvailable !== false,
          verificationStatus: p.verificationStatus || 'approved',
        };
      });
    }

    // 2. SERVICES & TASKS SEARCH
    if (type === 'all' || type === 'services' || type === 'tasks') {
      const serviceQuery: any = {
        isActive: true,
        isDeleted: { $ne: true },
        $or: [
          { name: queryRegex },
          { description: queryRegex },
          { shortDescription: queryRegex },
          { skillsRequired: queryRegex },
        ],
      };

      const services = await ServiceCatalog.find(serviceQuery)
        .populate('categoryId', 'name icon')
        .limit(limit)
        .lean();

      results.services = services.map((s: any) => ({
        id: s._id.toString(),
        _id: s._id.toString(),
        name: s.name,
        slug: s.slug,
        categoryName: s.categoryId?.name || 'Household Task',
        basePrice: s.basePrice || s.minPrice || 199,
        priceType: s.priceType || 'per_hour',
        estimatedDurationMinutes: s.estimatedDurationMinutes || 60,
        description: s.shortDescription || s.description || '',
        icon: s.icon || s.categoryId?.icon || '🧹',
      }));

      // Map task breakdown entries
      results.tasks = services.map((s: any) => ({
        id: `task-${s._id}`,
        _id: s._id.toString(),
        taskName: s.name,
        category: s.categoryId?.name || 'Household Task',
        basePrice: s.basePrice || 199,
        durationMinutes: s.estimatedDurationMinutes || 60,
      }));
    }

    // 3. LOCATIONS SEARCH
    if (type === 'all' || type === 'locations') {
      const cities = await City.find({
        name: queryRegex,
        isActive: true,
      })
        .limit(limit)
        .lean();

      results.locations = cities.map((c: any) => ({
        id: c._id.toString(),
        _id: c._id.toString(),
        city: c.name,
        state: c.stateName || c.state || 'State',
        country: c.countryName || c.country || 'India',
        fullName: `${c.name}, ${c.stateName || ''}, ${c.countryName || 'India'}`,
      }));

      // Fallback matching for international or custom queries
      if (results.locations.length === 0 && q.trim().length >= 2) {
        const sampleCities = [
          { name: 'Mumbai', state: 'Maharashtra', country: 'India' },
          { name: 'Indore', state: 'Madhya Pradesh', country: 'India' },
          { name: 'Bengaluru', state: 'Karnataka', country: 'India' },
          { name: 'Delhi NCR', state: 'Delhi', country: 'India' },
          { name: 'London', state: 'England', country: 'United Kingdom' },
          { name: 'Toronto', state: 'Ontario', country: 'Canada' },
          { name: 'Sydney', state: 'New South Wales', country: 'Australia' },
          { name: 'New York', state: 'New York', country: 'USA' },
        ];

        const matched = sampleCities.filter(
          (sc) =>
            sc.name.toLowerCase().includes(q.toLowerCase()) ||
            sc.state.toLowerCase().includes(q.toLowerCase()) ||
            sc.country.toLowerCase().includes(q.toLowerCase())
        );

        results.locations = matched.map((m, idx) => ({
          id: `loc-sample-${idx}`,
          _id: `loc-sample-${idx}`,
          city: m.name,
          state: m.state,
          country: m.country,
          fullName: `${m.name}, ${m.state}, ${m.country}`,
        }));
      }
    }

    return results;
  }
}

export const searchService = new SearchService();
