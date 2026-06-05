import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IngresosService } from '../../services/ingresos.service';
import { CategoriasService } from '../../services/categorias.service';
import { Ingreso, ResumenMensual } from '../../models/ingreso.model';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css']
})
export class IngresosComponent implements OnInit {
  private ingresosService = inject(IngresosService);
  private categoriasService = inject(CategoriasService);
  private fb = inject(FormBuilder);

  ingresos: Ingreso[] = [];
  categorias: Categoria[] = [];
  resumenMensual: ResumenMensual[] = [];
  loading = true;
  showModal = false;
  editando: Ingreso | null = null;
  filtroCategoriaId?: number;

  mesActual = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();
  meses = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  totalMes = 0;
  mediaMensual = 0;
  maxIngreso = 0;

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
    this.loading = true;
    this.categoriasService.getByTipo('ingreso').subscribe(cats => {
      this.categorias = cats;
    });
    this.ingresosService.getResumenMensual(this.anioActual).subscribe(r => {
      this.resumenMensual = r;
      const totales = r.map(x => x.total);
      this.mediaMensual = totales.length ? totales.reduce((a, b) => a + b, 0) / totales.length : 0;
    });
    this.cargarIngresos();
  }

  cargarIngresos(): void {
    this.loading = true;
    this.ingresosService.getAll(this.mesActual, this.anioActual, this.filtroCategoriaId).subscribe({
      next: data => {
        this.ingresos = data;
        this.totalMes = data.reduce((s, i) => s + i.importe, 0);
        this.maxIngreso = data.length ? Math.max(...data.map(i => i.importe)) : 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(ingreso?: Ingreso): void {
    this.editando = ingreso ?? null;
    if (ingreso) {
      this.form.patchValue({
        concepto: ingreso.concepto,
        importe: ingreso.importe,
        fecha: ingreso.fecha,
        categoriaId: (ingreso as any).categoria?.id ?? ingreso.categoriaId,
        periodicidad: ingreso.periodicidad,
        notas: ingreso.notas ?? ''
      });
    } else {
      this.form.reset({ fecha: new Date().toISOString().split('T')[0], periodicidad: 'puntual' });
    }
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.editando = null;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { categoriaId, ...rest } = this.form.value;
    const payload = { ...rest, categoria: { id: Number(categoriaId) } };
    const obs = this.editando
      ? this.ingresosService.update(this.editando.id, payload)
      : this.ingresosService.create(payload);
    obs.subscribe({ next: () => { this.cerrarModal(); this.cargarIngresos(); } });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este ingreso?')) return;
    this.ingresosService.delete(id).subscribe(() => this.cargarIngresos());
  }

  filtrarCategoria(id?: number): void {
    this.filtroCategoriaId = id;
    this.cargarIngresos();
  }

  cambiarMes(delta: number): void {
    this.mesActual += delta;
    if (this.mesActual > 12) { this.mesActual = 1; this.anioActual++; }
    if (this.mesActual < 1) { this.mesActual = 12; this.anioActual--; }
    this.cargarIngresos();
  }

  getCategoriaName(id: number): string {
    return this.categorias.find(c => c.id === id)?.nombre ?? '—';
  }

  getCatId(ing: Ingreso): number {
    return (ing as any).categoria?.id ?? ing.categoriaId;
  }

  getMesLabel(): string {
    return `${this.meses[this.mesActual]} ${this.anioActual}`;
  }

  barWidth(val: number): number {
    if (!this.totalMes) return 0;
    return Math.round((val / this.totalMes) * 100);
  }

  getCatTotal(catId: number): number {
    return this.ingresos.filter(i => this.getCatId(i) === catId).reduce((s, i) => s + i.importe, 0);
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }
}
