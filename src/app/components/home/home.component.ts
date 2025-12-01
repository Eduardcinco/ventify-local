
import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isLoggedIn = false;
  currentUser: any = null;
  stats = [
    { label: 'Ventas hoy', value: 0 },
    { label: 'Productos', value: 0 },
    { label: 'Clientes', value: 0 }
  ];
  products = [
    { name: 'Producto demo', category: 'General', stock: 10, price: '$10' }
  ];

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    const token = this.auth.getToken();
    this.isLoggedIn = !!token;
    // Solo redirigir si hay token en memoria (sesión activa)
    if (token) {
      this.router.navigate(['/dashboard']);
    }
    // Si tienes endpoint para obtener usuario actual, aquí puedes cargarlo
    // this.auth.getCurrentUser().subscribe(user => this.currentUser = user);
  }
}
