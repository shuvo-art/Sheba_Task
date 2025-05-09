import { NotificationService } from '../src/modules/notification/notification.service';
import { Booking } from '../src/modules/booking/booking.model';
import { Service } from '../src/modules/service/service.model';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('NotificationService', () => {
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    mockSendMail = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail });
    // Set EMAIL_USER for tests to ensure it's defined
    process.env.EMAIL_USER = 'test@example.com';
  });

  it('should send booking confirmation email', async () => {
    mockSendMail.mockResolvedValue({});

    const booking = {
      id: 1,
      customerName: 'John Doe',
      email: 'test@example.com',
      scheduleDateTime: new Date('2025-05-10T10:00:00Z'),
    } as Booking;

    const service = {
      name: 'Test Service',
      price: 100,
    } as Service;

    await NotificationService.sendBookingConfirmation(booking, service);

    expect(mockSendMail).toHaveBeenCalled();
    expect(mockSendMail.mock.calls[0][0]).toMatchObject({
      to: 'test@example.com',
      subject: 'Booking Confirmation',
      from: expect.stringContaining(process.env.EMAIL_USER!),
    });
  });

  it('should throw error if EMAIL_USER is missing', async () => {
    const originalEmailUser = process.env.EMAIL_USER;
    process.env.EMAIL_USER = '';

    const booking = {
      id: 1,
      customerName: 'John Doe',
      email: 'test@example.com',
      scheduleDateTime: new Date('2025-05-10T10:00:00Z'),
    } as Booking;

    const service = {
      name: 'Test Service',
      price: 100,
    } as Service;

    await expect(
      NotificationService.sendBookingConfirmation(booking, service)
    ).rejects.toThrow('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');

    process.env.EMAIL_USER = originalEmailUser;
  });

  it('should throw error if email send fails', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP error'));

    const booking = {
      id: 1,
      customerName: 'John Doe',
      email: 'test@example.com',
      scheduleDateTime: new Date('2025-05-10T10:00:00Z'),
    } as Booking;

    const service = {
      name: 'Test Service',
      price: 100,
    } as Service;

    await expect(
      NotificationService.sendBookingConfirmation(booking, service)
    ).rejects.toThrow('Failed to send booking confirmation: SMTP error');
  });
});