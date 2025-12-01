import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  ventasPorDia: any[] = [];
  ventasPorSemana: any[] = [];
  ventasPorMes: any[] = [];
  inventario: any[] = [];
  loading = false;

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    
    // Cargar ventas por día
    this.reportsService.getVentasPorDia().subscribe({
      next: (data) => {
        this.ventasPorDia = data;
      },
      error: (error) => {
        console.error('Error cargando ventas por día:', error);
      }
    });

    // Cargar ventas por semana
    this.reportsService.getVentasPorSemana().subscribe({
      next: (data) => {
        this.ventasPorSemana = data;
      },
      error: (error) => {
        console.error('Error cargando ventas por semana:', error);
      }
    });

    // Cargar ventas por mes
    const currentYear = new Date().getFullYear();
    this.reportsService.getVentasPorMes(currentYear).subscribe({
      next: (data) => {
        this.ventasPorMes = data;
      },
      error: (error) => {
        console.error('Error cargando ventas por mes:', error);
      }
    });

    // Cargar inventario
    this.reportsService.getInventario().subscribe({
      next: (data) => {
        this.inventario = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando inventario:', error);
        this.loading = false;
      }
    });
  }

  downloadPdf(type: 'ventas' | 'inventario') {
    if (type === 'ventas') {
      // Implementar descarga de PDF de ventas
      this.reportsService.downloadVentaPdf(1).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-ventas.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      });
    } else {
      // Implementar descarga de PDF de inventario
      this.reportsService.downloadInventarioPdf().subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte-inventario.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }
}
