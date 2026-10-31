import { Component, effect, inject, signal, untracked } from '@angular/core';
import { PanelPlacer } from '../../services/panel-placer.service';
import { PANELS } from '../panel-defs';
import { ViewStore } from '../../state/view.store';
import { LayoutStore } from '../../state/layout.store';
import { LibraryStore } from '../../services/library-store.service';
import { storageAdvice } from '../../core/storage-errors';
import type { Privacy } from '../../core/share';
import { BackupService } from '../../services/backup.service';
import { DownloadService } from '../../services/download.service';
import { tr } from '../../services/i18n.service';
import { ExampleBandosService } from '../../services/example-bandos.service';
import { newerExample, type ExampleBando } from '../../core/examples';
import type { SiteEntry } from '../../services/site-library.service';
import { FormsModule } from '@angular/forms';
import { SiteService } from '../../services/site.service';
import { StudioService } from '../../services/studio.service';
import { ToastService } from '../../services/toast.service';
import { TourService } from '../../services/tour.service';
import { Panel } from '../panel/panel';
import { BandoEditor } from './bando-editor';

/**
 * Bandos: the entry point of the map builder. First a list — open, create, edit the area of, duplicate, rename or
 * delete a bando — then, for a new / edited bando, the zone map where you search a place, drag and zoom the map to
 * frame the area, and generate the 3D model from it.
 */
