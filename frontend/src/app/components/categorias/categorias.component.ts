import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoriasService } from '../../services/categorias.service';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {
  private svc = inject(CategoriasService);
  private fb  = inject(FormBuilder);

  ingresos: Categoria[] = [];
  gastos:   Categoria[] = [];
  loading   = true;
  showModal = false;
  form!: FormGroup;

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: cats => {
        this.ingresos = cats.filter(c => c.tipo === 'ingreso');
        this.gastos   = cats.filter(c => c.tipo === 'gasto');
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  abrirModal(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      tipo:   ['ingreso', Validators.required],
      color:  ['#639922', Validators.required]
    });
    this.showModal = true;
  }

  cerrar(): void { this.showModal = false; }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.svc.create(this.form.value).subscribe({
      next: () => { this.cerrar(); this.cargar(); },
      error: () => alert('Error al crear la categoría')
    });
  }

  eliminar(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar "${nombre}"? Si está en uso no se podrá borrar.`)) return;
    this.svc.delete(id).subscribe({
      next: () => this.cargar(),
      error: () => alert('No se puede eliminar: la categoría está en uso.')
    });
  }

  // Devuelve color de texto (blanco o negro) según luminosidad del fondo
  textColor(hex: string): string {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return (r*299 + g*587 + b*114) / 1000 > 128 ? '#1a1a2e' : '#ffffff';
  }
}
