import { Injectable } from '@angular/core';

/** Milliseconds of mascot animation actually rendered while Welcome is visible. */
@Injectable({ providedIn: 'root' })
export class MascotProgressService {
  holdAtEnd = false;
  paused = false;
  elapsed = 0;
  revision = 0;
  restart(): void { this.elapsed = 0; this.revision++; }
}
