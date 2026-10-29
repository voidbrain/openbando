import { Component, ElementRef, Injector, afterNextRender, computed, inject, input, model, signal, viewChild } from '@angular/core';
import { ToolIcon } from './tool-icon';

/** One choice: a picture (a tool-icon key), a name, and an optional line of explanation. */
export interface PickOption {
  id: string;
  label: string;
  icon: string;
  hint?: string;
}

let nextId = 0;

/**
 * A select that shows a picture for every choice (structure kinds, tree kinds, fence materials ...). Keyboard: the
 * button opens it with Enter, Space or the arrows; in the list the arrows, Home and End move, Enter or Space picks,
 * Escape closes and gives the focus back to the button. It is a select-only combobox with a listbox popup.
 */
@Component({
  selector: 'app-pick-menu',
  imports: [ToolIcon],
  host: { '(document:pointerdown)': 'outside($event)' },
  template: `
    <button
      #btn
      type="button"
      class="pm-btn"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listId"
      [attr.aria-label]="label() + ': ' + (current()?.label ?? '')"
      [title]="current()?.hint ?? label()"
      (click)="toggle()"
      (keydown)="btnKey($event)"
    >
      @if (current(); as c) {
        <app-tool-icon [name]="c.icon" />
        @if (!compact()) {
          <span class="pm-txt">{{ c.label }}</span>
        }
      }
      <span class="pm-caret" aria-hidden="true">▾</span>
    </button>
    @if (open()) {
      <ul #list class="pm-list" role="listbox" tabindex="-1" [class.up]="place().up" [class.end]="place().end" [style.max-height.px]="place().max" [id]="listId" [attr.aria-label]="label()" [attr.aria-activedescendant]="listId + '-' + active()" (keydown)="listKey($event)">
        @for (o of options(); track o.id) {
          <li role="option" class="pm-opt" [id]="listId + '-' + $index" [class.on]="o.id === value()" [class.act]="$index === active()" [attr.aria-selected]="o.id === value()" (pointerenter)="active.set($index)" (click)="choose(o.id)">
            <app-tool-icon [name]="o.icon" />
            <span class="pm-lbl">{{ o.label }}@if (o.hint) {<small>{{ o.hint }}</small>}</span>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
    }
    .pm-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 6px;
      background: var(--field);
      border: 1px solid var(--line);
      border-radius: 6px;
      cursor: pointer;
      color: var(--text);
    }
    .pm-btn:hover {
      background: var(--control-hover);
    }
    .pm-caret {
      color: var(--dim);
      font-size: 10px;
    }
    .pm-list {
      position: absolute;
      left: 0;
      top: calc(100% + 4px);
      z-index: 1300;
      margin: 0;
      padding: 4px;
      list-style: none;
      min-width: 220px;
      max-height: 320px; /* bound to the room in the window when it opens */
      overflow: auto;
      overscroll-behavior: contain;
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: var(--panel-solid);
      border: 1px solid var(--line);
      border-radius: 9px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
      outline: none;
    }
    .pm-list.up {
      top: auto;
      bottom: calc(100% + 4px);
    }
    .pm-list.end {
      left: auto;
      right: 0;
    }
    .pm-list:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }
    .pm-opt {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 8px;
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
    }
    .pm-opt.act {
      background: rgba(255, 255, 255, 0.1);
    }
    .pm-opt.on {
      border-color: var(--accent);
    }
    .pm-lbl {
      display: flex;
      flex-direction: column;
    }
    .pm-lbl small {
      color: var(--dim);
      font-size: 11px;
      white-space: normal;
    }
  `,
})
export class PickMenu {
  readonly options = input.required<readonly PickOption[]>();
  readonly value = model.required<string>();
  /** What is being chosen (the accessible name of the control). */
  readonly label = input('Choose');
  /** Only the picture on the button (the list always shows the names). */
  readonly compact = input(false);

  protected readonly listId = `pm-${nextId++}`;
  protected readonly open = signal(false);
  protected readonly active = signal(0);
  /** Where the list opens: below, or above when there is more room there; as tall as the room allows (it scrolls). */
  protected readonly place = signal({ up: false, end: false, max: 320 });
  protected readonly current = computed(() => this.options().find((o) => o.id === this.value()) ?? this.options()[0]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly btn = viewChild.required<ElementRef<HTMLButtonElement>>('btn');
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');

  protected toggle(): void {
    if (this.open()) this.close(true);
    else this.show();
  }

  private show(): void {
    this.active.set(Math.max(0, this.options().findIndex((o) => o.id === this.value())));
    // a menu near the bottom of the window opens upwards; it never reaches past the window (the page must not scroll)
    const r = this.btn().nativeElement.getBoundingClientRect();
    const view = this.host.nativeElement.ownerDocument.documentElement;
    const below = view.clientHeight - r.bottom - 12, above = r.top - 12;
    const wanted = Math.min(320, this.options().length * 36 + 10);
    const up = below < wanted && above > below;
    this.place.set({ up, end: r.left + 220 > view.clientWidth - 8, max: Math.max(80, Math.min(320, up ? above : below)) });
    this.open.set(true);
    // the list exists only after the next render: move the focus into it then, without scrolling the page to it
    afterNextRender(() => {
      this.list()?.nativeElement.focus({ preventScroll: true });
      this.scrollActive();
    }, { injector: this.injector });
  }

  private close(refocus: boolean): void {
    this.open.set(false);
    if (refocus) this.btn().nativeElement.focus();
  }

  protected choose(id: string): void {
    this.value.set(id);
    this.close(true);
  }

  protected btnKey(e: KeyboardEvent): void {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key) && !this.open()) {
      e.preventDefault();
      this.show();
    }
  }

  protected listKey(e: KeyboardEvent): void {
    const n = this.options().length;
    const move = (i: number): void => {
      this.active.set((i + n) % n);
      this.scrollActive();
    };
    if (e.key === 'ArrowDown') move(this.active() + 1);
    else if (e.key === 'ArrowUp') move(this.active() - 1);
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(n - 1);
    else if (e.key === 'Enter' || e.key === ' ') this.choose(this.options()[this.active()]!.id);
    else if (e.key === 'Escape') this.close(true);
    else if (e.key === 'Tab') this.close(false);
    else return;
    e.preventDefault();
    e.stopPropagation();
  }

  /** Bring the active choice into view inside the list only (scrollIntoView would scroll the page as well). */
  private scrollActive(): void {
    afterNextRender(() => {
      const list = this.list()?.nativeElement;
      const act = list?.querySelector<HTMLElement>('.act');
      if (!list || !act) return;
      if (act.offsetTop < list.scrollTop) list.scrollTop = act.offsetTop;
      else if (act.offsetTop + act.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = act.offsetTop + act.offsetHeight - list.clientHeight;
    }, { injector: this.injector });
  }

  protected outside(e: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.close(false);
  }
}
