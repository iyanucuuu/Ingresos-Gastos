import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { IngresosService } from '../../services/ingresos.service';
import { GastosService } from '../../services/gastos.service';
import { InversionesService, InversionApi } from '../../services/inversiones.service';
import { Ingreso } from '../../models/ingreso.model';
import { Gasto } from '../../models/gasto.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private ingresosService   = inject(IngresosService);
  private gastosService     = inject(GastosService);
  private inversionesService = inject(InversionesService);

  totalIngresos = 0;
  totalGastos   = 0;
  balanceNeto   = 0;
  ultimosMovimientos: ((Ingreso | Gasto) & { tipo: string })[] = [];
  loading = true;

  mesActual  = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();
  anioChart  = new Date().getFullYear();

  // Inversiones (ahora desde la API)
  inversiones: InversionApi[] = [];
  get totalInvertido()  { return this.inversiones.reduce((s, i) => s + i.invertido,   0); }
  get totalActualInv()  { return this.inversiones.reduce((s, i) => s + i.valorActual, 0); }
  get gananciaTotal()   { return this.totalActualInv - this.totalInvertido; }
  get rendimientoPct()  { return this.totalInvertido > 0 ? (this.gananciaTotal / this.totalInvertido) * 100 : 0; }

  meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  barrasChart: { mes: string; ingresos: number; gastos: number; maxVal: number }[] = [];

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    forkJoin({
      ingresos:        this.ingresosService.getAll(this.mesActual, this.anioActual),
      gastos:          this.gastosService.getAll(this.mesActual, this.anioActual),
      resumenIngresos: this.ingresosService.getResumenMensual(this.anioChart),
      resumenGastos:   this.gastosService.getResumenMensual(this.anioChart),
      inversiones:     this.inversionesService.getAll()
    }).subscribe({
      next: ({ ingresos, gastos, resumenIngresos, resumenGastos, inversiones }) => {
        this.totalIngresos = ingresos.reduce((s, i) => s + i.importe, 0);
        this.totalGastos   = gastos.reduce((s, g) => s + g.importe, 0);
        this.balanceNeto   = this.totalIngresos - this.totalGastos;
        this.inversiones   = inversiones;

        const movIng = ingresos.map(i => ({ ...i, tipo: 'ingreso' }));
        const movGas = gastos.map(g => ({ ...g, tipo: 'gasto' }));
        this.ultimosMovimientos = [...movIng, ...movGas]
          .sort((a, b) => {
            const dateDiff = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
            if (dateDiff !== 0) return dateDiff;
            return (b.id as number) - (a.id as number); // mismo día → más reciente primero
          })
          .slice(0, 6) as any[];

        this.barrasChart = this.meses.map((mes, i) => {
          const m   = i + 1;
          const ing = resumenIngresos.find(r => r.mes === m)?.total ?? 0;
          const gas = resumenGastos.find(r => r.mes === m)?.total ?? 0;
          return { mes, ingresos: ing, gastos: gas, maxVal: 0 };
        });
        const maxVal = Math.max(...this.barrasChart.map(b => Math.max(b.ingresos, b.gastos)), 1);
        this.barrasChart = this.barrasChart.map(b => ({ ...b, maxVal }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  cambiarAnioChart(delta: number): void {
    this.anioChart += delta;
    forkJoin({
      resumenIngresos: this.ingresosService.getResumenMensual(this.anioChart),
      resumenGastos:   this.gastosService.getResumenMensual(this.anioChart)
    }).subscribe(({ resumenIngresos, resumenGastos }) => {
      this.barrasChart = this.meses.map((mes, i) => {
        const m   = i + 1;
        const ing = resumenIngresos.find(r => r.mes === m)?.total ?? 0;
        const gas = resumenGastos.find(r => r.mes === m)?.total ?? 0;
        return { mes, ingresos: ing, gastos: gas, maxVal: 0 };
      });
      const maxVal = Math.max(...this.barrasChart.map(b => Math.max(b.ingresos, b.gastos)), 1);
      this.barrasChart = this.barrasChart.map(b => ({ ...b, maxVal }));
    });
  }

  barHeight(val: number, maxVal: number): number {
    if (val <= 0) return 0;
    return Math.max(Math.round((val / maxVal) * 210), 6);
  }

  net(b: { ingresos: number; gastos: number }): number { return b.ingresos - b.gastos; }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }

  formatShort(val: number): string {
    if (val === 0) return '0 €';
    if (Math.abs(val) >= 1000) return (val / 1000).toFixed(1).replace('.0', '') + 'k €';
    return val.toFixed(0) + ' €';
  }

  getMesLabel(): string {
    return `${this.meses[this.mesActual - 1]} ${this.anioActual}`;
  }
}
