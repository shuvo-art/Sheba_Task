import { Booking } from './booking.model';
import { Service } from '../service/service.model';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/user.model';

interface BookingData {
  customerName: string;
  email: string;
  phoneNumber: string;
  serviceId: number;
  scheduleDateTime: Date;
}

export class BookingService {
  static async createBooking(data: BookingData, userId: number) {
    try {
      // Verify service exists
      const service = await Service.findByPk(data.serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      // Validate user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate scheduleDateTime
      const now = new Date();
      if (data.scheduleDateTime <= now) {
        throw new Error('Schedule date/time must be in the future');
      }

      // Validate phoneNumber (basic format)
      if (!/^\d{10,}$/.test(data.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Create booking
      const booking = await Booking.create({
        customerName: data.customerName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        serviceId: data.serviceId,
        userId,
        scheduleDateTime: data.scheduleDateTime,
        status: 'pending',
      });

      // Send email notification (bonus feature)
      await NotificationService.sendBookingConfirmation(booking, service);

      return booking;
    } catch (error: any) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  static async getBookingStatus(id: number, userId: number) {
    try {
      const booking = await Booking.findOne({
        where: { id, userId },
        include: [{ model: Service, attributes: ['name', 'price'] }],
      });

      if (!booking) {
        throw new Error('Booking not found or unauthorized');
      }

      return booking;
    } catch (error: any) {
      throw new Error(`Failed to retrieve booking: ${error.message}`);
    }
  }

  static async getAllBookings() {
    try {
      const bookings = await Booking.findAll({
        include: [
          { model: Service, attributes: ['name', 'price'] },
          { model: User, attributes: ['email'] },
        ],
      });
      return bookings;
    } catch (error: any) {
      throw new Error(`Failed to retrieve bookings: ${error.message}`);
    }
  }
}