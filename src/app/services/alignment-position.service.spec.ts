import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AlignmentPositionService } from './alignment-position.service';
import { FlightService } from './flight.service';
import { FrameLoopService } from './frame-loop.service';
import { PlaybackService } from './playback.service';
import { SceneService } from './scene.service';
import { VideoService } from './video.service';

describe('alignment position service', () => {
  it('uses video endpoints when loaded, flight endpoints otherwise, and cancels a stale pin', () => {
    let tick = (): void => undefined;
    const video = { loaded: signal(false), element: { currentTime: 3, duration: 20 } };
    const playback = { time: 0, duration: 10 };
    const pin = signal<'s' | 'e' | null>(null);
    const endPin = vi.fn(() => pin.set(null));
    TestBed.configureTestingModule({ providers: [
      AlignmentPositionService,
      { provide: FlightService, useValue: { active: {} } },
      { provide: PlaybackService, useValue: playback },
      { provide: VideoService, useValue: video },
      { provide: SceneService, useValue: { pin, endPin } },
      { provide: FrameLoopService, useValue: { every: (_n: number, _order: number, cb: () => void) => { tick = cb; return () => undefined; } } },
    ] });
    const gate = TestBed.inject(AlignmentPositionService);
    tick();
    expect(gate.atStart()).toBe(true);
    video.loaded.set(true);
    pin.set('s');
    tick();
    expect(gate.atStart()).toBe(false);
    expect(endPin).toHaveBeenCalledOnce();
    video.element.currentTime = 20;
    tick();
    expect(gate.atEnd()).toBe(true);
    playback.time = 10;
    video.element.currentTime = 8;
    tick();
    expect(gate.atEnd()).toBe(false); // video time, not the flight clock, controls the pin
  });
});
