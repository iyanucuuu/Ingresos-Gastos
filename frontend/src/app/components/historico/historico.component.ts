import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosService } from '../../services/ingresos.service';
import { GastosService } from '../../services/gastos.service';
import { Ingreso } from '../../models/ingreso.model';
import { Gasto } from '../../models/gasto.model';

type Movimiento = (Ingreso | Gasto) & { tipo: 'ingreso' | 'gasto' };

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoComponent implements OnInit {
  private ingresosService = inject(IngresosService);
  private gastosService = inject(GastosService);

  movimientos: Movimiento[] = [];
  movimientosFiltrados: Movimiento[] = [];
  loading = true;

  anioActual = new Date().getFullYear();
  anios = [2026, 2025, 2024];

  filtroAnio = this.anioActual;
  filtroTipo: 'todos' | 'ingreso' | 'gasto' = 'todos';
  filtroTexto = '';

  totalIngresos = 0;
  totalGastos = 0;

  meses = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.loading = true;
    Promise.all([
      this.ingresosService.getAll(undefined, this.filtroAnio).toPromise(),
      this.gastosService.getAll(undefined, this.filtroAnio).toPromise()
    ]).then(([ingresos, gastos]) => {
      const movIng: Movimiento[] = (ingresos ?? []).map(i => ({ ...i, tipo: 'ingreso' as const }));
      const movGas: Movimiento[] = (gastos ?? []).map(g => ({ ...g, tipo: 'gasto' as const }));
      this.movimientos = [...movIng, ...movGas]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      this.totalIngresos = (ingresos ?? []).reduce((s, i) => s + i.importe, 0);
      this.totalGastos = (gastos ?? []).reduce((s, g) => s + g.importe, 0);
      this.aplicarFiltros();
      this.loading = false;
    });
  }

  aplicarFiltros(): void {
    this.movimientosFiltrados = this.movimientos.filter(m => {
      const porTipo = this.filtroTipo === 'todos' || m.tipo === this.filtroTipo;
      const porTexto = !this.filtroTexto || m.concepto.toLowerCase().includes(this.filtroTexto.toLowerCase());
      return porTipo && porTexto;
    });
  }

  cambiarAnio(anio: number): void { this.filtroAnio = anio; this.cargarDatos(); }
  setTipo(tipo: 'todos' | 'ingreso' | 'gasto'): void { this.filtroTipo = tipo; this.aplicarFiltros(); }

  agrupadosPorMes(): { mes: string; items: Movimiento[] }[] {
    const grupos: { [key: string]: Movimiento[] } = {};
    this.movimientosFiltrados.forEach(m => {
      const key = m.fecha.substring(0, 7);
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(m);
    });
    return Object.entries(grupos)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => {
        const [anio, mes] = key.split('-');
        return { mes: `${this.meses[parseInt(mes)]} ${anio}`, items };
      });
  }

  getTotalGrupo(items: Movimiento[]): number {
    const ing = items.filter(i => i.tipo === 'ingreso').reduce((s, i) => s + i.importe, 0);
    const gas = items.filter(g => g.tipo === 'gasto').reduce((s, g) => s + g.importe, 0);
    return ing - gas;
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }
}
