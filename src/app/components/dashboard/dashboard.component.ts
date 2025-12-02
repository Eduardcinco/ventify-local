
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CajaService } from '../../services/caja.service';
import { SystemService } from '../../services/system.service';
import { AlertasService, ProductoStockBajo } from '../../services/alertas.service';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, NgIf, SidebarComponent, RouterOutlet, RouterModule, AsyncPipe]
})
export class DashboardComponent implements OnInit, OnDestroy {

  currentUser: any = null;
  cajaState: { abierta: boolean; caja: any | null } = { abierta: false, caja: null };
  serverTime?: string;
  stockBajoList: ProductoStockBajo[] = [];
  fotoPerfilUrl: string | null = null;
  private _sub: any;
  private _cajaSub: any;
  private _alertaSub: any;
  private _clockTimer?: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    public sidebarService: SidebarService,
    private cajaService: CajaService,
    private systemService: SystemService,
    private alertasService: AlertasService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.getCurrentUser();
    this.loadProfilePhoto();
    
    // 🆕 Refrescar sesión desde el backend para obtener permisosExtra actualizados
    // Esto permite que el empleado vea sus módulos extra sin re-login
    this.authService.refreshSession().subscribe({
      next: (session) => {
        console.log('✅ Sesión actualizada con permisos:', session.permisosExtra?.modulos || []);
      },
      error: (err) => {
        console.warn('⚠️ No se pudo refrescar sesión:', err.status);
      }
    });
    
    this._sub = this.sidebarService.isOpen$.subscribe((isOpen: boolean) => {
      if (!isOpen) document.body.classList.add('sidebar-closed');
      else document.body.classList.remove('sidebar-closed');
    });
    // Suscripción al estado de caja para mostrar estado y saldo
    this.cajaService.getCurrent().subscribe({
      next: (resp) => { this.cajaState = resp; },
      error: () => { this.cajaState = { abierta: false, caja: null }; }
    });
    this._cajaSub = this.cajaService.current$.subscribe(state => { this.cajaState = state; });

    // Cargar hora del servidor
    const fetchTime = () => {
      this.systemService.getTime().subscribe({
        next: (t) => this.serverTime = t.nowUtc,
        error: () => this.serverTime = undefined
      });
    };
    fetchTime();
    this._clockTimer = setInterval(fetchTime, 60_000);

    // Cargar alertas de stock bajo
    this.alertasService.getProductosStockBajo().subscribe();
    this._alertaSub = this.alertasService.productosStockBajo.subscribe(productos => {
      this.stockBajoList = productos;
      
      // 🔥 Toast crítico solo si hay productos sin stock (stock = 0) Y no está silenciado
      const alertasSilenciadas = localStorage.getItem('alertas-stock-silenciadas') === 'true';
      if (alertasSilenciadas) return;
      
      const criticos = productos.filter(p => p.stockActual === 0);
      if (criticos.length > 0) {
        const mensaje = criticos.length === 1 
          ? `⚠️ URGENTE: "${criticos[0].nombre}" sin stock`
          : `⚠️ URGENTE: ${criticos.length} productos SIN STOCK`;
        
        if (confirm(`${mensaje}\n\n¿Ir a Inventario ahora?`)) {
          this.router.navigate(['/dashboard/inventory']);
        }
      }
    });
  }

  getCurrentUser(): any {
    const token = this.authService.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  loadProfilePhoto() {
    // TODO: GET /api/usuarios/perfil para obtener fotoPerfilUrl del usuario actual
    // Por ahora se carga desde localStorage si está disponible
    const saved = localStorage.getItem('usuario-foto-perfil');
    if (saved) this.fotoPerfilUrl = saved;
  }

  ngOnDestroy(): void {
    this._sub?.unsubscribe();
    this._cajaSub?.unsubscribe();
    this._alertaSub?.unsubscribe();
    if (this._clockTimer) clearInterval(this._clockTimer);
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  getUserInitials(): string {
    const name = this.authService.getUserName();
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getUserDisplayName(): string {
    return this.authService.getUserName() || this.authService.getUserEmail() || 'Usuario';
  }

  isDueno(): boolean { return this.authService.isDueno(); }

  getRoleLabel(): string {
    return this.isDueno() ? 'Dueño' : 'Empleado';
  }

  silenciarAlertas(): void {
    if (confirm('¿Desactivar alertas emergentes de stock bajo?\n\nSeguirás viendo el indicador en el header, pero no saldrán ventanas automáticas.')) {
      localStorage.setItem('alertas-stock-silenciadas', 'true');
      alert('Alertas silenciadas. Para reactivarlas, borra "alertas-stock-silenciadas" del localStorage.');
    }
  }

  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/']),
        error: () => this.router.navigate(['/']) // Navegar igual en caso de error
      });
    }
  }
}
