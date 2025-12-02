import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { EmpleadosService, Empleado } from '../../../services/empleados.service';
import { SettingsService } from '../../../services/settings.service';
import { ToastService } from '../../../services/toast.service';
import { PermissionsService, PermisosPorRol, ModuloExtra } from '../../../services/permissions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  // Tabs activas
  activeTab: 'branding' | 'negocio' | 'cuenta' | 'empleados' = 'branding';
  
  // 🔐 Permisos
  permisos!: PermisosPorRol;

  // === 1. PERSONALIZACIÓN VISUAL ===
  branding = {
    colorPrimario: '#1976d2',
    colorSecundario: '#1565c0',
    colorFondo: '#f5f5f5',
    colorAcento: '#ff9800',
    modoOscuro: false
  };

  // === 2. DATOS DEL NEGOCIO ===
  negocio = {
    nombre: '',
    direccion: '',
    telefono: '',
    correo: '',
    rfc: '',
    giroComercial: ''
  };

  // === 3. CONTROL DE CUENTA ===
  cuenta = {
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: '',
    nuevoCorreo: '',
    fotoPerfil: null as File | null
  };

  // === 4. GESTIÓN DE EMPLEADOS ===
  mostrarFormEmpleado = false;
  employee = {
    Nombre: '',
    Apellido1: '',
    Apellido2: '',
    Telefono: '',
    RFC: '',
    SueldoDiario: null as number | null,
    FechaIngreso: '',
    NumeroSeguroSocial: '',
    Puesto: 'Empleado'
  };
  creating = false;
  createdCreds: { correo?: string; password?: string } | null = null;

  empleados: Empleado[] = [];
  editingId: number | null = null;
  fotoPerfilUrl: string | null = null;
  showPasswordMap: { [empId: number]: boolean } = {};
  editPasswordMap: { [empId: number]: string } = {}; // Nueva contraseña temporal
  
  // 🆕 Timer para contraseña temporal
  passwordTemporal: string = '';
  empleadoCreado: any = null;
  tiempoRestante: number = 60;
  mostrarPassword: boolean = false;
  private timerInterval: any = null;

  // 🛡️ Modal de permisos/rol
  showModalPermisos = false;
  empleadoSeleccionado: Empleado | null = null;
  nuevoRol: string = '';
  
  // 🆕 Modal de permisos extra (módulos adicionales)
  showModalExtras = false;
  modulosSeleccionados: ModuloExtra[] = [];
  notaPermisos: string = '';
  
  // 🆕 Modal de detalle de empleado
  showModalEmpleado = false;
  
  // 🆕 Modal de editar empleado
  showModalEditarEmpleado = false;
  empleadoEditando: Empleado | null = null;
  
  // Módulos disponibles para asignar
  modulosDisponibles: { id: ModuloExtra; nombre: string; icono: string; descripcion: string }[] = [
    { id: 'inventario', nombre: 'Inventario', icono: '📦', descripcion: 'Ver productos, agregar stock, registrar mermas' },
    { id: 'pos', nombre: 'Punto de Venta', icono: '🧾', descripcion: 'Realizar ventas, cobrar, imprimir tickets' },
    { id: 'caja', nombre: 'Caja', icono: '💰', descripcion: 'Abrir/cerrar caja, ver movimientos' },
    { id: 'reportes', nombre: 'Reportes', icono: '📊', descripcion: 'Ver reportes de ventas propias' }
  ];

  constructor(
    private auth: AuthService,
    private empleadosService: EmpleadosService,
    private settingsService: SettingsService,
    private router: Router,
    private toast: ToastService,
    public permissionsService: PermissionsService
  ) {
    this.permisos = this.permissionsService.getPermisos();
  }

  ngOnInit() {
    this.loadEmpleados();
    this.loadBrandingFromServer();
    this.loadNegocioData();
    this.loadProfilePhoto();
  }
  
  ngOnDestroy() {
    // Limpiar timer al destruir componente
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  isDueno(): boolean { return this.permissionsService.isDueno(); }

  loadProfilePhoto() {
    // TODO: endpoint GET /api/usuarios/perfil para obtener fotoPerfilUrl
    // Por ahora solo cargamos si ya se subió en esta sesión
  }

  deleteProfilePhoto() {
    if (!confirm('¿Eliminar foto de perfil y volver al avatar por defecto?')) return;
    // TODO: endpoint DELETE /api/usuarios/foto-perfil
    this.fotoPerfilUrl = null;
    localStorage.removeItem('usuario-foto-perfil');
    this.toast.success('Foto de perfil eliminada');
  }

  // === TABS ===
  setTab(tab: 'branding' | 'negocio' | 'cuenta' | 'empleados') {
    this.activeTab = tab;
  }

  // === 1. BRANDING ===
  loadBrandingFromServer() {
    this.settingsService.getBranding().subscribe({
      next: (data) => {
        this.branding = { ...this.branding, ...data };
        this.applyBranding();
      },
      error: () => {
        // Si falla, intentar cargar desde localStorage como fallback
        const saved = localStorage.getItem('app-branding');
        if (saved) {
          this.branding = { ...this.branding, ...JSON.parse(saved) };
          this.applyBranding();
        }
      }
    });
  }

  saveBranding() {
    this.settingsService.saveBranding(this.branding).subscribe({
      next: () => {
        localStorage.setItem('app-branding', JSON.stringify(this.branding));
        this.applyBranding();
        this.toast.success('Tema guardado y aplicado.');
      },
      error: (e) => {
        console.error(e);
        this.toast.error('Error al guardar el tema');
      }
    });
  }

  applyBranding() {
    const root = document.documentElement;
    root.style.setProperty('--color-primario', this.branding.colorPrimario);
    root.style.setProperty('--color-secundario', this.branding.colorSecundario);
    root.style.setProperty('--color-fondo', this.branding.colorFondo);
    root.style.setProperty('--color-acento', this.branding.colorAcento);
    
    // Force class update
    document.body.classList.remove('dark-mode');
    if (this.branding.modoOscuro) {
      setTimeout(() => document.body.classList.add('dark-mode'), 10);
    }
  }

  resetBranding() {
    this.branding = {
      colorPrimario: '#1976d2',
      colorSecundario: '#1565c0',
      colorFondo: '#f5f5f5',
      colorAcento: '#ff9800',
      modoOscuro: false
    };
    this.saveBranding();
  }

  // === 2. DATOS DEL NEGOCIO ===
  loadNegocioData() {
    this.settingsService.getNegocioPerfil().subscribe({
      next: (data) => {
        this.negocio = {
          nombre: data.nombreNegocio,
          direccion: data.direccion,
          telefono: data.telefono,
          correo: data.correo,
          rfc: data.rfc,
          giroComercial: data.giroComercial
        };
      },
      error: () => {
        const saved = localStorage.getItem('negocio-data');
        if (saved) this.negocio = JSON.parse(saved);
      }
    });
  }

  saveNegocio() {
    const dto = {
      nombreNegocio: this.negocio.nombre,
      direccion: this.negocio.direccion,
      telefono: this.negocio.telefono,
      correo: this.negocio.correo,
      rfc: this.negocio.rfc,
      giroComercial: this.negocio.giroComercial
    };
    this.settingsService.updateNegocioPerfil(dto).subscribe({
      next: () => {
        localStorage.setItem('negocio-data', JSON.stringify(this.negocio));
        this.toast.success('Datos del negocio guardados');
      },
      error: (e) => {
        console.error(e);
        this.toast.error('Error al guardar los datos del negocio');
      }
    });
  }

  // === 3. CUENTA ===
  changePassword() {
    if (!this.cuenta.passwordActual || !this.cuenta.passwordNueva) {
      alert('⚠️ Completa todos los campos');
      return;
    }
    if (this.cuenta.passwordNueva !== this.cuenta.passwordConfirm) {
      alert('⚠️ Las contraseñas nuevas no coinciden');
      return;
    }
    if (this.cuenta.passwordNueva.length < 6) {
      alert('⚠️ La contraseña debe tener al menos 6 caracteres');
      return;
    }
    const dto = {
      passwordActual: this.cuenta.passwordActual,
      passwordNueva: this.cuenta.passwordNueva
    };
    this.settingsService.cambiarPassword(dto).subscribe({
      next: () => {
        this.toast.success('Contraseña actualizada');
        this.cuenta.passwordActual = '';
        this.cuenta.passwordNueva = '';
        this.cuenta.passwordConfirm = '';
      },
      error: (e) => {
        console.error(e);
        this.toast.error(e?.error?.message || 'Error al cambiar contraseña');
      }
    });
  }

  changeEmail() {
    if (!this.cuenta.nuevoCorreo || !this.cuenta.nuevoCorreo.includes('@')) {
      alert('⚠️ Correo inválido');
      return;
    }
    const dto = { nuevoCorreo: this.cuenta.nuevoCorreo };
    this.settingsService.cambiarCorreo(dto).subscribe({
      next: () => {
        this.toast.success('Correo actualizado');
        this.cuenta.nuevoCorreo = '';
      },
      error: (e) => {
        console.error(e);
        this.toast.error(e?.error?.message || 'Error al cambiar correo');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('⚠️ Solo se permiten archivos JPG o PNG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('⚠️ El archivo no debe superar 5MB');
      return;
    }
    this.cuenta.fotoPerfil = file;
    this.settingsService.subirFotoPerfil(file).subscribe({
      next: (res) => {
        const relative = res?.fotoUrl || res?.url || res?.path;
        if (relative) {
          this.fotoPerfilUrl = relative.startsWith('http') ? relative : `http://localhost:5129${relative}`;
          if (this.fotoPerfilUrl) {
            localStorage.setItem('usuario-foto-perfil', this.fotoPerfilUrl);
          }
        }
        this.toast.success('Foto de perfil actualizada');
      },
      error: (e) => {
        console.error(e);
        this.toast.error(e?.error?.message || 'Error al subir la foto');
      }
    });
  }

  cerrarSesiones() {
    if (!confirm('¿Cerrar todas las sesiones activas excepto la actual?')) return;
    this.settingsService.cerrarSesiones().subscribe({
      next: () => {
        this.toast.info('Sesiones cerradas. Inicia sesión nuevamente.');
        this.auth.logout().subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (e) => {
        console.error(e);
        this.toast.error(e?.error?.message || 'Error al cerrar sesiones');
      }
    });
  }

  // === 4. EMPLEADOS ===
  toggleFormEmpleado() {
    this.mostrarFormEmpleado = !this.mostrarFormEmpleado;
    if (!this.mostrarFormEmpleado) this.resetEmployeeForm();
  }

  resetEmployeeForm() {
    this.employee = {
      Nombre: '',
      Apellido1: '',
      Apellido2: '',
      Telefono: '',
      RFC: '',
      SueldoDiario: null,
      FechaIngreso: '',
      NumeroSeguroSocial: '',
      Puesto: 'Empleado'
    };
    this.createdCreds = null;
  }

  createEmployee() {
    if (!this.isDueno()) {
      this.toast.error('Solo el dueño puede crear empleados');
      return;
    }
    // Validaciones
    if (!this.employee.Nombre.trim() || !this.employee.Apellido1.trim() || !this.employee.Telefono.trim()) {
      this.toast.warning('Nombre, Apellido y Teléfono son obligatorios');
      return;
    }
    if (!/^\d{10}$/.test(this.employee.Telefono)) {
      alert('⚠️ El teléfono debe tener 10 dígitos');
      return;
    }
    if (this.employee.RFC && !/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(this.employee.RFC.toUpperCase())) {
      alert('⚠️ RFC inválido (formato: AAAA######XXX)');
      return;
    }

    this.creating = true;
    const payload = {
      Nombre: this.employee.Nombre.trim(),
      Apellido1: this.employee.Apellido1.trim(),
      Apellido2: this.employee.Apellido2?.trim() || null,
      Telefono: this.employee.Telefono.trim(),
      RFC: this.employee.RFC?.trim().toUpperCase() || null,
      SueldoDiario: this.employee.SueldoDiario ?? null,
      FechaIngreso: this.employee.FechaIngreso || null,
      NumeroSeguroSocial: this.employee.NumeroSeguroSocial?.trim() || null,
      Puesto: this.employee.Puesto
    };

    // Usar servicio de empleados con fallback de ruta
    this.empleadosService.createEmpleado(payload).subscribe({
      next: (res) => {
        // Normalizar credenciales desde respuesta estructurada
        const creds = res?.credenciales || {};
        const password = creds.password || creds.Password || res?.password || res?.contrasena;
        const correo = creds.correo || creds.email || res?.correo || res?.email;
        
        this.createdCreds = { correo, password };
        
        // 🆕 Iniciar timer de 60 segundos
        this.passwordTemporal = password || '';
        this.empleadoCreado = { correo, nombre: this.employee.Nombre, apellido1: this.employee.Apellido1 };
        this.iniciarTimer();
        
        this.toast.success('Empleado creado');
        
        // Recargar empleados y agregar la contraseña al recién creado
        this.empleadosService.getEmpleados().subscribe({
          next: (emps) => {
            this.empleados = emps || [];
            // Buscar el empleado recién creado por correo y agregarle la contraseña
            const newEmp = this.empleados.find(e => e.correo === correo);
            if (newEmp && password) {
              newEmp.password = password;
              this.showPasswordMap[newEmp.id] = true; // Mostrar automáticamente
            }
          },
          error: () => console.error('Error cargando empleados')
        });
        
        this.mostrarFormEmpleado = false;
        this.resetEmployeeForm();
      },
      error: (e) => {
        console.error(e);
        this.toast.error(e?.error?.message || 'Error creando empleado');
      },
      complete: () => {
        this.creating = false;
      }
    });
  }

  loadEmpleados() {
    const negocioId = this.auth.getBusinessId();
    this.empleadosService.getEmpleados().subscribe({
      next: (emps) => {
        const list = emps || [];
        this.empleados = negocioId
          ? list.filter(e => !('negocioId' in e) || String((e as any).negocioId) === String(negocioId))
          : list;
      },
      error: (e) => {
        console.error('Error cargando empleados', e);
        this.empleados = [];
      }
    });
  }

  startEdit(emp: Empleado) {
    this.editingId = emp.id;
  }

  cancelEdit() {
    this.editingId = null;
    this.loadEmpleados();
  }

  saveEmpleado(emp: Empleado) {
    this.empleadosService.updateEmpleado(emp.id, emp).subscribe({
      next: () => { this.toast.success('Empleado actualizado'); this.editingId = null; this.loadEmpleados(); },
      error: (e) => { console.error(e); this.toast.error('Error actualizando empleado'); }
    });
  }

  resetPassword(emp: Empleado) {
    if (!confirm(`¿Resetear contraseña de ${emp.nombre} ${emp.apellido1}?`)) return;
    this.empleadosService.resetPassword(emp.id).subscribe({
      next: (res) => {
        const nuevaPassword = res.nuevaPassword || (res as any).password || (res as any).contrasena;
        // Actualizar el empleado en la lista con la nueva contraseña
        emp.password = nuevaPassword;
        this.showPasswordMap[emp.id] = true; // Mostrar automáticamente
        this.toast.success(`Contraseña reseteada para ${res.correo}`);
      },
      error: (e) => { console.error(e); this.toast.error('Error al resetear contraseña'); }
    });
  }

  togglePasswordVisibility(empId: number) {
    this.showPasswordMap[empId] = !this.showPasswordMap[empId];
  }

  startEditPassword(emp: Empleado) {
    this.editPasswordMap[emp.id] = emp.password || '';
  }

  cancelEditPassword(empId: number) {
    delete this.editPasswordMap[empId];
  }

  saveNewPassword(emp: Empleado) {
    const newPassword = this.editPasswordMap[emp.id];
    if (!newPassword || newPassword.trim().length < 6) {
      this.toast.warning('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    // Aquí deberías llamar a un endpoint del backend para cambiar la contraseña
    // Como no existe aún, actualizo localmente
    emp.password = newPassword.trim();
    delete this.editPasswordMap[emp.id];
    this.showPasswordMap[emp.id] = true;
    this.toast.success('Contraseña actualizada');
  }
  
  // 🆕 Timer de 60 segundos para contraseña temporal
  iniciarTimer() {
    this.tiempoRestante = 60;
    this.mostrarPassword = true; // Mostrar por defecto
    
    // Limpiar timer previo si existe
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      this.tiempoRestante--;
      if (this.tiempoRestante <= 0) {
        this.passwordTemporal = '';
        this.empleadoCreado = null;
        this.mostrarPassword = false;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.toast.warning('⏰ La contraseña temporal ha expirado por seguridad');
      }
    }, 1000);
  }

  // ═══════════════════════════════════════════════════════════
  // 🛡️ MODAL DE PERMISOS / CAMBIO DE ROL
  // ═══════════════════════════════════════════════════════════

  abrirModalPermisos(emp: Empleado) {
    this.empleadoSeleccionado = emp;
    this.nuevoRol = emp.rol || 'Cajero';
    this.showModalPermisos = true;
  }

  cerrarModalPermisos() {
    this.showModalPermisos = false;
    this.empleadoSeleccionado = null;
    this.nuevoRol = '';
  }

  getInitials(emp: Empleado): string {
    if (!emp) return '?';
    const nombre = emp.nombre || '';
    const apellido = emp.apellido1 || '';
    return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase() || '?';
  }

  guardarNuevoRol() {
    if (!this.empleadoSeleccionado || !this.nuevoRol) return;

    const empId = this.empleadoSeleccionado.id;
    
    // Llamar al backend para actualizar el rol
    this.empleadosService.updateRol(empId, this.nuevoRol).subscribe({
      next: () => {
        // Actualizar localmente
        const emp = this.empleados.find(e => e.id === empId);
        if (emp) {
          emp.rol = this.nuevoRol;
        }
        this.toast.success(`Rol actualizado a ${this.nuevoRol}`);
        this.cerrarModalPermisos();
      },
      error: (err) => {
        console.error('Error actualizando rol:', err);
        this.toast.error('Error al actualizar el rol');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 🆕 MODAL DE PERMISOS EXTRA (MÓDULOS ADICIONALES TEMPORALES)
  // ═══════════════════════════════════════════════════════════

  abrirModalExtras(emp: Empleado) {
    this.empleadoSeleccionado = emp;
    // Cargar módulos ya asignados
    this.modulosSeleccionados = [...(emp.permisosExtra?.modulos || [])] as ModuloExtra[];
    this.notaPermisos = emp.permisosExtra?.nota || '';
    this.showModalExtras = true;
  }

  cerrarModalExtras() {
    this.showModalExtras = false;
    this.empleadoSeleccionado = null;
    this.modulosSeleccionados = [];
    this.notaPermisos = '';
  }

  toggleModulo(modulo: ModuloExtra) {
    const idx = this.modulosSeleccionados.indexOf(modulo);
    if (idx >= 0) {
      this.modulosSeleccionados.splice(idx, 1);
    } else {
      this.modulosSeleccionados.push(modulo);
    }
  }

  isModuloSelected(modulo: ModuloExtra): boolean {
    return this.modulosSeleccionados.includes(modulo);
  }

  /**
   * Verificar si un módulo ya está incluido en el rol base del empleado
   */
  moduloIncluidoEnRol(modulo: ModuloExtra, rol: string): boolean {
    const rolNorm = (rol || '').toLowerCase();
    
    switch (modulo) {
      case 'inventario':
        return ['dueno', 'dueño', 'gerente', 'almacenista'].some(r => rolNorm.includes(r));
      case 'pos':
      case 'caja':
        return ['dueno', 'dueño', 'gerente', 'cajero'].some(r => rolNorm.includes(r));
      case 'reportes':
        return ['dueno', 'dueño', 'gerente', 'cajero'].some(r => rolNorm.includes(r));
      default:
        return false;
    }
  }

  guardarPermisosExtra() {
    if (!this.empleadoSeleccionado) return;

    const empId = this.empleadoSeleccionado.id;
    const usuario = this.auth.getUserName() || 'Admin';
    
    // Filtrar módulos que ya están en el rol base
    const modulosNuevos = this.modulosSeleccionados.filter(
      m => !this.moduloIncluidoEnRol(m, this.empleadoSeleccionado!.rol)
    );

    if (modulosNuevos.length === 0 && this.modulosSeleccionados.length > 0) {
      this.toast.info('Todos los módulos seleccionados ya están incluidos en su rol');
      this.cerrarModalExtras();
      return;
    }
    
    this.empleadosService.updatePermisosExtra(empId, {
      modulos: modulosNuevos,
      asignadoPor: usuario,
      nota: this.notaPermisos
    }).subscribe({
      next: () => {
        // Actualizar localmente
        const emp = this.empleados.find(e => e.id === empId);
        if (emp) {
          emp.permisosExtra = {
            modulos: modulosNuevos,
            asignadoPor: usuario,
            fechaAsignacion: new Date().toISOString(),
            nota: this.notaPermisos
          };
        }
        
        if (modulosNuevos.length > 0) {
          this.toast.success(`✅ ${modulosNuevos.length} módulo(s) extra asignados a ${emp?.nombre}`);
        } else {
          this.toast.success(`Permisos extra removidos de ${emp?.nombre}`);
        }
        this.cerrarModalExtras();
      },
      error: (err) => {
        console.error('Error guardando permisos extra:', err);
        this.toast.error('Error al guardar los permisos extra');
      }
    });
  }

  quitarTodosExtras() {
    if (!this.empleadoSeleccionado) return;
    if (!confirm(`¿Quitar todos los permisos extra de ${this.empleadoSeleccionado.nombre}?`)) return;

    const empId = this.empleadoSeleccionado.id;
    
    this.empleadosService.clearPermisosExtra(empId).subscribe({
      next: () => {
        const emp = this.empleados.find(e => e.id === empId);
        if (emp) {
          emp.permisosExtra = undefined;
        }
        this.toast.success('Permisos extra eliminados');
        this.cerrarModalExtras();
      },
      error: (err) => {
        console.error('Error quitando permisos extra:', err);
        this.toast.error('Error al quitar los permisos extra');
      }
    });
  }

  /**
   * Contar módulos extra activos de un empleado
   */
  countExtras(emp: Empleado): number {
    return emp.permisosExtra?.modulos?.length || 0;
  }

  /**
   * Obtener nombre amigable de un módulo
   */
  getModuloNombre(moduloId: string): string {
    const mod = this.modulosDisponibles.find(m => m.id === moduloId);
    return mod ? mod.nombre : moduloId;
  }

  // ═══════════════════════════════════════════════════════════
  // 🆕 MODAL DE DETALLE DE EMPLEADO (CLICK EN CARD)
  // ═══════════════════════════════════════════════════════════

  abrirModalEmpleado(emp: Empleado) {
    this.empleadoSeleccionado = emp;
    this.showModalEmpleado = true;
  }

  cerrarModalEmpleado() {
    this.showModalEmpleado = false;
  }

  // ═══════════════════════════════════════════════════════════
  // 🆕 MODAL DE EDITAR DATOS DE EMPLEADO
  // ═══════════════════════════════════════════════════════════

  abrirModalEditarEmpleado(emp: Empleado) {
    // Crear copia para no modificar el original directamente
    this.empleadoEditando = { ...emp };
    this.showModalEditarEmpleado = true;
  }

  cerrarModalEditarEmpleado() {
    this.showModalEditarEmpleado = false;
    this.empleadoEditando = null;
  }

  guardarEmpleadoEditado() {
    if (!this.empleadoEditando) return;

    this.empleadosService.updateEmpleado(this.empleadoEditando.id, this.empleadoEditando).subscribe({
      next: () => {
        // Actualizar en la lista local
        const idx = this.empleados.findIndex(e => e.id === this.empleadoEditando!.id);
        if (idx >= 0) {
          this.empleados[idx] = { ...this.empleadoEditando! };
        }
        this.toast.success('Empleado actualizado correctamente');
        this.cerrarModalEditarEmpleado();
      },
      error: (err) => {
        console.error('Error actualizando empleado:', err);
        this.toast.error('Error al actualizar el empleado');
      }
    });
  }
}
