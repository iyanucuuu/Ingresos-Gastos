import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Gasto, GastoRequest } from '../models/gasto.model';
import { ResumenMensual } from '../models/ingreso.model';

@Injectable({ providedIn: 'root' })
export class GastosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/gastos`;

  getAll(mes?: number, anio?: number, categoriaId?: number): Observable<Gasto[]> {
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes);
    if (anio) params = params.set('anio', anio);
    if (categoriaId) params = params.set('categoriaId', categoriaId);
    return this.http.get<Gasto[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Gasto> {
    return this.http.get<Gasto>(`${this.baseUrl}/${id}`);
  }

  create(gasto: GastoRequest): Observable<Gasto> {
    return this.http.post<Gasto>(this.baseUrl, gasto);
  }

  update(id: number, gasto: GastoRequest): Observable<Gasto> {
    return this.http.put<Gasto>(`${this.baseUrl}/${id}`, gasto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getResumenMensual(anio: number): Observable<ResumenMensual[]> {
    return this.http.get<ResumenMensual[]>(`${this.baseUrl}/resumen`, {
      params: new HttpParams().set('anio', anio)
    });
  }

  getTotalMes(mes: number, anio: number): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.baseUrl}/total`, {
      params: new HttpParams().set('mes', mes).set('anio', anio)
    });
  }
}
