// ─── Shared API response shape ───────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Menu ────────────────────────────────────────────────────────────────────

export type MenuCategoryKey =
  | 'ENTRADAS'
  | 'SUSHI'
  | 'SOPAS'
  | 'PLATOS'
  | 'TEMPURA'
  | 'VEGETARIANO'
  | 'BEBIDAS'
  | 'POSTRES';

export interface MenuItemDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: MenuCategoryKey;
}

export interface MenuCategoryDTO {
  id: string;
  name: string;
  type: MenuCategoryKey;
  items: MenuItemDTO[];
}

// ─── Reservation ─────────────────────────────────────────────────────────────

export interface ReservationRequestDTO {
  guests: number;
}

export interface ReservationResponseDTO {
  tableId: string;
  tableNumber: number;
  tableType: 'LOW' | 'HIGH' | 'VIP';
  waitTime: number;
  reservationId: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface OrderItemInputDTO {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  reservationId?: string;
  customerName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  paymentMethod: 'card' | 'cash';
  tipType: 'fixed' | 'custom';
  tipValue: number;
  items: OrderItemInputDTO[];
}

export interface OrderResponseDTO {
  id: string;
  customerName: string;
  email: string;
  paymentMethod: string;
  subtotal: number;
  tipValue: number;
  total: number;
  status: string;
  items: {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  createdAt: Date;
}
