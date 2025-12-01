import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService, Cliente, CrearClienteDTO, ActualizarClienteDTO } from '../../../services/clientes.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;
  showInactivos = false;

  // Formulario
  form = {
    nombreCompleto: '',
    telefono: '',
    correo: '',
    direccion: '',
    rfc: '',
    limiteCredito: 0,
    notas: ''
  };

  // Edición inline
  editingField: { clienteId: number; field: string } | null = null;
  tempValue: any = null;

  constructor(
    private clientesService: ClientesService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Delay para asegurar que auth token esté disponible
    setTimeout(() => this.loadClientes(), 100);
  }

  loadClientes(): void {
    this.loading = true;
    this.clientesService.getClientes(!this.showInactivos).subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.toastService.error('Error al cargar clientes');
        this.loading = false;
      }
    });
  }

  toggleInactivos(): void {
    this.showInactivos = !this.showInactivos;
    this.loadClientes();
  }

  openForm(cliente?: Cliente): void {
    if (cliente) {
      this.editingId = cliente.id;
      this.form = {
        nombreCompleto: cliente.nombreCompleto,
        telefono: cliente.telefono,
        correo: cliente.correo || '',
        direccion: cliente.direccion || '',
        rfc: cliente.rfc || '',
        limiteCredito: cliente.limiteCredito,
        notas: cliente.notas || ''
      };
    } else {
      this.editingId = null;
      this.resetForm();
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      nombreCompleto: '',
      telefono: '',
      correo: '',
      direccion: '',
      rfc: '',
      limiteCredito: 0,
      notas: ''
    };
  }

  validateForm(): boolean {
    if (!this.form.nombreCompleto.trim()) {
      this.toastService.warning('El nombre completo es obligatorio');
      return false;
    }
    const tel = this.form.telefono.replace(/\D/g, '');
    if (tel.length !== 10) {
      this.toastService.warning('El teléfono debe contener 10 dígitos');
      return false;
    }
    if (this.form.rfc && !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(this.form.rfc.toUpperCase())) {
      this.toastService.warning('RFC inválido (formato: 3-4 letras + 6 dígitos + 3 alfanuméricos)');
      return false;
    }
    if (this.form.limiteCredito < 0) {
      this.toastService.warning('El límite de crédito no puede ser negativo');
      return false;
    }
    return true;
  }

  saveCliente(): void {
    if (!this.validateForm()) return;

    const dto: CrearClienteDTO | ActualizarClienteDTO = {
      nombreCompleto: this.form.nombreCompleto.trim(),
      telefono: this.form.telefono.replace(/\D/g, ''),
      correo: this.form.correo.trim() || undefined,
      direccion: this.form.direccion.trim() || undefined,
      rfc: this.form.rfc.trim().toUpperCase() || undefined,
      limiteCredito: this.form.limiteCredito,
      notas: this.form.notas.trim() || undefined
    };

    if (this.editingId) {
      this.clientesService.updateCliente(this.editingId, dto as ActualizarClienteDTO).subscribe({
        next: () => {
          this.toastService.success('Cliente actualizado correctamente');
          this.closeForm();
          this.loadClientes();
        },
        error: (err) => {
          console.error('Error actualizando cliente:', err);
          this.toastService.error('Error al actualizar cliente');
        }
      });
    } else {
      this.clientesService.createCliente(dto as CrearClienteDTO).subscribe({
        next: () => {
          this.toastService.success('Cliente creado correctamente');
          this.closeForm();
          this.loadClientes();
        },
        error: (err) => {
          console.error('Error creando cliente:', err);
          this.toastService.error('Error al crear cliente');
        }
      });
    }
  }

  deleteCliente(cliente: Cliente): void {
    if (!confirm(`¿Desactivar cliente "${cliente.nombreCompleto}"?`)) return;
    
    this.clientesService.deleteCliente(cliente.id).subscribe({
      next: () => {
        this.toastService.success('Cliente desactivado');
        this.loadClientes();
      },
      error: (err) => {
        console.error('Error desactivando cliente:', err);
        this.toastService.error('Error al desactivar cliente');
      }
    });
  }

  reactivarCliente(cliente: Cliente): void {
    const dto: ActualizarClienteDTO = { activo: true };
    this.clientesService.updateCliente(cliente.id, dto).subscribe({
      next: () => {
        this.toastService.success('Cliente reactivado');
        this.loadClientes();
      },
      error: (err) => {
        console.error('Error reactivando cliente:', err);
        this.toastService.error('Error al reactivar cliente');
      }
    });
  }

  // Edición inline
  startEdit(clienteId: number, field: string, currentValue: any): void {
    this.editingField = { clienteId, field };
    this.tempValue = currentValue;
  }

  cancelEdit(): void {
    this.editingField = null;
    this.tempValue = null;
  }

  saveInlineEdit(cliente: Cliente): void {
    if (!this.editingField) return;

    const field = this.editingField.field;
    let value = this.tempValue;

    // Validaciones específicas
    if (field === 'telefono') {
      const tel = value.replace(/\D/g, '');
      if (tel.length !== 10) {
        this.toastService.warning('El teléfono debe contener 10 dígitos');
        this.cancelEdit();
        return;
      }
      value = tel;
    }

    if (field === 'rfc' && value && !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(value.toUpperCase())) {
      this.toastService.warning('RFC inválido');
      this.cancelEdit();
      return;
    }

    if (field === 'limiteCredito' && value < 0) {
      this.toastService.warning('El límite de crédito no puede ser negativo');
      this.cancelEdit();
      return;
    }

    const dto: ActualizarClienteDTO = { [field]: value || undefined };
    
    this.clientesService.updateCliente(cliente.id, dto).subscribe({
      next: () => {
        this.toastService.success('Campo actualizado');
        this.cancelEdit();
        this.loadClientes();
      },
      error: (err) => {
        console.error('Error actualizando campo:', err);
        this.toastService.error('Error al actualizar');
        this.cancelEdit();
      }
    });
  }

  isEditing(clienteId: number, field: string): boolean {
    return this.editingField?.clienteId === clienteId && this.editingField?.field === field;
  }

  filterClientes(searchTerm: string): void {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredClientes = this.clientes;
      return;
    }
    this.filteredClientes = this.clientes.filter(c =>
      c.nombreCompleto.toLowerCase().includes(term) ||
      c.telefono.includes(term) ||
      (c.rfc && c.rfc.toLowerCase().includes(term))
    );
  }
}
