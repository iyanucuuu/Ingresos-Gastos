import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DepositoApi {
  id: number;
  importe: number;
  fecha: string;
}

export interface InversionApi {
  id: number;
  nombre: string;
  ticker: string;
  tipo: 'inversion' | 'ahorro';
  invertido: number;
  valorActual: number;
  fecha: string;
  tasaAnual?: number;
  depositos?: DepositoApi[];
}

@Injectable({ providedIn: 'root' })
export class InversionesService {
  private http    = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/inversiones`;

  getAll(): Observable<InversionApi[]> {
    return this.http.get<InversionApi[]>(this.baseUrl);
  }

  create(inv: Partial<InversionApi>): Observable<InversionApi> {
    return this.http.post<InversionApi>(this.baseUrl, inv);
  }

  update(id: number, inv: Partial<InversionApi>): Observable<InversionApi> {
    return this.http.put<InversionApi>(`${this.baseUrl}/${id}`, inv);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** importe > 0 → abono    importe < 0 → retirada */
  addDeposito(invId: number, deposito: { importe: number; fecha: string }): Observable<InversionApi> {
    return this.http.post<InversionApi>(`${this.baseUrl}/${invId}/depositos`, deposito);
  }

  deleteDeposito(invId: number, depositoId: number): Observable<InversionApi> {
    return this.http.delete<InversionApi>(`${this.baseUrl}/${invId}/depositos/${depositoId}`);
  }
}
