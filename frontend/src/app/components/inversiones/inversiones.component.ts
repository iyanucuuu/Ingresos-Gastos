import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InversionesService, InversionApi, DepositoApi } from '../../services/inversiones.service';

// Re-exportamos los tipos para que home.component pueda importarlos
export type Deposito  = DepositoApi;
export type Inversion = InversionApi;

interface Punto {
  x: number; y: number;
  valor: number; label: string;
  esPasado: boolean; esHoy: boolean;
  depTotal: number;
}

@Component({
  selector: 'app-inversiones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inversiones.component.html',
  styleUrls: ['./inversiones.component.css']
})
export class InversionesComponent implements OnInit {
  readonly MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  readonly CW = 600; readonly CH = 220;
  readonly PL = 72;  readonly PR = 16; readonly PT = 24; readonly PB = 36;

  inversiones:     Inversion[] = [];
  loading          = true;
  showModal        = false;
  showDepositModal = false;
  showRetiroModal  = false;
  editandoId:      number | null = null;
  form!:           FormGroup;
  depositForm!:    FormGroup;
  retiroForm!:     FormGroup;

  cuentaSeleccionada: Inversion | null = null;
  puntos:     Punto[] = [];
  pathPasado  = '';
  pathFuturo  = '';
  pathArea    = '';
  tooltip = { visible: false, x: 0, y: 0, valor: 0, label: '', depTotal: 0 };

  constructor(
    private fb: FormBuilder,
    private inversionesService: InversionesService
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.inversionesService.getAll().subscribe({
      next: (data) => {
        this.inversiones = data;
        this.loading = false;
        const primer = this.ahorros[0];
        if (primer) {
          // Re-selecciona la cuenta activa si ya había una
          const activa = this.cuentaSeleccionada
            ? this.inversiones.find(i => i.id === this.cuentaSeleccionada!.id) ?? primer
            : primer;
          this.seleccionarCuenta(activa);
        }
      },
      error: () => { this.loading = false; }
    });
  }

  get inversReg(): Inversion[] { return this.inversiones.filter(i => i.tipo !== 'ahorro'); }
  get ahorros():   Inversion[] { return this.inversiones.filter(i => i.tipo === 'ahorro'); }

  get totalInvertido(): number { return this.inversiones.reduce((s, i) => s + i.invertido, 0); }
  get totalActual():    number { return this.inversiones.reduce((s, i) => s + i.valorActual, 0); }
  get totalGanancia():  number { return this.totalActual - this.totalInvertido; }
  get totalPct():       number { return this.totalInvertido > 0 ? (this.totalGanancia / this.totalInvertido) * 100 : 0; }
  ganancia(inv: Inversion): number { return inv.valorActual - inv.invertido; }
  pct(inv: Inversion):      number { return inv.invertido > 0 ? (this.ganancia(inv) / inv.invertido) * 100 : 0; }

  // ── Gráfico ──────────────────────────────────────────
  seleccionarCuenta(inv: Inversion): void {
    this.cuentaSeleccionada = inv;
    this.generarChart(inv);
  }

  private getDeps(inv: Inversion): Deposito[] {
    return inv.depositos?.length ? inv.depositos : [{ id: 0, importe: inv.invertido, fecha: inv.fecha }];
  }

