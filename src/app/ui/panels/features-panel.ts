import { Component, inject } from '@angular/core';
import { LayoutStore } from '../../state/layout.store';
import { Panel } from '../panel/panel';
import type { PanelId } from '../panel-defs';

@Component({
  selector: 'app-features-panel',
  imports: [Panel],
  template: `<app-panel id="features"><div class="features"><h2>Build it. Fly it. Share it.</h2><p>Turn your favourite places into your own FPV world.</p><div class="grid">
    @for (card of cards; track card.title) { <button class="card" (click)="open(card.panel)"><span class="icon" aria-hidden="true">{{card.icon}}</span><strong>{{card.title}}</strong><span>{{card.text}}</span></button> }
  </div></div></app-panel>`,
  styles: `.features {padding:16px} h2 {font-size:clamp(26px,4vw,48px);margin:0} .grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px} .card {aspect-ratio:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left;gap:12px;padding:20px;border:1px solid var(--line);border-radius:var(--radius-box);background:var(--panel-solid);color:var(--text);cursor:pointer} .card:hover,.card:focus-visible {border-color:var(--accent);outline-color:var(--accent)} .icon {font-size:42px;color:var(--accent)} strong {font-size:20px} @media(max-width:700px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}} @media(max-width:400px){.grid{grid-template-columns:1fr}}`,
})
export class FeaturesPanel {
  private readonly layout = inject(LayoutStore);
  protected readonly cards: {icon:string;title:string;text:string;panel:PanelId}[] = [
    {icon:'▦',title:'Build your worlds',text:'Create and shape your own bando.',panel:'studio'},
    {icon:'▶',title:'Relive the thrill',text:'Replay your flights with video and telemetry.',panel:'flights'},
    {icon:'↗',title:'Share your adventures',text:'Export your bando and share your story.',panel:'studio'},
    {icon:'⌂',title:'Keep control of your data',text:'Work locally; share only when you choose.',panel:'studio'},
    {icon:'⚑',title:'Challenge your friends',text:'Compare flights and race together.',panel:'flights'},
    {icon:'✚',title:'Take the controls',text:'Fly your world in the simulator.',panel:'simulator'},
    {icon:'⌁',title:'See every detail',text:'Explore speed, attitude and telemetry.',panel:'timeline'},
    {icon:'▣',title:'Create your own blocks',text:'Build a library of obstacles and structures.',panel:'studio'},
    {icon:'◎',title:'Fly your own places',text:'Turn map data into a world to explore.',panel:'studio'},
  ];
  protected open(id:PanelId):void {this.layout.setVisible('features',false);this.layout.setVisible('welcome',false);this.layout.setVisible(id,true);}
}
