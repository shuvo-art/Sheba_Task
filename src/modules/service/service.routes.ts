import { Router } from 'express';
import { ServiceController } from './service.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Get paginated list of services (public)
router.get('/', ServiceController.getServices);

// Create a service (admin only)
router.post('/', authenticate, requireRole('admin'), ServiceController.createService);

// Update a service (admin only)
router.put('/:id', authenticate, requireRole('admin'), ServiceController.updateService);

// Delete a service (admin only)
router.delete('/:id', authenticate, requireRole('admin'), ServiceController.deleteService);

export default router;