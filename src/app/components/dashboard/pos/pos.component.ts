import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { VentasService } from '../../../services/ventas.service';
import { CajaService } from '../../../services/caja.service';
import { AuthService } from '../../../services/auth.service';
import { AlertasService } from '../../../services/alertas.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent {
  cart: any[] = [];
  products: any[] = [];
  allProducts: any[] = [];
  searchTerm = '';
  paymentMethod = 'efectivo';
  clienteId: number | null = null;
  cajaState: { abierta: boolean; caja: any | null } = { abierta: false, caja: null };
  
  // Cálculo de cambio
  montoRecibido: number = 0;

  loading = false;

  constructor(
    private productsService: ProductsService, 
    private ventasService: VentasService, 
    private cajaService: CajaService,
    private auth: AuthService,
    private alertasService: AlertasService
  ) {
    this.loadProducts();
    this.loadCaja();
    // Suscribirse a cambios de caja abierta/cerrada en tiempo real
    this.cajaService.current$.subscribe(state => { this.cajaState = state; });
  }

  loadProducts(){
    this.productsService.list().subscribe({ 
      next: (res: any) => {
        this.allProducts = res || [];
        this.products = [...this.allProducts];
      }, 
      error: () => {
        console.error('Error cargando productos');
        this.allProducts = [];
        this.products = [];
      }
    });
  }

  loadCaja(){
    this.cajaService.getCurrent().subscribe({ 
      next: (resp) => this.cajaState = resp,
      error: () => this.cajaState = { abierta: false, caja: null }
    });
  }

  // Búsqueda por nombre, ID o código de barras
  searchProducts() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.products = [...this.allProducts];
      return;
    }

    this.products = this.allProducts.filter((p: any) => {
      const nombre = (p.nombre || p.name || '').toLowerCase();
      const id = String(p.id || '');
      const codigoBarras = (p.codigoBarras || p.barcode || '').toLowerCase();
      
      return nombre.includes(term) || 
             id.includes(term) || 
             codigoBarras.includes(term);
    });
  }

  add(p: any){
    const stock = p.stock || p.cantidadDisponible || 0;
    
    if (stock <= 0) {
      alert(`${p.nombre || p.name} no tiene stock disponible`);
      return;
    }

    const found = this.cart.find(c => c.id === p.id);
    
    if (found) {
      if (found.qty >= stock) {
        alert(`No hay más stock disponible de ${p.nombre || p.name}. Stock actual: ${stock}`);
        return;
      }
      found.qty = (found.qty || 1) + 1;
    } else {
      this.cart.push({ 
        ...p, 
        qty: 1,
        precioUnitario: p.precioVenta || p.price || 0
      });
    }
  }

  removeItem(i: number){ 
    this.cart.splice(i, 1); 
  }

  updateQty(item: any, newQty: number) {
    const stock = item.stock || item.cantidadDisponible || 0;
    
    if (newQty <= 0) {
      const index = this.cart.indexOf(item);
      if (index > -1) this.cart.splice(index, 1);
      return;
    }

    if (newQty > stock) {
      alert(`Solo hay ${stock} unidades disponibles`);
      item.qty = stock;
      return;
    }

    item.qty = newQty;
  }

  total(){ 
    return this.cart.reduce((s, t) => s + ((t.precioUnitario || t.precioVenta || t.price || 0) * (t.qty || 1)), 0); 
  }

  get cambio() {
    const total = this.total();
    const cambio = this.montoRecibido - total;
    return cambio >= 0 ? cambio : 0;
  }

  get faltante() {
    const total = this.total();
    const faltante = total - this.montoRecibido;
    return faltante > 0 ? faltante : 0;
  }

  createSale(){
    if (!this.cajaState.abierta || !this.cajaState.caja || !this.cajaState.caja.id) {
      alert('Debes abrir una caja antes de realizar ventas');
      return;
    }

    if (this.cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (this.paymentMethod === 'efectivo' && this.montoRecibido < this.total()) {
      alert(`Falta recibir $${this.faltante.toFixed(2)}`);
      return;
    }

    const items = this.cart.map(i => ({ 
      productoId: i.id, 
      cantidad: i.qty || 1, 
      precio: i.precioUnitario || i.precioVenta || i.price || 0 
    }));

    const payload = { 
      items, 
      total: this.total(), 
      paymentMethod: this.paymentMethod, 
      clienteId: this.clienteId, 
      cajaId: this.cajaState.caja.id,
      empleadoId: this.auth.getEmployeeId(),
      negocioId: this.auth.getBusinessId(),
      montoRecibido: this.paymentMethod === 'efectivo' ? this.montoRecibido : this.total(),
      cambio: this.paymentMethod === 'efectivo' ? this.cambio : 0
    };

    this.loading = true;
    
    this.ventasService.create(payload).subscribe({ 
      next: (res) => {
        this.loading = false;
        alert(`Venta registrada con éxito\n\nTotal: $${this.total().toFixed(2)}\nRecibido: $${this.montoRecibido.toFixed(2)}\nCambio: $${this.cambio.toFixed(2)}`);
        this.cart = [];
        this.montoRecibido = 0;
        this.searchTerm = '';
        this.loadProducts(); // Recargar para actualizar stock
        this.loadCaja(); // Refrescar estado de caja (montoActual actualizado en backend)
        // ⭐ Refresh alertas automáticamente después de venta (stock cambió)
        this.alertasService.refresh();
      }, 
      error: (e) => { 
        this.loading = false; 
        console.error(e); 
        alert('Error registrando la venta: ' + (e.error?.message || 'Error desconocido')); 
      } 
    });
  }

  clearCart() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      this.cart = [];
      this.montoRecibido = 0;
    }
  }
}
