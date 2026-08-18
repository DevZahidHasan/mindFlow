export class RateLimiter {
  private hits: Map<string, { count: number; expiresAt: number }> = new Map();
  private maxHits: number;
  private windowMs: number;

  constructor(maxHits: number, windowMs: number) {
    this.maxHits = maxHits;
    this.windowMs = windowMs;
  }

  public check(identifier: string): boolean {
    const now = Date.now();
    const record = this.hits.get(identifier);

    if (!record || record.expiresAt < now) {
      // Clean up old entries occasionally
      if (this.hits.size > 1000) {
        for (const [key, val] of Array.from(this.hits.entries())) {
          if (val.expiresAt < now) this.hits.delete(key);
        }
      }

      this.hits.set(identifier, { count: 1, expiresAt: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxHits) {
      return false;
    }

    record.count++;
    return true;
  }
}

// 100 hits per hour per account
export const aiRateLimiter = new RateLimiter(100, 60 * 60 * 1000);
