import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit, OnDestroy {
  @Output() enter = new EventEmitter<void>();

  progress = 0;
  ready    = false;
  leaving  = false;

  particles = Array.from({ length: 28 }, () => ({
    x:        Math.random() * 100,
    y:        Math.random() * 100,
    delay:    Math.random() * 5,
    duration: 4 + Math.random() * 6,
    size:     2 + Math.random() * 4
  }));

  private timer: any;

  ngOnInit(): void {
    let step = 0;
    const steps = [12, 8, 18, 6, 14, 10, 9, 8, 7, 6]; // velocidades irregulares
    this.timer = setInterval(() => {
      this.progress += steps[step % steps.length] * (Math.random() * 0.6 + 0.7);
      step++;
      if (this.progress >= 100) {
        this.progress = 100;
        clearInterval(this.timer);
        setTimeout(() => { this.ready = true; }, 350);
      }
    }, 180);
  }

  ngOnDestroy(): void { clearInterval(this.timer); }

  onEnter(): void {
    this.leaving = true;
    setTimeout(() => this.enter.emit(), 700);
  }
}
