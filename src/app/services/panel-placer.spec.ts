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
