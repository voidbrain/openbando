import { Injectable, inject, signal } from '@angular/core';
import { alignmentPosition } from '../core/alignment-position';
import { FlightService } from './flight.service';
import { FrameLoopService, FrameOrder } from './frame-loop.service';
import { PlaybackService } from './playback.service';
import { VideoService } from './video.service';
import { SceneService } from './scene.service';

/** Live endpoint availability for both the path panel and Studio. */
@Injectable({ providedIn: 'root' })
export class AlignmentPositionService {
  private readonly flight = inject(FlightService);
  private readonly playback = inject(PlaybackService);
  private readonly video = inject(VideoService);
  private readonly scene = inject(SceneService);
  readonly videoLoaded = this.video.loaded;
  readonly atStart = signal(false);
  readonly atEnd = signal(false);

  constructor() {
    inject(FrameLoopService).every(3, FrameOrder.widgets, () => {
      const v = this.video;
      const p = v.loaded()
        ? alignmentPosition(!!this.flight.active, v.element.currentTime, v.element.duration)
        : alignmentPosition(!!this.flight.active, this.playback.time, this.playback.duration);
      if (p.start !== this.atStart()) this.atStart.set(p.start);
      if (p.end !== this.atEnd()) this.atEnd.set(p.end);
      const pin = this.scene.pin();
      if ((pin === 's' && !p.start) || (pin === 'e' && !p.end)) this.scene.endPin();
    });
  }
}
