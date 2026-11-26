import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { SiteEditor } from '../core/site-editor';
import { emptySpec, type SiteSpec } from '../core/site-spec';
import { AiService } from './ai.service';
import { SiteService } from './site.service';

/** A bando with one building named Warehouse (neutral test data). */
const bando = (name: string): SiteSpec => {
  const s = emptySpec({ lat: 45.4642, lon: 9.19 }, name);
  s.buildings = [
    {
      id: 'w',
      name: 'Warehouse',
      pos: { x: 0, z: 0 },
      rotDeg: 0,
      length: 30,
      width: 12,
      levels: [
        {
          baseY: 0,
          height: 4,
          sides: { n: true, s: true, e: true, w: true },
          doors: {},
          partitions: [],
          roof: 'gable',
          roofRise: 2,
        },
      ],
    },
  ];
  return s;
};

const RENAME = JSON.stringify({
  reply: 'Renamed.',
  commands: [{ op: 'rename', building: 'Warehouse', name: 'Depot' }],
});

/** The assistant with a model whose answer is held until the test releases it. */
const setup = (): { ai: AiService; editor: SiteEditor; release: (text: string) => void } => {
  const editor = new SiteEditor();
  TestBed.configureTestingModule({
    providers: [{ provide: SiteService, useValue: { editor, applyDraft: vi.fn() } }],
  });
  const ai = TestBed.inject(AiService);
  ai.status.set('ready');
  let release: (text: string) => void = () => undefined;
  vi.spyOn(ai as unknown as { complete: () => Promise<string> }, 'complete').mockImplementation(
    () => new Promise<string>((r) => (release = r)),
  );
  return { ai, editor, release: (t) => release(t) };
};

describe('AiService with a delayed model answer (B-050)', () => {
  it('applies an answer to the unchanged draft as one undo step', async () => {
    TestBed.resetTestingModule();
    const { ai, editor, release } = setup();
    editor.load(bando('First'));
    const sent = ai.send('rename the warehouse to Depot');
    release(RENAME);
    await sent;
    expect(editor.draft().buildings[0]!.name).toBe('Depot');
    expect(ai.messages().at(-1)!.changed).toBe(true);
    ai.undoLast();
    expect(editor.draft().buildings[0]!.name).toBe('Warehouse');
  });

  it('does not apply an answer to another bando opened while the model was thinking', async () => {
    TestBed.resetTestingModule();
    const { ai, editor, release } = setup();
    editor.load(bando('First'));
    const sent = ai.send('rename the warehouse to Depot');
    editor.load(bando('Second')); // the pilot opens another bando before the answer arrives
    release(RENAME);
    await sent;
    expect(editor.draft().name).toBe('Second');
    expect(editor.draft().buildings[0]!.name).toBe('Warehouse'); // the other bando is untouched
    const last = ai.messages().at(-1)!;
    expect(last.changed).toBe(false); // and the chat does not claim a change
    expect(ai.canUndo()).toBe(false);
  });

  it('does not apply an answer over an edit made while the model was thinking', async () => {
    TestBed.resetTestingModule();
    const { ai, editor, release } = setup();
    editor.load(bando('First'));
    const sent = ai.send('rename the warehouse to Depot');
    editor.commitSite((s) => {
      s.buildings[0]!.name = 'Barn'; // the pilot renames it by hand meanwhile
    });
    release(RENAME);
    await sent;
    expect(editor.draft().buildings[0]!.name).toBe('Barn'); // the pilot's edit stands
    expect(ai.messages().at(-1)!.changed).toBe(false);
  });
});
