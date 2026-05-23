import { prisma } from '../config/database';
import type { CreateOrderInput } from '../schemas/order.schema';
import type { OrderResponseDTO } from '../types/api.types';

const toNum = (v: unknown): number => Number(v);

export const orderService = {
  async create(tenantId: string, input: CreateOrderInput): Promise<OrderResponseDTO> {
    const menuItemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, tenantId },
    });

    if (menuItems.length !== menuItemIds.length) {
      const foundIds = menuItems.map((m) => m.id);
      const missing = menuItemIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Ítem(s) de menú no encontrado(s): ${missing.join(', ')}`);
    }

    const orderItemsData = input.items.map((inputItem) => {
      const menuItem = menuItems.find((m) => m.id === inputItem.menuItemId)!;
      const unitPrice = toNum(menuItem.price);
      return {
        menuItemId: menuItem.id,
        quantity: inputItem.quantity,
        unitPrice,
        subtotal: unitPrice * inputItem.quantity,
      };
    });

    const subtotal = orderItemsData.reduce((acc, i) => acc + i.subtotal, 0);
    const total = subtotal + input.tipValue;

    const order = await prisma.order.create({
      data: {
        tenantId,
        reservationId: input.reservationId ?? null,
        customerName: input.customerName,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        email: input.email,
        paymentMethod: input.paymentMethod,
        tipType: input.tipType,
        tipValue: input.tipValue,
        subtotal,
        total,
        status: 'PENDING',
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { menuItem: { select: { name: true } } } },
      },
    });

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

  async getById(tenantId: string, id: string): Promise<OrderResponseDTO | null> {
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
};
