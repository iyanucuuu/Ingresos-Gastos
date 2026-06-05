import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private _logout = new Subject<void>();
  logout$ = this._logout.asObservable();

  logout(): void { this._logout.next(); }
}
