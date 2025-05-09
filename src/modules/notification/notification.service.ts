import nodemailer from 'nodemailer';
import { Booking } from '../booking/booking.model';
import { Service } from '../service/service.model';
import mailgunTransport from 'nodemailer-mailgun-transport';

export class NotificationService {
  private static transporter: nodemailer.Transporter | null = null;

  private static initializeTransporter() {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      if (process.env.NODE_ENV === 'test') {
        throw new Error('Email configuration missing: MAILGUN_API_KEY or MAILGUN_DOMAIN not set');
      }
      console.warn('Email configuration missing: MAILGUN_API_KEY or MAILGUN_DOMAIN not set. Email notifications will be skipped.');
      return null;
    }

    const auth = {
      auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      },
    };

    return nodemailer.createTransport(mailgunTransport(auth));
  }

  private static getTransporter() {
    if (!this.transporter) {
      this.transporter = this.initializeTransporter();
    }
    return this.transporter;
  }

  static async sendBookingConfirmation(booking: Booking, service: Service) {
    const transporter = this.getTransporter();
    if (!transporter) {
      if (process.env.NODE_ENV === 'test') {
        throw new Error('Email configuration missing: MAILGUN_API_KEY or MAILGUN_DOMAIN not set');
      }
      console.warn(`Skipping email notification for booking ${booking.id} due to missing email configuration.`);
      return;
    }

    try {
      const mailOptions = {
        from: `"Sheba Platform" <${process.env.MAIL_ID}>`,
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

      await transporter.sendMail(mailOptions);
      console.log(`Booking confirmation sent to ${booking.email}`);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'test') {
        throw new Error(`Failed to send booking confirmation: ${error.message}`);
      }
      console.warn(`Failed to send email to ${booking.email}: ${error.message}. Continuing without email notification.`);
    }
  }
}