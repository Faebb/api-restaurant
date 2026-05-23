import { prisma } from '../config/database';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  CreateTableInput,
  UpdateTableInput,
} from '../schemas/admin.schema';

const toNum = (v: unknown): number => Number(v);

// ─── Menu Categories ─────────────────────────────────────────────────────

export const adminCategoryService = {
  async list(tenantId: string) {
    return prisma.menuCategory.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } },
    });
  },

  async create(tenantId: string, input: CreateCategoryInput) {
    return prisma.menuCategory.create({
      data: {
        tenantId,
        name: input.name,
        type: input.type,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  },

  async update(tenantId: string, id: string, input: UpdateCategoryInput) {
    const existing = await prisma.menuCategory.findFirst({ where: { id, tenantId } });
    if (!existing) throw new Error('Categoría no encontrada');
    return prisma.menuCategory.update({ where: { id }, data: input });
  },

  async remove(tenantId: string, id: string) {
    const existing = await prisma.menuCategory.findFirst({ where: { id, tenantId } });
    if (!existing) throw new Error('Categoría no encontrada');
    await prisma.menuItem.deleteMany({ where: { categoryId: id, tenantId } });
    return prisma.menuCategory.delete({ where: { id } });
  },
};

// ─── Menu Items ──────────────────────────────────────────────────────────

export const adminMenuItemService = {
  async list(tenantId: string) {
    const items = await prisma.menuItem.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    return items.map((i) => ({ ...i, price: toNum(i.price) }));
  },

  async create(tenantId: string, input: CreateMenuItemInput) {
    const category = await prisma.menuCategory.findFirst({
      where: { id: input.categoryId, tenantId },
    });
    if (!category) throw new Error('Categoría no encontrada');

    const item = await prisma.menuItem.create({
      data: {
        tenantId,
        categoryId: input.categoryId,
        name: input.name,
        description: input.description,
        price: input.price,
        image: input.image,
        category: input.category,
      },
    });
    return { ...item, price: toNum(item.price) };
  },

  async update(tenantId: string, id: string, input: UpdateMenuItemInput) {
    const existing = await prisma.menuItem.findFirst({ where: { id, tenantId } });
    if (!existing) throw new Error('Ítem no encontrado');
    if (input.categoryId) {
      const category = await prisma.menuCategory.findFirst({
        where: { id: input.categoryId, tenantId },
      });
      if (!category) throw new Error('Categoría no encontrada');
    }
    const item = await prisma.menuItem.update({ where: { id }, data: input });
    return { ...item, price: toNum(item.price) };
  },

  async remove(tenantId: string, id: string) {
    const existing = await prisma.menuItem.findFirst({ where: { id, tenantId } });
    if (!existing) throw new Error('Ítem no encontrado');
    return prisma.menuItem.delete({ where: { id } });
  },
};

// ─── Tables ──────────────────────────────────────────────────────────────

export const adminTableService = {
  async list(tenantId: string) {
    return prisma.restaurantTable.findMany({
      where: { tenantId },
      orderBy: { tableNumber: 'asc' },
    });
  },

  async create(tenantId: string, input: CreateTableInput) {
    const existing = await prisma.restaurantTable.findFirst({
      where: { tenantId, tableNumber: input.tableNumber },
    });
    if (existing) throw new Error('El número de mesa ya existe');
    return prisma.restaurantTable.create({
      data: {
        tenantId,
        tableNumber: input.tableNumber,
        tableType: input.tableType,
        capacity: input.capacity,
      },
    });
  },

  async update(tenantId: string, id: string, input: UpdateTableInput) {
    const existing = await prisma.restaurantTable.findFirst({ where: { id, tenantId } });
    if (!existing) throw new Error('Mesa no encontrada');
    if (input.tableNumber && input.tableNumber !== existing.tableNumber) {
      const dup = await prisma.restaurantTable.findFirst({
        where: { tenantId, tableNumber: input.tableNumber },
      });
      if (dup) throw new Error('El número de mesa ya existe');
    }
    return prisma.restaurantTable.update({ where: { id }, data: input });
  },

  async remove(tenantId: string, id: string) {
    const existing = await prisma.restaurantTable.findFirst({ where: { id, tenantId } });
    if (!existing) throw new Error('Mesa no encontrada');
    return prisma.restaurantTable.delete({ where: { id } });
  },
};

// ─── Orders ──────────────────────────────────────────────────────────────

export const adminOrderService = {
  async list(tenantId: string) {
    const orders = await prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { menuItem: { select: { name: true } } } } },
    });
    return orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      email: o.email,
      paymentMethod: o.paymentMethod,
      subtotal: toNum(o.subtotal),
      tipValue: toNum(o.tipValue),
      total: toNum(o.total),
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: toNum(item.unitPrice),
        subtotal: toNum(item.subtotal),
      })),
    }));
  },

  async getById(tenantId: string, id: string) {
    const order = await prisma.order.findFirst({
      where: { id, tenantId },
      include: { items: { include: { menuItem: { select: { name: true } } } } },
    });
    if (!order) return null;
    return {
      id: order.id,
      customerName: order.customerName,
      email: order.email,
      paymentMethod: order.paymentMethod,
      subtotal: toNum(order.subtotal),
      tipValue: toNum(order.tipValue),
      total: toNum(order.total),
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: toNum(item.unitPrice),
        subtotal: toNum(item.subtotal),
      })),
    };
  },

  async updateStatus(tenantId: string, id: string, status: string) {
    const existing = await prisma.order.findFirst({ where: { id, tenantId } });
    if (!existing) throw new Error('Orden no encontrada');
    const updated = await prisma.order.update({ where: { id }, data: { status } });
    return { id: updated.id, status: updated.status };
  },
};

// ─── Reservations ────────────────────────────────────────────────────────

export const adminReservationService = {
  async list(tenantId: string) {
    return prisma.reservation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { table: true },
    });
  },
};
