import { prisma } from '../config/database';
import type { ReservationResponseDTO } from '../types/api.types';

// Table type logic mirrors the frontend expectation:
// 1-4 guests → LOW | 5-8 guests → HIGH | 9-10 guests → VIP
function resolveTableType(guests: number): 'LOW' | 'HIGH' | 'VIP' {
  if (guests <= 4) return 'LOW';
  if (guests <= 8) return 'HIGH';
  return 'VIP';
}

// Simulated wait time based on current occupancy
function calculateWaitTime(occupiedCount: number): number {
  if (occupiedCount === 0) return 0;
  if (occupiedCount <= 2) return 10;
  if (occupiedCount <= 5) return 15;
  return 20;
}

export const reservationService = {
  /**
   * Assigns the first available table that fits the guest count.
   * Returns reservation details including wait time estimate.
   */
  async assignTable(guests: number): Promise<ReservationResponseDTO> {
    const tableType = resolveTableType(guests);

    // Find first available table of the right type
    const availableTable = await prisma.restaurantTable.findFirst({
      where: { tableType, isOccupied: false },
      orderBy: { tableNumber: 'asc' },
    });

    if (!availableTable) {
      throw new Error(`No hay mesas disponibles para ${guests} comensales en este momento`);
    }

    // Count currently occupied tables to estimate wait time
    const occupiedCount = await prisma.restaurantTable.count({
      where: { isOccupied: true },
    });

    const waitTime = calculateWaitTime(occupiedCount);

    // Persist reservation and mark table as occupied — in one transaction
    const [reservation] = await prisma.$transaction([
      prisma.reservation.create({
        data: {
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
