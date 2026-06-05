import { Categoria } from './categoria.model';
import { Periodicidad } from './ingreso.model';

export interface Gasto {
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

export interface GastoRequest {
  concepto: string;
  importe: number;
  fecha: string;
  categoriaId: number;
  periodicidad: Periodicidad;
  notas?: string;
}
