import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from './user.model';

export class UserService {
  static async register(email: string, password: string, role: 'admin' | 'user' = 'user') {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        role,
      });

      return { id: user.id, email: user.email, role: user.role };
    } catch (error: any) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }

  static async login(email: string, password: string) {
    try {
      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      return token;
    } catch (error: any) {
      throw new Error(`Failed to login: ${error.message}`);
    }
  }
}