@Component({
  selector: 'app-studio-panel',
  imports: [Panel, FormsModule, BandoEditor],
  template: `
    <app-panel id="studio">
      @if (studio.view() === 'list') {
        <div class="row">
          <button class="btn primary" (click)="newBando($event)" data-tour="new-bando">＋ New bando</button>
          <label class="btn">Import<input type="file" accept=".json,application/json" hidden (change)="importFile($event)" /></label>
          <span class="grow"></span>
          <button class="btn" (click)="backupAll()" [disabled]="!site.bandos().length" title="Save every bando and your own blocks in one file (keep it somewhere safe: the browser can lose what it stores)">Back up all</button>
          <label class="btn" title="Bring back a backup file: bandos it has that are missing here are added, an older copy here is replaced, a newer one is kept">Restore…<input type="file" accept=".json,application/json" hidden (change)="restoreFile($event)" /></label>
        </div>
        @if (storage.health().problem; as pb) {
          <div class="notice warn" role="alert">
            {{ advice(pb) }}
            <button class="btn" (click)="backupAll()">Back up all</button>
          </div>
        }
        @if (site.bandos().length === 0) {
          <div class="empty dim">
            No bando yet. Press <b>New bando</b>, search a place, frame the area on the map and generate the 3D model.
          </div>
        }
        <div class="list">
          @for (b of site.bandos(); track b.id) {
            <div class="card" [class.active]="b.id === site.active().id">
              <button class="title" (click)="show($event, b.id)" [title]="'Show ' + b.name + ' in 3D'">
                <b>{{ b.name }}</b>
                @if (b.id === site.active().id) { <span class="badge">active</span> }
                <span class="dim small mono">{{ b.buildings }} buildings · {{ b.privacy === 'hidden' ? 'place hidden' : b.origin.lat.toFixed(4) + ', ' + b.origin.lon.toFixed(4) }}</span>
              </button>
              @if (newer(b); as ex) {
                <div class="small upd">
                  A newer release of “{{ ex.name }}” is out.
                  <button class="btn" (click)="openExample($event, ex)">Open a fresh copy</button>
                </div>
              }
              <div class="acts">
                <button class="btn primary" (click)="fly($event, b.id)">Fly</button>
                <button class="btn" (click)="edit($event, b.id)" [title]="b.privacy === 'hidden' ? 'Edit the model (its place is hidden, so there is no map area)' : 'Change the area on the map and regenerate'">{{ b.privacy === 'hidden' ? 'Edit' : 'Edit area' }}</button>
                <button class="btn" (click)="rename(b.id, b.name)">Rename</button>
                <button class="btn" (click)="duplicate(b.id)">Duplicate</button>
                @if (b.privacy === 'hidden') {
                  <button class="btn" (click)="exportOne(b.id, 'hidden')" title="Save it as a file to share; its place stays hidden">Export</button>
                } @else {
                  <span class="grp">
                    <button class="btn" (click)="exportOne(b.id, 'exact')" title="Save it as a file to share, with its place">Export</button>
                    <button class="btn" (click)="exportOne(b.id, 'hidden')" title="Save a copy to share without its place: no map, no map names, no GPS landmarks">Export hidden</button>
                  </span>
                }
                <button class="btn danger" (click)="remove(b.id, b.name)">Delete</button>
              </div>
            </div>
          }
        </div>
        <h4 class="caption" data-tour="examples">Examples</h4>
        @if (examples.status() === 'error') {
          <div class="dim small">The examples could not be downloaded. <button class="btn" (click)="examples.load()">Try again</button></div>
        }
        <div class="list">
          @for (e of examples.list(); track e.file) {
            <div class="card ex">
              <div class="title static">
                <span class="example-name">
                  <b>{{ e.name }}</b>
                  @if (e.about) {
                    <span class="example-info" (mouseenter)="exampleInfo.set(e.file)" (mouseleave)="exampleInfo.set(null)">
                      <button class="btn info" aria-label="About this bando" title="About this bando"
                        [attr.aria-describedby]="'example-info-' + e.file"
                        [attr.aria-expanded]="exampleInfo() === e.file"
                        (focus)="exampleInfo.set(e.file)"
                        (click)="exampleInfo.set(e.file)"
                        (blur)="exampleInfo.set(null)"
                        (keydown.escape)="exampleInfo.set(null); $event.stopPropagation()">i</button>
                      <span class="example-tooltip small" role="tooltip" [id]="'example-info-' + e.file"
                        [class.shown]="exampleInfo() === e.file">{{ e.about }}</span>
                    </span>
                  }
                </span>
                <span class="dim small mono">{{ e.buildings }} buildings · {{ e.privacy === 'hidden' ? 'place hidden' : e.origin.lat.toFixed(4) + ', ' + e.origin.lon.toFixed(4) }}</span>
              </div>
              <div class="acts">
                <button class="btn" (click)="openExample($event, e)" [attr.data-tour]="'example-' + e.file.replace('bandos/', '').replace('.json', '')" [disabled]="opening() === e.file" [title]="'Add a copy of ' + e.name + ' to your bandos and open it'">{{ opening() === e.file ? 'Opening…' : 'Open a copy' }}</button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="zone">
          <app-bando-editor>
            <button class="btn" (click)="studio.back()">← Bandos</button>
            <input type="text" class="name" [ngModel]="studio.name()" (ngModelChange)="studio.name.set($event)" placeholder="Bando name" aria-label="Bando name" />
          </app-bando-editor>
        </div>
      }
    </app-panel>
  `,
  styles: `
    .zone {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      /* the panel's height follows its content on the list: the editor needs room of its own */
      min-height: min(540px, calc(100vh - 120px));
    }
    .name {
      width: 180px;
    }
    .upd {
      margin: 4px 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      color: var(--accent);
    }
    .notice {
      margin: 6px 0;
      padding: 6px 8px;
      border: 1px solid var(--warn);
      border-radius: 6px;
      font-size: 12px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 6px 8px;
      background: #17211b;
    }
    .card.active {
      border-color: var(--accent);
    }
    .title {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 8px;
      width: 100%;
      background: none;
      border: 0;
      padding: 0 0 4px;
      text-align: left;
      cursor: pointer;
    }
    .badge {
      background: var(--accent);
      color: var(--accent-ink);
      border-radius: 8px;
      padding: 0 6px;
      font-size: 10px;
      font-weight: 700;
    }
    .acts {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .caption {
      margin: 12px 0 2px;
    }
    .title.static {
      cursor: default;
    }
    .example-name {
      display: inline-flex;
      align-items: center;
      gap: var(--space-4);
    }
    .example-info {
      display: inline-flex;
    }
    .card.ex {
      position: relative;
    }
    .info {
      border-radius: 50%;
      width: 24px;
      height: 24px;
      padding: 0;
      font-family: var(--mono);
      color: var(--dim);
    }
    .info:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .example-tooltip {
      display: none;
      position: absolute;
      top: 28px;
      left: var(--space-8);
      right: var(--space-8);
      z-index: 1;
      padding: var(--space-8);
      color: var(--text);
      background: var(--panel-solid);
      border: 1px solid var(--line);
      border-radius: var(--radius-control);
      box-shadow: var(--shadow-box);
      font-weight: normal;
    }
    .example-tooltip.shown {
      display: block;
    }
    .empty {
      padding: 18px 8px;
      text-align: center;
    }
  `,
})
export class StudioPanel {
  protected readonly exampleInfo = signal<string | null>(null);
  protected readonly studio = inject(StudioService);
  protected readonly site = inject(SiteService);
  private readonly placer = inject(PanelPlacer);
  private readonly view = inject(ViewStore);
  private readonly tour = inject(TourService);
  /**
   * The pilot (a real click, not the guide's) opens another bando while a guide or the Welcome showcase plays: the guide
   * ends first, with its replay and video, and leaves the pilot where they went (the showcase kept playing Villetta's
   * flight over the bando they chose).
   */
  private async leaveTour(e: Event): Promise<void> {
    if (e.isTrusted) await this.tour.leaveForNavigation();
  }
  protected async newBando(e: Event): Promise<void> {
    await this.leaveTour(e);
    this.studio.create();
  }
  protected async show(e: Event, id: string): Promise<void> {
    await this.leaveTour(e);
    this.studio.open(id);
  }
  protected async edit(e: Event, id: string): Promise<void> {
    await this.leaveTour(e);
    this.studio.edit(id);
  }
  protected async fly(e: Event, id: string): Promise<void> {
    await this.leaveTour(e);
    this.studio.open(id);
    this.view.setMainSource('3d');
    this.layout.setVisible('studio', false);
    // the replay workspace, with the Fly checklist beside it for what to do next (F-018)
    void this.placer.open([...PANELS.filter(panel => panel.group === 'telemetry' && panel.id !== 'live').map(panel => panel.id), 'fly']);
  }
  private readonly toast = inject(ToastService);
  private readonly layout = inject(LayoutStore);
  protected readonly storage = inject(LibraryStore);
  protected readonly advice = storageAdvice;
  /** A newer release of the example this bando was copied from (its own edits are not touched: a fresh copy is offered). */
  protected newer = (b: SiteEntry): ExampleBando | null => newerExample(b, this.examples.list());
  private readonly downloads = inject(DownloadService);
  private readonly backups = inject(BackupService);
  protected readonly examples = inject(ExampleBandosService);
  /** The example being downloaded. */
  protected readonly opening = signal<string | null>(null);

