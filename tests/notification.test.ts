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

    // Set Mailgun credentials for tests
    process.env.MAILGUN_API_KEY = 'test-api-key';
    process.env.MAILGUN_DOMAIN = 'test-domain';
    process.env.MAIL_ID = 'test@example.com';

    // Reset the transporter in NotificationService to force re-initialization
    (NotificationService as any).transporter = null;
  });

  afterEach(() => {
    // Reset environment variables after each test
    process.env.MAILGUN_API_KEY = undefined;
    process.env.MAILGUN_DOMAIN = undefined;
    process.env.MAIL_ID = undefined;
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

  it('should throw error if MAILGUN_API_KEY or MAILGUN_DOMAIN is missing', async () => {
    // Store original values
    const originalApiKey = process.env.MAILGUN_API_KEY;
    const originalDomain = process.env.MAILGUN_DOMAIN;

    // Set MAILGUN_API_KEY and MAILGUN_DOMAIN to empty strings to trigger the error
    process.env.MAILGUN_API_KEY = '';
    process.env.MAILGUN_DOMAIN = '';

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
    ).rejects.toThrow('Email configuration missing: MAILGUN_API_KEY or MAILGUN_DOMAIN not set');

    // Restore original values
    process.env.MAILGUN_API_KEY = originalApiKey;
    process.env.MAILGUN_DOMAIN = originalDomain;
  });

  it('should throw error if email send fails', async () => {
    // Set mock to reject with an error
    mockSendMail.mockRejectedValue(new Error('Mailgun error'));

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
    ).rejects.toThrow('Failed to send booking confirmation: Mailgun error');
  });
});