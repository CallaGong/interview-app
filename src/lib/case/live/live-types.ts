export interface LiveInterruptEvent {
  userSaid: string;
  aiSaid: string;
  purpose: string;
  reasons?: string[];
  at: string;
}
