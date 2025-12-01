import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../../services/caja.service';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css']
})
export class CajaComponent {
  current: any = null;
  openingAmount: number = 0;
  closingAmount: number | null = null;
  loading = false;

  constructor(private cajaService: CajaService) {
    this.loadCurrent();
  }

  loadCurrent(){
    this.cajaService.getCurrent().subscribe({ 
      next: resp => this.current = resp.caja, 
      error: () => this.current = null 
    });
  }

  openCaja(){
    if(this.openingAmount <= 0) return alert('Ingresa un monto inicial válido');
    this.loading = true;
    this.cajaService.open({ montoInicial: this.openingAmount }).subscribe({
      next: (resp) => {
        // Usar directamente la respuesta del backend para actualizar la vista
        this.loading = false;
        this.current = resp.caja;
        this.cajaService.setCurrent(true, resp.caja);
        alert('Caja abierta');
        // Si se desea reconfirmar estado, se podría llamar: this.loadCurrent();
      },
      error: (e) => { this.loading = false; console.error(e); alert('Error abriendo caja'); }
    });
  }

  closeCaja(){
    if(!this.current) return alert('No hay caja abierta');
    this.loading = true;
    this.cajaService.close({ id: this.current.id, montoCierre: this.closingAmount || undefined }).subscribe({ 
      next: (resp) => { 
        this.loading = false; 
        // Al cerrar, ya no existe caja abierta: limpiar estado sin re-consultar
        this.current = null; 
        this.cajaService.setCurrent(false, resp.caja);
        alert('Caja cerrada'); 
        // No es necesario reconsultar, el servicio ya emitió el estado
      }, 
      error: (e) => { this.loading = false; console.error(e); alert('Error cerrando caja'); } 
    });
  }
}
