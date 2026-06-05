import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PerfilService } from '../../services/perfil.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  form!: FormGroup;
  guardado = false;
  fotoPreview: string | null = null;

  private fotoKey = 'app_perfil_foto';

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    const p = this.perfilService.get();
    this.form = this.fb.group({
      nombre:    [p.nombre,    [Validators.required, Validators.maxLength(80)]],
      apellidos: [p.apellidos, [Validators.maxLength(120)]],
      email:     [p.email,     [Validators.email, Validators.maxLength(150)]],
      telefono:  [p.telefono,  [Validators.maxLength(20)]]
    });
    this.fotoPreview = localStorage.getItem(this.fotoKey);
  }

  get initials(): string { return this.perfilService.getInitials(); }

  onFotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('La foto no puede superar 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result as string;
      localStorage.setItem(this.fotoKey, this.fotoPreview);
    };
    reader.readAsDataURL(file);
  }

  quitarFoto(): void {
    this.fotoPreview = null;
    localStorage.removeItem(this.fotoKey);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.perfilService.save(this.form.value);
    this.guardado = true;
    setTimeout(() => this.guardado = false, 3000);
  }

  cerrarSesion(): void { this.sessionService.logout(); }
}
