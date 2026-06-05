import { Injectable } from '@angular/core';

export interface Perfil {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private key = 'app_perfil';

  get(): Perfil {
    const saved = localStorage.getItem(this.key);
    return saved ? JSON.parse(saved) : { nombre: '', apellidos: '', email: '', telefono: '' };
  }

  save(perfil: Perfil): void {
    localStorage.setItem(this.key, JSON.stringify(perfil));
  }

  getInitials(): string {
    const p = this.get();
    const n = p.nombre.trim();
    const a = p.apellidos.trim();
    if (!n) return '?';
    return (n[0] + (a ? a[0] : '')).toUpperCase();
  }

  getNombreCompleto(): string {
    const p = this.get();
    const full = `${p.nombre} ${p.apellidos}`.trim();
    return full || 'Mi perfil';
  }
}
