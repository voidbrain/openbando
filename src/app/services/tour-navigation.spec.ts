import {TestBed} from '@angular/core/testing';
import {TourService} from './tour.service';
import {SiteService} from './site.service';
import {LayoutStore} from '../state/layout.store';
import {FrameLoopService} from './frame-loop.service';

beforeEach(() => {localStorage.clear(); TestBed.resetTestingModule();});
it('cancels a showcase before navigation without restoring Welcome over the destination', async () => {
  const tour = TestBed.inject(TourService), layout = TestBed.inject(LayoutStore);
  const site = TestBed.inject(SiteService), before = site.active();
  layout.setVisible('welcome', false);
  const playing = tour.playTour({id: 'navigation', title: 'Welcome', about: '', snippets: ['sc-welcome'], returnToWelcome: true});
  await tour.leaveForNavigation(); await playing;
  layout.setVisible('studio', true);
  expect(tour.state()).toBeNull(); expect(tour.focus()).toBeNull(); expect(tour.cursor()).toBeNull();
  expect(layout.panels().welcome.visible).toBe(false);
  expect(layout.panels().studio.visible).toBe(true);
  expect(site.active()).toBe(before);
  expect(tour.welcomeSeen()).toBe(false);
});
it('keeps focus attached as its target moves/resizes and removes it when detached', () => {
  const tour = TestBed.inject(TourService), loop = TestBed.inject(FrameLoopService);
  const target = document.createElement('div'); document.body.appendChild(target);
  let rect = new DOMRect(10, 20, 100, 50);
  target.getBoundingClientRect = () => rect;
  Reflect.set(tour, 'focusTarget', target);
  tour.focus.set({x: 0, y: 0, w: 1, h: 1});
  loop.runOnce(0, 0, 0);
  expect(tour.focus()).toEqual({x: 10, y: 20, w: 100, h: 50});
  rect = new DOMRect(40, 60, 200, 75); loop.runOnce(0, 0, 0);
  expect(tour.focus()).toEqual({x: 40, y: 60, w: 200, h: 75});
  target.remove(); loop.runOnce(0, 0, 0); expect(tour.focus()).toBeNull();
});
