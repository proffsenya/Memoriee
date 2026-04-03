export interface ILimiter {
  getRemaining(eventId: string, guestId: string): Promise<number>;
  increment(eventId: string, guestId: string): Promise<void>;
}

export class InMemoryLimiter implements ILimiter {
  private storage = new Map<string, number>();

  constructor(private maxPerGuest: number) {}

  private getKey(eventId: string, guestId: string): string {
    return `${eventId}:${guestId}`;
  }

  async getRemaining(eventId: string, guestId: string): Promise<number> {
    const key = this.getKey(eventId, guestId);
    const used = this.storage.get(key) || 0;
    return Math.max(0, this.maxPerGuest - used);
  }

  async increment(eventId: string, guestId: string): Promise<void> {
    const key = this.getKey(eventId, guestId);
    const used = this.storage.get(key) || 0;
    this.storage.set(key, used + 1);
  }
}