  generarChart(inv: Inversion): void {
    const ini  = new Date(inv.fecha);
    const now  = new Date();
    const mPas = (now.getFullYear() - ini.getFullYear()) * 12 + (now.getMonth() - ini.getMonth());
    const total = Math.max(mPas + 13, 24);
    const tasa  = (inv.tasaAnual ?? 2) / 100 / 12;
    const iW    = this.CW - this.PL - this.PR;
    const iH    = this.CH - this.PT - this.PB;

    const deps = this.getDeps(inv)
      .map(d => ({ ...d, _d: new Date(d.fecha) }))
      .sort((a, b) => a._d.getTime() - b._d.getTime());

    const raw: Punto[] = Array.from({ length: total + 1 }, (_, m) => {
      const f = new Date(ini.getFullYear(), ini.getMonth() + m, 1);

      const valor = deps.reduce((sum, dep) => {
        const dm = new Date(dep._d.getFullYear(), dep._d.getMonth(), 1);
        if (dm <= f) {
          const ms = (f.getFullYear() - dep._d.getFullYear()) * 12 + (f.getMonth() - dep._d.getMonth());
          return sum + dep.importe * Math.pow(1 + tasa, ms);
        }
        return sum;
      }, 0);

      const depTotal = deps
        .filter((d, i) => i > 0 && d._d.getFullYear() === f.getFullYear() && d._d.getMonth() === f.getMonth())
        .reduce((s, d) => s + d.importe, 0);

      return { valor, label: `${this.MESES[f.getMonth()]} ${f.getFullYear()}`,
               esPasado: m <= mPas, esHoy: m === mPas, depTotal, x: 0, y: 0 };
    });

    const minV = Math.min(...raw.map(p => p.valor)) * 0.9992;
    const maxV = Math.max(...raw.map(p => p.valor)) * 1.0008;
    raw.forEach((p, i) => {
      p.x = this.PL + (i / (raw.length - 1)) * iW;
      p.y = this.PT + iH - ((p.valor - minV) / (maxV - minV)) * iH;
    });

    this.puntos = raw;
    const pas = raw.filter(p => p.esPasado);
    this.pathPasado = pas.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    const hi  = raw.findIndex(p => p.esHoy);
    this.pathFuturo = raw.slice(hi).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

    const baseY = (this.CH - this.PB).toFixed(1);
    const hoy   = hi >= 0 ? raw[hi] : pas[pas.length - 1];
    this.pathArea = (pas.length > 1 && hoy)
      ? `${this.pathPasado} L ${hoy.x.toFixed(1)} ${baseY} L ${this.PL} ${baseY} Z`
      : '';
  }

  get yTicks(): { y: number; label: string }[] {
    if (!this.puntos.length) return [];
    const vals = this.puntos.map(p => p.valor);
    const min = Math.min(...vals), max = Math.max(...vals);
    const iH = this.CH - this.PT - this.PB;
    return [0,1,2,3,4].map(i => ({
      y: this.PT + iH * (1 - i / 4),
      label: (min + (max - min) * (i / 4)).toFixed(2) + ' €'
    }));
  }

  get xTicks(): { x: number; label: string }[] {
    if (!this.puntos.length) return [];
    const step = Math.ceil(this.puntos.length / 8);
    return this.puntos
      .filter((_, i) => i % step === 0 || i === this.puntos.length - 1)
      .map(p => ({ x: p.x, label: p.label.replace(/(\w+) (\d{2})(\d{2})$/, '$1 \'$3') }));
  }

  showTip(p: Punto): void {
    this.tooltip = { visible: true, x: p.x, y: p.y, valor: p.valor, label: p.label, depTotal: p.depTotal };
  }
  hideTip(): void { this.tooltip.visible = false; }

  get historicoDepositos(): Deposito[] {
    if (!this.cuentaSeleccionada) return [];
    return this.getDeps(this.cuentaSeleccionada).slice(1).reverse();
  }

  // ── Añadir capital ───────────────────────────────────
  abrirDepositoModal(): void {
    this.depositForm = this.fb.group({
      importe: ['', [Validators.required, Validators.min(0.01)]],
      fecha:   [new Date().toISOString().split('T')[0], Validators.required]
    });
    this.showDepositModal = true;
  }
  cerrarDeposito(): void { this.showDepositModal = false; }

  guardarDeposito(): void {
    if (this.depositForm.invalid || !this.cuentaSeleccionada) { this.depositForm.markAllAsTouched(); return; }
    const v = this.depositForm.value;
    this.inversionesService.addDeposito(this.cuentaSeleccionada.id, {
      importe: Number(v.importe), fecha: v.fecha
    }).subscribe(updated => {
      this.cerrarDeposito();
      this.cargar();
    });
  }

