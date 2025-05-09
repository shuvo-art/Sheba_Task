import { Request, Response } from 'express';
import { UserService } from './user.service';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await UserService.register(data.email, data.password, data.role);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const token = await UserService.login(data.email, data.password);
      res.status(200).json({ success: true, data: { token } });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }
}