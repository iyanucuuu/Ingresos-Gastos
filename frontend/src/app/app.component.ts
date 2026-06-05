import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SplashComponent } from './components/splash/splash.component';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, SplashComponent, CommonModule],
  template: `
    <app-splash *ngIf="showSplash" (enter)="onEnter()"></app-splash>

    <div class="app-layout" [class.app-visible]="!showSplash" [class.app-hidden]="showSplash">
      <app-sidebar />
      <div class="main-content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .app-hidden  { opacity: 0; pointer-events: none; }
    .app-visible { animation: appReveal 0.6s ease both; }
    @keyframes appReveal {
      from { opacity: 0; transform: scale(0.98); }
      to   { opacity: 1; transform: scale(1); }
    }
  `]
})
export class AppComponent implements OnInit {
  showSplash = true;

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.sessionService.logout$.subscribe(() => {
      this.showSplash = true;
    });
  }

  onEnter(): void { this.showSplash = false; }
}
