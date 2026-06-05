import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { IngresosService } from '../../services/ingresos.service';
import { GastosService } from '../../services/gastos.service';
import { ResumenMensual } from '../../models/ingreso.model';

interface MesResumen { mes: string; ingresos: number; gastos: number; balance: number; }

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  private ingresosService = inject(IngresosService);
  private gastosService = inject(GastosService);

  anio = new Date().getFullYear();
  loading = true;
  resumenMeses: MesResumen[] = [];
  mesesLabels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  totalIngresos = 0;
  totalGastos = 0;
  mejorMes = '';
  peorMes = '';
  tasaAhorro = 0;
  maxBarVal = 0;

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      ingresos: this.ingresosService.getResumenMensual(this.anio),
      gastos: this.gastosService.getResumenMensual(this.anio)
    }).subscribe({
      next: ({ ingresos, gastos }) => {
        this.resumenMeses = this.mesesLabels.map((label, i) => {
          const m = i + 1;
          const ing = ingresos.find(r => r.mes === m)?.total ?? 0;
          const gas = gastos.find(r => r.mes === m)?.total ?? 0;
          return { mes: label, ingresos: ing, gastos: gas, balance: ing - gas };
        });
        this.totalIngresos = ingresos.reduce((s, r) => s + r.total, 0);
        this.totalGastos = gastos.reduce((s, r) => s + r.total, 0);
        this.tasaAhorro = this.totalIngresos > 0 ? ((this.totalIngresos - this.totalGastos) / this.totalIngresos) * 100 : 0;
        const mejorIdx = this.resumenMeses.reduce((best, m, i) => m.balance > this.resumenMeses[best].balance ? i : best, 0);
        const peorIdx = this.resumenMeses.reduce((worst, m, i) => m.balance < this.resumenMeses[worst].balance ? i : worst, 0);
        this.mejorMes = this.resumenMeses[mejorIdx].ingresos > 0 ? this.mesesLabels[mejorIdx] : '—';
        this.peorMes = this.resumenMeses[peorIdx].gastos > 0 ? this.mesesLabels[peorIdx] : '—';
        this.maxBarVal = Math.max(...this.resumenMeses.map(m => Math.max(m.ingresos, m.gastos)), 1);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  barH(val: number): number { return Math.max(Math.round((val / this.maxBarVal) * 130), val > 0 ? 4 : 0); }
  formatCurrency(val: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }
  formatShort(val: number): string {
    const abs = Math.abs(val);
    const str = abs >= 1000 ? (abs / 1000).toFixed(1).replace('.0', '') + 'k €' : abs.toFixed(0) + ' €';
    return (val >= 0 ? '+' : '-') + str;
  }
  formatPct(val: number): string { return `${Math.round(val)}%`; }
}
