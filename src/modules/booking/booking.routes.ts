import { Router } from 'express';
import { BookingController } from './booking.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Create a booking (authenticated user)
router.post('/', authenticate, BookingController.createBooking);

// Get booking status (authenticated user)
router.get('/:id', authenticate, BookingController.getBookingStatus);

// Get all bookings (admin only)
router.get('/', authenticate, requireRole('admin'), BookingController.getAllBookings);

export default router;