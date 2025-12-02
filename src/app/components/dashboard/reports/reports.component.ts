/**
 * 📊 COMPONENTE DE REPORTES PROFESIONAL
 * Visualización de datos, gráficas y exportación a Excel/PDF
 */
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../../services/reports.service';
import { PermissionsService, PermisosPorRol } from '../../../services/permissions.service';
import { AuthService } from '../../../services/auth.service';
import { 
  FiltroReporte, 
  ReporteVentasCompleto, 
  ReporteVentasAgregado,
  ProductoMasVendido,
  TIPOS_AGRUPACION,
  METODOS_PAGO
} from '../../../interfaces/reporte.interface';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy, AfterViewInit {
  // Referencias a los canvas de las gráficas
  @ViewChild('ventasChart') ventasChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pagosChart') pagosChartRef!: ElementRef<HTMLCanvasElement>;

  // Gráficas
  ventasChart?: Chart;
  pagosChart?: Chart;

  // Filtros
  filtro: FiltroReporte = {
    fechaInicio: this.getFirstDayOfMonth(),
    fechaFin: this.getToday(),
    tipoAgrupacion: 'dia',
    metodoPago: ''
  };

  // Opciones de filtros
  tiposAgrupacion = TIPOS_AGRUPACION;
  metodosPago = METODOS_PAGO;

  // Datos del reporte
  reporte?: ReporteVentasCompleto;
  loading = false;
  error: string | null = null;
  exportando = false;

  // Tab activa
  tabActiva: 'resumen' | 'periodos' | 'productos' = 'resumen';

  // Permisos
  permisos!: PermisosPorRol;
  misVentasHoy: any[] = [];

  constructor(
    private reportsService: ReportsService,
    public permissionsService: PermissionsService,
    private authService: AuthService
  ) {
    this.permisos = this.permissionsService.getPermisos();
  }

  ngOnInit(): void {
    // Si es cajero con acceso limitado, cargar solo sus ventas
    if (this.permisos.reportesSoloHoy && !this.permisos.verReportesGlobales) {
      this.loadMisVentasHoy();
    } else {
      this.cargarReporte();
    }
  }

  ngAfterViewInit(): void {
    // Las gráficas se inicializarán cuando lleguen los datos
  }

  ngOnDestroy(): void {
    this.ventasChart?.destroy();
    this.pagosChart?.destroy();
  }

  // ============================================
  // 📊 CARGA DE DATOS
  // ============================================

  cargarReporte(): void {
    if (!this.filtro.fechaInicio || !this.filtro.fechaFin) {
      this.error = 'Selecciona las fechas de inicio y fin';
      return;
    }

    this.loading = true;
    this.error = null;

    this.reportsService.getReporteVentas(this.filtro).subscribe({
      next: (data) => {
        this.reporte = data;
        this.loading = false;
        // Actualizar gráficas después de que el DOM se actualice
        setTimeout(() => {
          this.actualizarGraficas();
        }, 100);
      },
      error: (err) => {
        console.error('Error cargando reporte:', err);
        this.error = err.error?.message || 'Error al cargar el reporte. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  // ============================================
  // 📈 GRÁFICAS CON CHART.JS
  // ============================================

  actualizarGraficas(): void {
    if (!this.reporte) return;
    this.crearGraficaVentas();
    this.crearGraficaPagos();
  }

  crearGraficaVentas(): void {
    if (!this.ventasChartRef?.nativeElement || !this.reporte) return;

    // Destruir gráfica anterior si existe
    this.ventasChart?.destroy();

    const datos = this.reporte.datosPorPeriodo;
    const labels = datos.map(d => this.formatPeriodoLabel(d.periodo));
    const ingresos = datos.map(d => d.totalIngresos);
    const ventas = datos.map(d => d.totalVentas);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Ingresos ($)',
            data: ingresos,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Cantidad de Ventas',
            data: ventas,
            type: 'line',
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.raw as number;
                if (label.includes('Ingresos')) {
                  return `${label}: $${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
                }
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Ingresos ($)'
            },
            ticks: {
              callback: (value) => '$' + Number(value).toLocaleString('es-MX')
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Cantidad'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    };

    this.ventasChart = new Chart(this.ventasChartRef.nativeElement, config);
  }

  crearGraficaPagos(): void {
    if (!this.pagosChartRef?.nativeElement || !this.reporte) return;

    // Destruir gráfica anterior si existe
    this.pagosChart?.destroy();

    const resumen = this.reporte.resumenGeneral;
    
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Efectivo', 'Tarjeta', 'Transferencia'],
        datasets: [{
          data: [
            resumen.totalEfectivo,
            resumen.totalTarjeta,
            resumen.totalTransferencia
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',  // Verde - Efectivo
            'rgba(59, 130, 246, 0.8)',  // Azul - Tarjeta
            'rgba(139, 92, 246, 0.8)'   // Morado - Transferencia
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const total = resumen.totalEfectivo + resumen.totalTarjeta + resumen.totalTransferencia;
                const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: $${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (${porcentaje}%)`;
              }
            }
          }
        }
      }
    };

    this.pagosChart = new Chart(this.pagosChartRef.nativeElement, config);
  }

  formatPeriodoLabel(periodo: string): string {
    if (!periodo) return '';
    
    // Si es una fecha ISO, formatear
    if (periodo.includes('-')) {
      const date = new Date(periodo);
      if (!isNaN(date.getTime())) {
        const options: Intl.DateTimeFormatOptions = 
          this.filtro.tipoAgrupacion === 'dia' 
            ? { day: '2-digit', month: 'short' }
            : this.filtro.tipoAgrupacion === 'semana'
            ? { day: '2-digit', month: 'short' }
            : this.filtro.tipoAgrupacion === 'mes'
            ? { month: 'short', year: 'numeric' }
            : { year: 'numeric' };
        return date.toLocaleDateString('es-MX', options);
      }
    }
    return periodo;
  }

  // ============================================
  // 📥 EXPORTACIÓN
  // ============================================

  exportarExcel(): void {
    this.exportando = true;
    this.reportsService.exportarExcel(this.filtro).subscribe({
      next: () => {
        this.exportando = false;
      },
      error: (err) => {
        console.error('Error exportando Excel:', err);
        this.error = 'Error al generar el archivo Excel';
        this.exportando = false;
      }
    });
  }

  exportarPDF(): void {
    this.exportando = true;
    this.reportsService.exportarPDF(this.filtro).subscribe({
      next: () => {
        this.exportando = false;
      },
      error: (err) => {
        console.error('Error exportando PDF:', err);
        this.error = 'Error al generar el archivo PDF';
        this.exportando = false;
      }
    });
  }

  // ============================================
  // 🧾 VISTA CAJERO - MIS VENTAS DEL DÍA
  // ============================================

  loadMisVentasHoy(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.reportsService.getMisVentasHoy(userId).subscribe({
      next: (data) => {
        this.misVentasHoy = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando mis ventas de hoy:', error);
        this.loading = false;
      }
    });
  }

  getTotalMisVentas(): number {
    return this.misVentasHoy.reduce((sum, v) => sum + (v.total || v.montoTotal || 0), 0);
  }

  getCantidadVentas(): number {
    return this.misVentasHoy.length;
  }

  // ============================================
  // 🛠️ UTILIDADES
  // ============================================

  cambiarTab(tab: 'resumen' | 'periodos' | 'productos'): void {
    this.tabActiva = tab;
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getFirstDayOfMonth(): string {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  }

  // Helpers para el template
  getVariacionPorcentaje(actual: number, anterior: number): string {
    if (anterior === 0) return actual > 0 ? '+100%' : '0%';
    const variacion = ((actual - anterior) / anterior) * 100;
    const signo = variacion >= 0 ? '+' : '';
    return `${signo}${variacion.toFixed(1)}%`;
  }

  getMetodoPagoIcon(metodo: string): string {
    switch (metodo?.toLowerCase()) {
      case 'efectivo': return '💵';
      case 'tarjeta': return '💳';
      case 'transferencia': return '🏦';
      default: return '💰';
    }
  }
}
