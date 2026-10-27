import { Injectable } from '@angular/core';

/** Milliseconds of mascot animation actually rendered while Welcome is visible. */
@Injectable({ providedIn: 'root' })
export class MascotProgressService {
  elapsed = 0;
}
