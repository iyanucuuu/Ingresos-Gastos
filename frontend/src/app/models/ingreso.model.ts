import { Categoria } from './categoria.model';

export type Periodicidad = 'puntual' | 'mensual' | 'trimestral' | 'anual';

export interface Ingreso {
  id: number;
  concepto: string;
  importe: number;
  fecha: string;
  categoriaId: number;
  categoria?: Categoria;
  periodicidad: Periodicidad;
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IngresoRequest {
  concepto: string;
  importe: number;
  fecha: string;
  categoriaId: number;
  periodicidad: Periodicidad;
  notas?: string;
}

export interface ResumenMensual {
  mes: number;
  anio: number;
  total: number;
  count: number;
}
