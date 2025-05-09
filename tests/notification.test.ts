import { NotificationService } from '../src/modules/notification/notification.service';
import { Booking } from '../src/modules/booking/booking.model';
import { Service } from '../src/modules/service/service.model';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('NotificationService', () => {
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    // Reset the mock for nodemailer.createTransport
    jest.clearAllMocks();
    mockSendMail = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail });

    // Set both EMAIL_USER and EMAIL_PASS for tests
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'testpassword';

    // Reset the transporter in NotificationService to force re-initialization
    (NotificationService as any).transporter = null;
  });

  afterEach(() => {
    // Reset environment variables after each test
    process.env.EMAIL_USER = undefined;
    process.env.EMAIL_PASS = undefined;
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
      from: expect.stringContaining('test@example.com'),
    });
  });

  it('should throw error if EMAIL_USER or EMAIL_PASS is missing', async () => {
    // Store original values
    const originalEmailUser = process.env.EMAIL_USER;
    const originalEmailPass = process.env.EMAIL_PASS;

    // Set EMAIL_USER and EMAIL_PASS to empty strings to trigger the error
    process.env.EMAIL_USER = '';
    process.env.EMAIL_PASS = '';

    // Reset the transporter to force re-initialization with new env vars
    (NotificationService as any).transporter = null;

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

    // Restore original values
    process.env.EMAIL_USER = originalEmailUser;
    process.env.EMAIL_PASS = originalEmailPass;
  });

  it('should throw error if email send fails', async () => {
    // Set mock to reject with an SMTP error
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