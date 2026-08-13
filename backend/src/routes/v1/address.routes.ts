import { Router } from 'express';
import { addressController } from '../../controllers/address.controller.js';
import { authenticate } from '../../middleware/auth/authenticate.js';
import { validate } from '../../middleware/validation/validate.js';
import { createAddressSchema, updateAddressSchema } from '../../validators/address.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', addressController.getMyAddresses);
router.post('/', validate(createAddressSchema), addressController.create);
router.get('/default', addressController.getDefaultAddress);
router.patch('/:id/default', addressController.setDefault);
router.patch('/:id', validate(updateAddressSchema), addressController.update);
router.delete('/:id', addressController.delete);

export default router;
