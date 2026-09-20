export const PERMISSIONS = {
  TABLE_VIEW: 'table.view',
  TABLE_TRANSFER: 'table.transfer',
  ORDER_CREATE: 'order.create',
  ORDER_UPDATE: 'order.update',
  ORDER_CANCEL_REQUEST: 'order.cancel.request',
  ORDER_MARK_SERVED: 'order.mark-served',
  BILL_VIEW: 'bill.view',
  BILL_REQUEST: 'bill.request',
  BILL_SPLIT: 'bill.split',
  SHIFT_MANAGE: 'shift.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
