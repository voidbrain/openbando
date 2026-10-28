import {TestBed} from '@angular/core/testing';
import {VideoService} from './video.service';
import {FlightService} from './flight.service';
import {ToastService} from './toast.service';
import {LayoutStore} from '../state/layout.store';

beforeEach(() => { localStorage.clear(); TestBed.resetTestingModule(); });
it('shows decoding state until a frame arrives, resets for another file and exposes decode failures', () => {
  const video = TestBed.inject(VideoService), layout = TestBed.inject(LayoutStore);
  video.load(new File(['video'], 'first.mp4'));
  expect(layout.panels().flights.visible).toBe(true);
  expect(layout.panels().video.visible).toBe(true);
  expect(video.frameReady()).toBe(false);
  video.element.dispatchEvent(new Event('loadeddata'));
  expect(video.frameReady()).toBe(true);
  video.load(new File(['video'], 'second.mp4'));
  expect(video.frameReady()).toBe(false);
  video.element.dispatchEvent(new Event('error'));
  expect(video.loadFailed()).toBe(true);
});
it('restores offsets quietly for showcase loads without hiding normal restore notifications', () => {
  const video = TestBed.inject(VideoService), toast = TestBed.inject(ToastService);
  TestBed.inject(FlightService).add('log', [{lat: 1, lon: 1, alt: 0, t: 0}]);
  TestBed.tick();
  const file = new File(['video'], 'clip.mp4');
  video.load(file); video.setOffset(1.25);
  video.quietSyncNotifications = true;
  video.load(file, {guided: true});
  expect(video.offset()).toBe(1.25);
  expect(toast.message()).not.toContain('Restored saved sync');
  video.quietSyncNotifications = false;
  video.load(file);
  expect(toast.message()).toContain('Restored saved sync');
});
