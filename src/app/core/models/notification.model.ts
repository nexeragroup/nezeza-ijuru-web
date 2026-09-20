export interface Notification {
  readonly id: string;
  readonly type:
    | 'item-ready'
    | 'unavailable'
    | 'clarification'
    | 'delay'
    | 'transfer'
    | 'bill-completed'
    | 'service-request'
    | 'approval';
  readonly message: string;
  readonly createdAt: string;
  readonly read: boolean;
  readonly orderId: string | null;
  readonly tableId: string | null;
}
