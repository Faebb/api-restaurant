import { prisma } from '../config/database';
import type { ReservationResponseDTO } from '../types/api.types';

// 1-4 guests → LOW | 5-8 guests → HIGH | 9-10 guests → VIP
function resolveTableType(guests: number): 'LOW' | 'HIGH' | 'VIP' {
  if (guests <= 4) return 'LOW';
  if (guests <= 8) return 'HIGH';
  return 'VIP';
}

function calculateWaitTime(occupiedCount: number): number {
  if (occupiedCount === 0) return 0;
  if (occupiedCount <= 2) return 10;
  if (occupiedCount <= 5) return 15;
  return 20;
}

export const reservationService = {
  async assignTable(tenantId: string, guests: number): Promise<ReservationResponseDTO> {
    const tableType = resolveTableType(guests);

    const availableTable = await prisma.restaurantTable.findFirst({
      where: { tenantId, tableType, isOccupied: false },
      orderBy: { tableNumber: 'asc' },
    });

    if (!availableTable) {
      throw new Error(`No hay mesas disponibles para ${guests} comensales en este momento`);
    }

    const occupiedCount = await prisma.restaurantTable.count({
      where: { tenantId, isOccupied: true },
    });

    const waitTime = calculateWaitTime(occupiedCount);

    const [reservation] = await prisma.$transaction([
      prisma.reservation.create({
        data: {
          tenantId,
          guests,
          waitTime,
          tableId: availableTable.id,
        },
      }),
      prisma.restaurantTable.update({
        where: { id: availableTable.id },
        data: { isOccupied: true },
      }),
    ]);

    return {
      reservationId: reservation.id,
      tableId: availableTable.id,
      tableNumber: availableTable.tableNumber,
      tableType: availableTable.tableType as ReservationResponseDTO['tableType'],
      waitTime,
    };
  },
};
