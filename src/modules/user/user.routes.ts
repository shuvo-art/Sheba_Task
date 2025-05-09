import { Router } from 'express';
import { UserController } from './user.controller';

const router = Router();

// Register a new user
router.post('/register', UserController.register);

// Login and get JWT
router.post('/login', UserController.login);

export default router;