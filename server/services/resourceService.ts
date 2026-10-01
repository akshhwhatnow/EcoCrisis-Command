import { resourceRepository, DbResource } from '../db/repositories/resourceRepository.js';
import { AppError } from '../types/api.js';

export const resourceService = {
  async listResources(filters: { status?: DbResource['status']; type?: string }): Promise<DbResource[]> {
    let resources: DbResource[];
    if (filters.status === 'Available') {
      resources = await resourceRepository.findAvailable();
    } else {
      resources = await resourceRepository.findAll();
      if (filters.status) {
        resources = resources.filter((r) => r.status === filters.status);
      }
    }

    if (filters.type) {
      resources = resources.filter((r) => r.resource_type.toLowerCase().includes(filters.type!.toLowerCase()));
    }

    return resources;
  },

  async getResourceById(id: string): Promise<DbResource> {
    const resource = await resourceRepository.findById(id);
    if (!resource) {
      throw new AppError(`Resource not found with ID: ${id}`, 404, 'RESOURCE_NOT_FOUND');
    }
    return resource;
  },

  async updateResourceStatus(id: string, status: DbResource['status']): Promise<DbResource> {
    const updated = await resourceRepository.updateStatus(id, status);
    if (!updated) {
      throw new AppError(`Resource not found with ID: ${id}`, 404, 'RESOURCE_NOT_FOUND');
    }
    return updated;
  },
};
