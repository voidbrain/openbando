import { TestBed } from '@angular/core/testing';
import { LayoutStore } from '../state/layout.store';
import { PanelPlacer } from './panel-placer.service';

describe('panel placement', () => {
  beforeEach(() => { localStorage.clear(); TestBed.resetTestingModule(); });
  it('opens the timeline at its bottom anchor while arranging the other flight panels', async () => {
    const layout = TestBed.inject(LayoutStore);
    layout.moveTo('timeline', 50, 50);
    await TestBed.inject(PanelPlacer).open(['flights', 'timeline', 'speed']);
    expect(layout.panels().timeline.visible).toBe(true);
    expect(layout.panels().timeline.x).toBeNull();
    expect(layout.panels().timeline.y).toBeNull();
    expect(layout.panels().flights.x).not.toBeNull();
    expect(layout.panels().speed.x).not.toBeNull();
  });
});

it('places Flights below Video while retaining the bottom timeline anchor', async () => {
  localStorage.clear(); TestBed.resetTestingModule();
  const layout = TestBed.inject(LayoutStore);
  await TestBed.inject(PanelPlacer).open(['video', 'flights', 'timeline']);
  expect(layout.panels().flights.x).toBe(layout.panels().video.x);
  expect(layout.panels().flights.y).toBeGreaterThan(layout.panels().video.y!);
  expect(layout.panels().timeline.y).toBeNull();
});
