import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { BookingService } from './booking.service';
import { z } from 'zod';

const bookingSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  serviceId: z.number().positive('Service ID must be positive'),
  scheduleDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
});

export class BookingController {
  static async createBooking(req: AuthRequest, res: Response) {
    try {
      const data = bookingSchema.parse(req.body);
      if (!req.user?.id) {
        throw new Error('User ID not found in request');
      }

      const bookingData = {
        customerName: data.customerName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        serviceId: data.serviceId,
        scheduleDateTime: new Date(data.scheduleDateTime),
      };

      const booking = await BookingService.createBooking(bookingData, req.user.id);
      res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
      const status = error instanceof z.ZodError ? 400 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  static async getBookingStatus(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new Error('Invalid booking ID');
      }
      if (!req.user?.id) {
        throw new Error('User ID not found in request');
      }

      const booking = await BookingService.getBookingStatus(id, req.user.id);
      res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getAllBookings(req: AuthRequest, res: Response) {
    try {
      const bookings = await BookingService.getAllBookings();
      res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}