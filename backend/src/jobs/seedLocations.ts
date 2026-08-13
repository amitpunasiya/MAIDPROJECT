import { Country } from '../models/country.model.js';
import { State } from '../models/state.model.js';
import { City } from '../models/city.model.js';
import { generateSlug } from '../modules/location/services/location.service.js';
import { logger } from '../utils/logger.js';

export const INDIAN_STATES_AND_UTS = [
  // 28 States
  { name: 'Andhra Pradesh', code: 'AP' },
  { name: 'Arunachal Pradesh', code: 'AR' },
  { name: 'Assam', code: 'AS' },
  { name: 'Bihar', code: 'BR' },
  { name: 'Chhattisgarh', code: 'CG' },
  { name: 'Goa', code: 'GA' },
  { name: 'Gujarat', code: 'GJ' },
  { name: 'Haryana', code: 'HR' },
  { name: 'Himachal Pradesh', code: 'HP' },
  { name: 'Jharkhand', code: 'JH' },
  { name: 'Karnataka', code: 'KA' },
  { name: 'Kerala', code: 'KL' },
  { name: 'Madhya Pradesh', code: 'MP' },
  { name: 'Maharashtra', code: 'MH' },
  { name: 'Manipur', code: 'MN' },
  { name: 'Meghalaya', code: 'ML' },
  { name: 'Mizoram', code: 'MZ' },
  { name: 'Nagaland', code: 'NL' },
  { name: 'Odisha', code: 'OD' },
  { name: 'Punjab', code: 'PB' },
  { name: 'Rajasthan', code: 'RJ' },
  { name: 'Sikkim', code: 'SK' },
  { name: 'Tamil Nadu', code: 'TN' },
  { name: 'Telangana', code: 'TS' },
  { name: 'Tripura', code: 'TR' },
  { name: 'Uttar Pradesh', code: 'UP' },
  { name: 'Uttarakhand', code: 'UK' },
  { name: 'West Bengal', code: 'WB' },
  // 8 Union Territories
  { name: 'Andaman and Nicobar Islands', code: 'AN' },
  { name: 'Chandigarh', code: 'CH' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN' },
  { name: 'Delhi', code: 'DL' },
  { name: 'Jammu and Kashmir', code: 'JK' },
  { name: 'Ladakh', code: 'LA' },
  { name: 'Lakshadweep', code: 'LD' },
  { name: 'Puducherry', code: 'PY' },
];

export const INITIAL_INDIAN_CITIES: Record<string, Array<{ name: string; lat?: number; lng?: number }>> = {
  KA: [
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
    { name: 'Mangaluru', lat: 12.9141, lng: 74.856 },
    { name: 'Hubballi-Dharwad', lat: 15.3647, lng: 75.124 },
    { name: 'Belagavi', lat: 15.8497, lng: 74.4977 },
    { name: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
    { name: 'Ballari', lat: 15.1394, lng: 76.9214 },
    { name: 'Shivamogga', lat: 13.9299, lng: 75.5681 },
  ],
  MH: [
    { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { name: 'Thane', lat: 19.2183, lng: 72.9781 },
    { name: 'Nashik', lat: 20.0059, lng: 73.7898 },
    { name: 'Chhatrapati Sambhajinagar', lat: 19.8762, lng: 75.3433 },
    { name: 'Navi Mumbai', lat: 19.033, lng: 73.0297 },
    { name: 'Solapur', lat: 17.6599, lng: 75.9064 },
  ],
  DL: [
    { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
    { name: 'New Delhi', lat: 28.6139, lng: 77.209 },
  ],
  TS: [
    { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    { name: 'Warangal', lat: 17.9689, lng: 79.5941 },
    { name: 'Nizamabad', lat: 18.6725, lng: 78.0941 },
  ],
  TN: [
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
    { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
    { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
    { name: 'Salem', lat: 11.6643, lng: 78.146 },
  ],
  WB: [
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Howrah', lat: 22.5958, lng: 88.2636 },
    { name: 'Siliguri', lat: 26.7271, lng: 88.3953 },
    { name: 'Asansol', lat: 23.6739, lng: 86.9524 },
  ],
  GJ: [
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'Surat', lat: 21.1702, lng: 72.8311 },
    { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
    { name: 'Rajkot', lat: 22.3039, lng: 70.8022 },
  ],
  RJ: [
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
    { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
    { name: 'Kota', lat: 25.2138, lng: 75.8648 },
  ],
  UP: [
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
    { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
    { name: 'Agra', lat: 27.1767, lng: 78.0081 },
    { name: 'Noida', lat: 28.5355, lng: 77.391 },
    { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
  ],
  HR: [
    { name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
    { name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
    { name: 'Panipat', lat: 29.3909, lng: 76.9635 },
    { name: 'Ambala', lat: 30.3782, lng: 76.7767 },
  ],
  PB: [
    { name: 'Ludhiana', lat: 30.901, lng: 75.8573 },
    { name: 'Amritsar', lat: 31.634, lng: 74.8723 },
    { name: 'Jalandhar', lat: 31.326, lng: 75.5762 },
  ],
  CH: [
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  ],
  KL: [
    { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
    { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
    { name: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
  ],
  MP: [
    { name: 'Indore', lat: 22.7196, lng: 75.8577 },
    { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
    { name: 'Gwalior', lat: 26.2183, lng: 78.1828 },
  ],
  BR: [
    { name: 'Patna', lat: 25.5941, lng: 85.1376 },
    { name: 'Gaya', lat: 24.7914, lng: 85.0002 },
  ],
  JH: [
    { name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
    { name: 'Jamshedpur', lat: 22.8046, lng: 86.2029 },
  ],
  CG: [
    { name: 'Raipur', lat: 21.2514, lng: 81.6296 },
    { name: 'Bhilai', lat: 21.1938, lng: 81.3509 },
  ],
  OD: [
    { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
    { name: 'Cuttack', lat: 20.4625, lng: 85.8828 },
  ],
  AS: [
    { name: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  ],
  GA: [
    { name: 'Panaji', lat: 15.4909, lng: 73.8278 },
    { name: 'Margao', lat: 15.2832, lng: 73.9862 },
  ],
  UK: [
    { name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
    { name: 'Haridwar', lat: 29.9457, lng: 78.1642 },
  ],
  HP: [
    { name: 'Shimla', lat: 31.1048, lng: 77.1734 },
    { name: 'Dharamshala', lat: 32.219, lng: 76.3234 },
  ],
};

export const seedLocationData = async (): Promise<{
  country: string;
  statesCreated: number;
  citiesCreated: number;
}> => {
  logger.info('Starting Location database seed operation...');

  // 1. Seed or get Default Country: India
  let india = await Country.findOne({ isoCode: 'IN' });
  if (!india) {
    india = await Country.create({
      name: 'India',
      isoCode: 'IN',
      phoneCode: '+91',
      currency: 'INR',
      isActive: true,
    });
    logger.info('Default country India created.');
  }

  let statesCreated = 0;
  let citiesCreated = 0;

  // 2. Seed 28 States & 8 Union Territories
  const stateMap = new Map<string, any>();

  for (const st of INDIAN_STATES_AND_UTS) {
    let stateDoc = await State.findOne({ countryId: india._id, code: st.code });
    if (!stateDoc) {
      stateDoc = await State.create({
        countryId: india._id,
        name: st.name,
        code: st.code,
        isActive: true,
      });
      statesCreated++;
    }
    stateMap.set(st.code, stateDoc);
  }

  // 3. Seed starter cities per state
  for (const [stateCode, cityList] of Object.entries(INITIAL_INDIAN_CITIES)) {
    const stateDoc = stateMap.get(stateCode);
    if (!stateDoc) continue;

    for (const c of cityList) {
      const slug = generateSlug(c.name);
      const existingCity = await City.findOne({ stateId: stateDoc._id, name: c.name });
      if (!existingCity) {
        await City.create({
          stateId: stateDoc._id,
          countryId: india._id,
          name: c.name,
          slug,
          latitude: c.lat ?? null,
          longitude: c.lng ?? null,
          isActive: true,
        });
        citiesCreated++;
      }
    }
  }

  logger.info(
    `Location seeding completed: ${statesCreated} states created, ${citiesCreated} cities created.`,
  );

  return {
    country: india.name,
    statesCreated,
    citiesCreated,
  };
};
