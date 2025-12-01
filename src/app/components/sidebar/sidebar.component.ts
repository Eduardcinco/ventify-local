import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { AlertasService } from '../../services/alertas.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule, RouterModule]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() user: any = null;
  @Input() getUserInitials: () => string = () => 'U';
  @Input() logout: () => void = () => {};
  isOpen = true;
  sub!: Subscription;
  stockBajoCount = 0;
  private _alertaSub?: Subscription;
    fotoPerfilUrl: string | null = null;

  constructor(
    private sidebarService: SidebarService,
      private alertasService: AlertasService,
      private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.sub = this.sidebarService.isOpen$.subscribe(v => (this.isOpen = v));
    this._alertaSub = this.alertasService.stockBajoCount.subscribe(count => {
      this.stockBajoCount = count;
    });
      this.loadProfilePhoto();
  }

    loadProfilePhoto(): void {
      const saved = localStorage.getItem('usuario-foto-perfil');
      this.fotoPerfilUrl = saved ? `http://localhost:5129${saved}` : null;
    }

    getUserDisplayName(): string {
      return this.authService.getUserName() || this.authService.getUserEmail() || 'Usuario';
    }

    isDueno(): boolean { return this.authService.isDueno(); }

    getRoleLabel(): string {
      return this.isDueno() ? 'Dueño' : 'Empleado';
    }

    getUserInitialsInternal(): string {
      const name = this.authService.getUserName();
      if (!name) return 'U';
      const parts = name.split(' ').filter(p => p.length > 0);
      if (parts.length === 0) return 'U';
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this._alertaSub?.unsubscribe();
  }

  closeOnSmall() {
    // on small screens auto-close after selection
    if (window.innerWidth <= 768) this.sidebarService.close();
  }

  performLogout() {
    try {
      if (this.logout) this.logout();
    } catch (e) {
      console.error('Logout function failed', e);
    }
    // close sidebar after logout (if running on small screens)
    this.sidebarService.close();
  }
}
