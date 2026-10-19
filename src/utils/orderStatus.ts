// Short, customer-facing text for why an order was cancelled (order cards).
export function cancellationText(order: { cancelledBy?: string | null; cancellationReason?: string | null }): string {
  if (order.cancelledBy === 'SYSTEM') return "Store didn't accept in time";
  if (order.cancelledBy === 'ADMIN') return 'Cancelled by Grocr support';
  return order.cancellationReason || 'Cancelled';
}
