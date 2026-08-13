import { Router } from 'express';
import { locationController } from '../controllers/location.controller.js';
import { validate } from '../../../middleware/validation/validate.js';
import {
  createCountrySchema,
  createStateSchema,
  createCitySchema,
  updateCitySchema,
  cityQuerySchema,
} from '../validators/location.validator.js';

const router = Router();

// Global Search, Reverse Geocode & Validation
router.get('/search', locationController.searchGlobalLocations);
router.get('/reverse-geocode', locationController.reverseGeocode);
router.post('/validate', locationController.validateLocation);

// Country Routes
router.get('/countries', locationController.getCountries);
router.get('/countries/:countryCode/states', locationController.getStatesByCountryCode);
router.post('/countries', validate(createCountrySchema), locationController.createCountry);

// State Routes
router.get('/states', locationController.getStates);
router.post('/states', validate(createStateSchema), locationController.createState);
router.get('/states/:stateCode/cities', locationController.getCitiesByStateCode);
router.get('/states/:id/cities', locationController.getCitiesByState);

// City Routes
router.get('/cities/search', locationController.searchGlobalLocations);
router.get('/cities', validate(cityQuerySchema, 'query'), locationController.getCities);
router.get('/cities/:id', locationController.getCityByIdOrSlug);
router.post('/cities', validate(createCitySchema), locationController.createCity);
router.patch('/cities/:id', validate(updateCitySchema), locationController.updateCity);

// Seeding Endpoint
router.post('/seed', locationController.seedLocations);

export default router;
