// src/modules/notification/notification.service.ts
import nodemailer from 'nodemailer';
import { Booking } from '../booking/booking.model';
import { Service } from '../service/service.model';

export class NotificationService {
  private static transporter: nodemailer.Transporter | null = null;

  private static initializeTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
    }

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private static getTransporter() {
    if (!this.transporter) {
      this.transporter = this.initializeTransporter();
    }
    return this.transporter;
  }

  static async sendBookingConfirmation(booking: Booking, service: Service) {
    try {
      const mailOptions = {
        from: `"Sheba Platform" <${process.env.EMAIL_USER!}>`,
        to: booking.email,
        subject: 'Booking Confirmation',
        text: `Dear ${booking.customerName},\n\nYour booking for ${service.name} has been confirmed.\nDetails:\n- Booking ID: ${booking.id}\n- Date/Time: ${booking.scheduleDateTime.toISOString()}\n- Price: $${service.price.toFixed(2)}\n\nThank you for choosing Sheba Platform!`,
        html: `
          <h2>Booking Confirmation</h2>
          <p>Dear ${booking.customerName},</p>
          <p>Your booking for <strong>${service.name}</strong> has been confirmed.</p>
          <h3>Details:</h3>
          <ul>
            <li><strong>Booking ID:</strong> ${booking.id}</li>
            <li><strong>Date/Time:</strong> ${booking.scheduleDateTime.toISOString()}</li>
            <li><strong>Price:</strong> $${service.price.toFixed(2)}</li>
          </ul>
          <p>Thank you for choosing Sheba Platform!</p>
        `,
      };

      await this.getTransporter().sendMail(mailOptions);
      console.log(`Booking confirmation sent to ${booking.email}`);
    } catch (error: any) {
      console.error(`Failed to send email: ${error.message}`);
      throw new Error(`Failed to send booking confirmation: ${error.message}`);
    }
  }
}