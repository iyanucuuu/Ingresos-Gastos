import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ingreso, IngresoRequest, ResumenMensual } from '../models/ingreso.model';

@Injectable({ providedIn: 'root' })
export class IngresosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/ingresos`;

  getAll(mes?: number, anio?: number, categoriaId?: number): Observable<Ingreso[]> {
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes);
    if (anio) params = params.set('anio', anio);
    if (categoriaId) params = params.set('categoriaId', categoriaId);
    return this.http.get<Ingreso[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Ingreso> {
    return this.http.get<Ingreso>(`${this.baseUrl}/${id}`);
  }

  create(ingreso: IngresoRequest): Observable<Ingreso> {
    return this.http.post<Ingreso>(this.baseUrl, ingreso);
  }

  update(id: number, ingreso: IngresoRequest): Observable<Ingreso> {
    return this.http.put<Ingreso>(`${this.baseUrl}/${id}`, ingreso);
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
