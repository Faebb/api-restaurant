import { prisma } from '../config/database';
import type { MenuCategoryDTO, MenuItemDTO } from '../types/api.types';

export const menuService = {
  async getAll(tenantId: string): Promise<MenuCategoryDTO[]> {
    const categories = await prisma.menuCategory.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: { orderBy: { name: 'asc' } },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type as MenuCategoryDTO['type'],
      items: cat.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        image: item.image,
        category: item.category as MenuItemDTO['category'],
      })),
    }));
  },

  async getItemById(tenantId: string, id: string): Promise<MenuItemDTO | null> {
    const item = await prisma.menuItem.findFirst({ where: { id, tenantId } });
    if (!item) return null;

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      image: item.image,
      category: item.category as MenuItemDTO['category'],
    };
  },
};
