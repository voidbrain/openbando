/** A monotonic animation timeline that excludes time spent paused. */
export class TourAnimationClock {
  private pausedAt: number | null = null;
  private excluded = 0;
  pause(on: boolean, now: number): void {
    if (on && this.pausedAt === null) this.pausedAt = now;
    else if (!on && this.pausedAt !== null) {
      this.excluded += now - this.pausedAt;
      this.pausedAt = null;
    }
  }
  time(now: number): number { return (this.pausedAt ?? now) - this.excluded; }
}

/** Sample by elapsed active time, rather than stretching an animation to render every missed frame. */
export async function animateTour(duration: number, draw: (fraction: number) => void, driver: {
  now(): number;
  wait(): Promise<void>;
  skipped(): boolean;
}): Promise<void> {
  const start = driver.now();
  draw(0);
  let fraction = 0;
  while (fraction < 1) {
    await driver.wait(); // owns pause/stop handling; a stop propagates to the caller's cleanup
    fraction = driver.skipped() || duration <= 0 ? 1 : Math.min(1, Math.max(0, (driver.now() - start) / duration));
    draw(fraction);
  }
}
