import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { IngresosService } from '../../services/ingresos.service';
import { GastosService } from '../../services/gastos.service';

interface DiaCalendario {
  dia: number | null;
  fecha: string;
  ingreso: number;
  gasto: number;
  net: number;
  hoy: boolean;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {
  private ingresosService = inject(IngresosService);
  private gastosService   = inject(GastosService);

  hoy        = new Date();
  mes        = this.hoy.getMonth() + 1;
  anio       = this.hoy.getFullYear();
  loading    = true;

  dias:    DiaCalendario[] = [];
  semanas: (DiaCalendario | null)[][] = [];

  mesesLabels = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  diasSemana  = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  totalIngresos = 0;
  totalGastos   = 0;

  ngOnInit(): void { this.cargar(); }

  cambiarMes(delta: number): void {
    this.mes += delta;
    if (this.mes > 12) { this.mes = 1; this.anio++; }
    if (this.mes < 1)  { this.mes = 12; this.anio--; }
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    forkJoin({
      ingresos: this.ingresosService.getAll(this.mes, this.anio),
      gastos:   this.gastosService.getAll(this.mes, this.anio)
    }).subscribe({
      next: ({ ingresos, gastos }) => {
        // Agrupar por día
        const mapa: Record<string, { ing: number; gas: number }> = {};

        ingresos.forEach(i => {
          const d = i.fecha.substring(0, 10);
          if (!mapa[d]) mapa[d] = { ing: 0, gas: 0 };
          mapa[d].ing += i.importe;
        });
        gastos.forEach(g => {
          const d = g.fecha.substring(0, 10);
          if (!mapa[d]) mapa[d] = { ing: 0, gas: 0 };
          mapa[d].gas += g.importe;
        });

        this.totalIngresos = ingresos.reduce((s, i) => s + i.importe, 0);
        this.totalGastos   = gastos.reduce((s, g) => s + g.importe, 0);

        // Construir grid del mes
        const primero  = new Date(this.anio, this.mes - 1, 1);
        const diasMes  = new Date(this.anio, this.mes, 0).getDate();
        // lunes=0, ... domingo=6
        let inicioSemana = (primero.getDay() + 6) % 7; // ajustar para Lun=0

        const celdas: (DiaCalendario | null)[] = [];
        for (let i = 0; i < inicioSemana; i++) celdas.push(null);

        for (let d = 1; d <= diasMes; d++) {
          const fechaStr = `${this.anio}-${String(this.mes).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const data = mapa[fechaStr] ?? { ing: 0, gas: 0 };
          const esHoy = this.anio === this.hoy.getFullYear() &&
                        this.mes   === this.hoy.getMonth() + 1 &&
                        d          === this.hoy.getDate();
          celdas.push({
            dia:    d,
            fecha:  fechaStr,
            ingreso: data.ing,
            gasto:   data.gas,
            net:     data.ing - data.gas,
            hoy:     esHoy
          });
        }

        // Rellenar hasta completar última semana
        while (celdas.length % 7 !== 0) celdas.push(null);

        // Partir en semanas
        this.semanas = [];
        for (let i = 0; i < celdas.length; i += 7) {
          this.semanas.push(celdas.slice(i, i + 7) as (DiaCalendario | null)[]);
        }

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  colorClass(dia: DiaCalendario): string {
    if (dia.ingreso === 0 && dia.gasto === 0) return '';
    if (dia.net > 0)  return 'dia-verde';
    if (dia.net < 0)  return 'dia-rojo';
    return 'dia-neutro';
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }
}