  // ── Retirar capital ──────────────────────────────────
  abrirRetiroModal(): void {
    this.retiroForm = this.fb.group({
      importe: ['', [Validators.required, Validators.min(0.01)]],
      fecha:   [new Date().toISOString().split('T')[0], Validators.required]
    });
    this.showRetiroModal = true;
  }
  cerrarRetiro(): void { this.showRetiroModal = false; }

  get maxRetiro(): number { return this.cuentaSeleccionada?.valorActual ?? 0; }

  guardarRetiro(): void {
    if (this.retiroForm.invalid || !this.cuentaSeleccionada) { this.retiroForm.markAllAsTouched(); return; }
    const v = this.retiroForm.value;
    const importe = Number(v.importe);
    if (importe > this.cuentaSeleccionada.valorActual) {
      this.retiroForm.get('importe')?.setErrors({ excede: true }); return;
    }
    // Importe negativo = retirada
    this.inversionesService.addDeposito(this.cuentaSeleccionada.id, {
      importe: -importe, fecha: v.fecha
    }).subscribe(() => {
      this.cerrarRetiro();
      this.cargar();
    });
  }

  // ── Modal principal ──────────────────────────────────
  abrirModal(inv?: Inversion): void {
    this.editandoId = inv?.id ?? null;
    const deps = inv?.depositos;
    this.form = this.fb.group({
      tipo:       [inv?.tipo       ?? 'inversion'],
      nombre:     [inv?.nombre     ?? '', Validators.required],
      ticker:     [inv?.ticker     ?? ''],
      invertido:  [inv?.tipo === 'ahorro' && deps?.length ? deps[0].importe : (inv?.invertido ?? ''),
                   [Validators.required, Validators.min(0.01)]],
      valorActual:[inv?.valorActual ?? ''],
      tasaAnual:  [inv?.tasaAnual   ?? 2, [Validators.min(0), Validators.max(100)]],
      fecha:      [inv?.fecha       ?? new Date().toISOString().split('T')[0], Validators.required]
    });
    this.showModal = true;
  }

  get tipoForm(): string { return this.form?.get('tipo')?.value ?? 'inversion'; }

  cerrar(): void { this.showModal = false; this.editandoId = null; }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = { ...this.form.value };

    if (v.tipo === 'inversion') {
      if (!v.valorActual && v.valorActual !== 0) { this.form.get('valorActual')?.markAsTouched(); return; }
    }
    v.invertido   = Number(v.invertido);
    // Para ahorro el backend calcula valorActual; enviamos 0 como placeholder
    v.valorActual = v.tipo === 'ahorro' ? 0 : Number(v.valorActual);

    const payload: Partial<Inversion> = {
      nombre: v.nombre, ticker: v.ticker || null, tipo: v.tipo,
      invertido: v.invertido, valorActual: v.valorActual,
      fecha: v.fecha, tasaAnual: Number(v.tasaAnual ?? 2)
    };

    const op$ = this.editandoId
      ? this.inversionesService.update(this.editandoId, payload)
      : this.inversionesService.create(payload);

    op$.subscribe(() => { this.cerrar(); this.cargar(); });
  }

  eliminar(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    if (this.cuentaSeleccionada?.id === id) { this.cuentaSeleccionada = null; this.puntos = []; }
    this.inversionesService.delete(id).subscribe(() => this.cargar());
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }
  formatShort(val: number): string {
    const abs = Math.abs(val);
    const str = abs >= 1000 ? (abs / 1000).toFixed(1).replace('.0', '') + 'k €' : abs.toFixed(0) + ' €';
    return (val >= 0 ? '+' : '-') + str;
  }
  formatPct(val: number): string {
    return (val >= 0 ? '+' : '') + val.toFixed(2) + '%';
  }
}
