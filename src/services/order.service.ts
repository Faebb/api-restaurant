import { prisma } from '../config/database';
import type { CreateOrderInput } from '../schemas/order.schema';
import type { OrderResponseDTO } from '../types/api.types';

// Helper: Prisma Decimal → JavaScript number (needed for MySQL Decimal columns)
const toNum = (v: unknown): number => Number(v);

export const orderService = {
  /**
   * Creates an order.
   * - Prices are always taken from the DB — never from the client (prevents price tampering).
   * - All arithmetic uses Number() to handle Prisma Decimal objects returned by MySQL.
   * - Order items + order are persisted in a single transaction.
   */
  async create(input: CreateOrderInput): Promise<OrderResponseDTO> {
    // Fetch all requested menu items in one query
    const menuItemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== menuItemIds.length) {
      const foundIds = menuItems.map((m) => m.id);
      const missing = menuItemIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Ítem(s) de menú no encontrado(s): ${missing.join(', ')}`);
    }

    // Build order items with prices from DB (never trust client-side prices)
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
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { menuItem: { select: { name: true } } },
        },
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

  /**
   * Returns a single order by ID.
   */
  async getById(id: string): Promise<OrderResponseDTO | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { menuItem: { select: { name: true } } },
        },
      },
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