  constructor() {
    void this.examples.load();
    // the list is a narrow card; the editor gets more width while it is open (unless the pilot sized the panel)
    let widened = false;
    effect(() => {
      const zone = this.studio.view() === 'zone';
      untracked(() => {
        const w = this.layout.panels().studio.w;
        if (zone && w === null) {
          const width = Math.min(900, innerWidth - 24);
          this.layout.setWidth('studio', width);
          // widening keeps the left edge: slide a panel opened right of centre back inside the window
          const box = document.querySelector('app-panel[data-id="studio"]')?.getBoundingClientRect();
          if (box && box.left + width > innerWidth - 12) this.layout.moveTo('studio', Math.max(12, innerWidth - 12 - width), box.top);
          widened = true;
        } else if (!zone && widened) {
          this.layout.restore({ studio: { w: null, h: null } });
          widened = false;
        }
      });
    });
  }

  protected async openExample(ev: Event, e: ExampleBando): Promise<void> {
    await this.leaveTour(ev);
    this.opening.set(e.file);
    await this.examples.open(e);
    this.opening.set(null);
  }
  /** Export one bando: with its place or hidden (a bando whose place is hidden is always exported hidden). */
  protected async exportOne(id: string, privacy: Privacy): Promise<void> {
    const f = await this.site.exportShared(id, privacy);
    if (!f) return;
    this.downloads.save(f.name, f.text, 'application/json');
    const where = f.hidden ? ' without its place' : '';
    this.toast.show(`Exported ${f.name}${where}${f.ground ? '; its real ground travels inside' : ''}.`);
  }

  protected rename(id: string, current: string): void {
    const name = prompt(tr('Bando name'), current);
    if (name) this.site.rename(id, name);
  }

  protected duplicate(id: string): void {
    if (this.site.duplicate(id)) this.toast.show('Bando duplicated.');
  }

  protected remove(id: string, name: string): void {
    if (confirm(tr(`Delete “${name}”? This cannot be undone.`))) this.site.remove(id);
  }

  protected async backupAll(): Promise<void> {
    const b = await this.backups.backup();
    this.downloads.save(b.name, b.text, 'application/json');
    this.toast.show(`Backed up ${b.bandos} bandos and ${b.blocks} own blocks in ${b.name}.`);
  }

  protected async restoreFile(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const r = await this.backups.restore(await file.text());
    if (!r) return void this.toast.show('That file is not an OpenBando backup.');
    const parts = [
      r.added && `${r.added} added`,
      r.replaced && `${r.replaced} replaced by the backup's newer copy`,
      r.kept && `${r.kept} kept (newer here)`,
      r.blocks && `${r.blocks} own blocks`,
      r.dropped && `${r.dropped} broken entries skipped`,
    ].filter((x): x is string => !!x);
    this.toast.show(parts.length ? `Restored: ${parts.join(' · ')}.` : 'Nothing to restore: the backup is empty.', 5000);
  }

  protected async importFile(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.site.importJson(await file.text());
    input.value = '';
  }
}
