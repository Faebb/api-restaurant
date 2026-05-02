import { prisma } from '../config/database';
import type { MenuCategoryDTO, MenuItemDTO } from '../types/api.types';

export const menuService = {
  /**
   * Returns all menu categories, each with their items sorted by name.
   */
  async getAll(): Promise<MenuCategoryDTO[]> {
    const categories = await prisma.menuCategory.findMany({
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
        price: Number(item.price), // Prisma Decimal → number
        image: item.image,
        category: item.category as MenuItemDTO['category'],
      })),
    }));
  },

  /**
   * Returns a single menu item by ID.
   */
  async getItemById(id: string): Promise<MenuItemDTO | null> {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) return null;

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price), // Prisma Decimal → number
      image: item.image,
      category: item.category as MenuItemDTO['category'],
    };
  },
};
