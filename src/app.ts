import express from 'express';
import cors from 'cors';
import serviceRoutes from './modules/service/service.routes';
import bookingRoutes from './modules/booking/booking.routes';
import userRoutes from './modules/user/user.routes';
import { errorHandler } from './middleware/error';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

export default app;