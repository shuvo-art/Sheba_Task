import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ServiceService } from './service.service';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  description: z.string().min(1),
});

export class ServiceController {
  static async getServices(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const services = await ServiceService.getServices(page, limit);
      res.status(200).json({ success: true, data: services });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createService(req: AuthRequest, res: Response) {
    try {
      const parsedData = serviceSchema.parse(req.body);
      const data = {
        name: parsedData.name,
        category: parsedData.category,
        price: parsedData.price,
        description: parsedData.description,
      };
      const service = await ServiceService.createService(data);
      res.status(201).json({ success: true, data: service });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateService(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const parsedData = serviceSchema.parse(req.body);
      const data = {
        name: parsedData.name,
        category: parsedData.category,
        price: parsedData.price,
        description: parsedData.description,
      };
      const service = await ServiceService.updateService(id, data);
      res.status(200).json({ success: true, data: service });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteService(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await ServiceService.deleteService(id);
      res.status(200).json({ success: true, message: 'Service deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}