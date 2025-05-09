import { Service } from './service.model';

interface ServiceData {
  name: string;
  category: string;
  price: number;
  description: string;
}

export class ServiceService {
  static async getServices(page: number, limit: number) {
    try {
      const offset = (page - 1) * limit;
      const { rows: services, count: total } = await Service.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        services,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      throw new Error(`Failed to retrieve services: ${error.message}`);
    }
  }

  static async createService(data: ServiceData) {
    try {
      const service = await Service.create(data as any);
      return service;
    } catch (error: any) {
      throw new Error(`Failed to create service: ${error.message}`);
    }
  }

  static async updateService(id: number, data: ServiceData) {
    try {
      const service = await Service.findByPk(id);
      if (!service) {
        throw new Error('Service not found');
      }

      await service.update(data);
      return service;
    } catch (error: any) {
      throw new Error(`Failed to update service: ${error.message}`);
    }
  }

  static async deleteService(id: number) {
    try {
      const service = await Service.findByPk(id);
      if (!service) {
        throw new Error('Service not found');
      }

      await service.destroy();
    } catch (error: any) {
      throw new Error(`Failed to delete service: ${error.message}`);
    }
  }
}