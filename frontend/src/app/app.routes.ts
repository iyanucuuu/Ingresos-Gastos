import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio',      loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'ingresos',   loadComponent: () => import('./components/ingresos/ingresos.component').then(m => m.IngresosComponent) },
  { path: 'gastos',     loadComponent: () => import('./components/gastos/gastos.component').then(m => m.GastosComponent) },
  { path: 'historico',  loadComponent: () => import('./components/historico/historico.component').then(m => m.HistoricoComponent) },
  { path: 'inversiones',loadComponent: () => import('./components/inversiones/inversiones.component').then(m => m.InversionesComponent) },
  { path: 'resumen',    loadComponent: () => import('./components/resumen/resumen.component').then(m => m.ResumenComponent) },
  { path: 'calendario', loadComponent: () => import('./components/calendario/calendario.component').then(m => m.CalendarioComponent) },
  { path: 'categorias', loadComponent: () => import('./components/categorias/categorias.component').then(m => m.CategoriasComponent) },
  { path: 'perfil',     loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent) },
  { path: '**', redirectTo: 'inicio' }
];
