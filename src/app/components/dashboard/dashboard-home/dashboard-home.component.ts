import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
    imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  currentUser: any = {
    name: 'Usuario',
    businessName: 'Mi Negocio',
    email: 'email@example.com'
  };
  greeting: string = '';
  firstName: string = '';

  // Estadísticas del negocio (mock data)
  stats = {
    totalProducts: 5,
    todaySales: 0,
    totalRevenue: 210.00,
    lowStockProducts: 0
  };

  // Últimas ventas
  recentSales = [
    { id: 1, date: '2024-01-15', amount: 85.00, items: 2 },
    { id: 2, date: '2024-01-14', amount: 125.00, items: 2 }
  ];

  // Productos con bajo stock
  lowStockAlert = true; // Si hay productos con bajo stock

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Obtener datos del usuario logueado
    const token = this.authService.getToken();
    if (token) {
      try {
        this.currentUser = jwtDecode(token);
      } catch {}
    }
    this.setGreeting();
    this.setFirstName();
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Buenos días';
    else if (hour < 19) this.greeting = 'Buenas tardes';
    else this.greeting = 'Buenas noches';
  }

  setFirstName(): void {
    if (this.currentUser?.name) {
      this.firstName = this.currentUser.name.split(' ')[0];
    } else {
      this.firstName = 'Usuario';
    }
  }

  // Acciones rápidas
  newSale(): void {
    console.log('Ir a nueva venta');
  }

  manageInventory(): void {
    console.log('Ir a inventario');
  }

  viewReports(): void {
    console.log('Ir a reportes');
  }
}
