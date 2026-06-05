export interface Categoria {
  id: number;
  nombre: string;
  tipo: 'ingreso' | 'gasto';
  icono: string;
  color: string;
  createdAt?: string;
}
