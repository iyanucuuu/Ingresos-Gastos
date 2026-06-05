import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GastosService } from '../../services/gastos.service';
import { CategoriasService } from '../../services/categorias.service';
import { Gasto } from '../../models/gasto.model';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements OnInit {
  private gastosService = inject(GastosService);
  private categoriasService = inject(CategoriasService);
  private fb = inject(FormBuilder);

  gastos: Gasto[] = [];
  categorias: Categoria[] = [];
  loading = true;
  showModal = false;
  editando: Gasto | null = null;
  filtroCategoriaId?: number;

  mesActual = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();
  meses = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  totalMes = 0;
  maxGasto = 0;
  mediaMensual = 0;

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      concepto: ['', [Validators.required, Validators.maxLength(200)]],
      importe: ['', [Validators.required, Validators.min(0.01)]],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      categoriaId: ['', Validators.required],
      periodicidad: ['puntual', Validators.required],
      notas: ['']
    });
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.categoriasService.getByTipo('gasto').subscribe(cats => { this.categorias = cats; });
    this.gastosService.getResumenMensual(this.anioActual).subscribe(r => {
      const totales = r.map(x => x.total);
      this.mediaMensual = totales.length ? totales.reduce((a, b) => a + b, 0) / totales.length : 0;
    });
    this.cargarGastos();
  }

  cargarGastos(): void {
    this.loading = true;
    this.gastosService.getAll(this.mesActual, this.anioActual, this.filtroCategoriaId).subscribe({
      next: data => {
        this.gastos = data;
        this.totalMes = data.reduce((s, g) => s + g.importe, 0);
        this.maxGasto = data.length ? Math.max(...data.map(g => g.importe)) : 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(gasto?: Gasto): void {
    this.editando = gasto ?? null;
    if (gasto) {
      this.form.patchValue({
        concepto: gasto.concepto,
        importe: gasto.importe,
        fecha: gasto.fecha,
        categoriaId: (gasto as any).categoria?.id ?? gasto.categoriaId,
        periodicidad: gasto.periodicidad,
        notas: gasto.notas ?? ''
      });
    } else {
      this.form.reset({ fecha: new Date().toISOString().split('T')[0], periodicidad: 'puntual' });
    }
    this.showModal = true;
  }

  cerrarModal(): void { this.showModal = false; this.editando = null; }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { categoriaId, ...rest } = this.form.value;
    const payload = { ...rest, categoria: { id: Number(categoriaId) } };
    const obs = this.editando
      ? this.gastosService.update(this.editando.id, payload)
      : this.gastosService.create(payload);
    obs.subscribe({ next: () => { this.cerrarModal(); this.cargarGastos(); } });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este gasto?')) return;
    this.gastosService.delete(id).subscribe(() => this.cargarGastos());
  }

  filtrarCategoria(id?: number): void { this.filtroCategoriaId = id; this.cargarGastos(); }

  cambiarMes(delta: number): void {
    this.mesActual += delta;
    if (this.mesActual > 12) { this.mesActual = 1; this.anioActual++; }
    if (this.mesActual < 1) { this.mesActual = 12; this.anioActual--; }
    this.cargarGastos();
  }

  getCategoriaName(id: number): string {
    return this.categorias.find(c => c.id === id)?.nombre ?? '—';
  }

  getCatTotal(catId: number): number {
    return this.gastos.filter(g => ((g as any).categoria?.id ?? g.categoriaId) === catId)
                      .reduce((s, g) => s + g.importe, 0);
  }

  getMesLabel(): string { return `${this.meses[this.mesActual]} ${this.anioActual}`; }
  barWidth(val: number): number { return this.totalMes ? Math.round((val / this.totalMes) * 100) : 0; }
  formatCurrency(val: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }
}
