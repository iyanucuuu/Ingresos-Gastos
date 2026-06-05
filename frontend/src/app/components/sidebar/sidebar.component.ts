import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PerfilService } from '../../services/perfil.service';
import { SessionService } from '../../services/session.service';

interface NavItem  { label: string; icon: string; route: string; }
interface NavGroup { section: string; items: NavItem[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  grupos: NavGroup[] = [
    {
      section: 'Principal',
      items: [
        { label: 'Inicio',      icon: 'dashboard',    route: '/inicio'      },
        { label: 'Ingresos',    icon: 'south',         route: '/ingresos'    },
        { label: 'Gastos',      icon: 'north',         route: '/gastos'      },
        { label: 'Histórico',   icon: 'history',       route: '/historico'   },
        { label: 'Inversiones', icon: 'trending_up',   route: '/inversiones' },
      ]
    },
    {
      section: 'Análisis',
      items: [
        { label: 'Resumen',    icon: 'donut_small',   route: '/resumen'    },
        { label: 'Calendario', icon: 'calendar_month', route: '/calendario' },
      ]
    },
    {
      section: 'Ajustes',
      items: [
        { label: 'Categorías', icon: 'label',  route: '/categorias' },
        { label: 'Mi perfil',  icon: 'person', route: '/perfil'     },
      ]
    }
  ];

  initials = '?';
  nombreCompleto = 'Mi perfil';
  foto: string | null = null;

  constructor(
    private perfilService: PerfilService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.initials       = this.perfilService.getInitials();
    this.nombreCompleto = this.perfilService.getNombreCompleto();
    this.foto           = localStorage.getItem('app_perfil_foto');
  }

  cerrarSesion(): void {
    this.sessionService.logout();
  }
}
