# Documentación del Sistema POS Zona 30

## Descripción General

Este proyecto es un sistema de punto de venta (POS) multi-negocio, diseñado para gestionar ventas, inventario, caja, reportes y configuración empresarial. El sistema está construido en Angular y cuenta con una arquitectura modular y standalone.

## Módulos Principales

### 1. Autenticación
- Sistema de autenticación basado en JWT.
- Permite acceso seguro y gestión de sesiones.

### 2. Multi-negocio
- Soporte para múltiples negocios con contexto empresarial.
- Cada usuario puede operar en diferentes negocios según permisos.

### 3. Permisos por Roles
- Permisos detallados para cada rol (administrador, cajero, etc.).
- Control de acceso a módulos y acciones específicas.

### 4. Dashboard
- Panel principal con acceso a todos los módulos.

### 5. Punto de Venta (POS)
- Realizar ventas y cobros.
- Manejo de carrito de compras.
- Cálculo de cambio y métodos de pago (efectivo, transferencia, cheque, tarjeta).
- Impresión de tickets.

### 6. Inventario
- Visualización y gestión de productos.
- Agregar, editar y eliminar productos.
- Registrar mermas y movimientos de stock.

### 7. Caja
- Abrir y cerrar caja.
- Registrar ingresos y egresos.
- Visualizar movimientos y resumen de caja.
- Categorías de movimientos y métodos de pago.

### 8. Reportes
- Generación de reportes de ventas y movimientos.
- Exportación de reportes a Excel y PDF.
- Visualización de gráficas de ventas y pagos.

### 9. Configuración del Sistema
- Edición de perfil del negocio.
- Personalización visual (branding).
- Cambiar contraseña y correo.
- Subir foto de perfil.
- Cerrar sesiones de usuario.
- Gestión de empleados (RFC, NSS, puesto, fecha de ingreso).

### 10. Alertas de Stock
- Notificaciones de productos con bajo stock.

## Servicios Clave
- settings.service.ts: Gestión de configuración y perfil del negocio.
- reports.service.ts: Reportes y exportación de datos.
- permissions.service.ts: Permisos por rol y módulo extra.
- caja.service.ts: Manejo de caja y movimientos.
- products.service.ts: Gestión de productos e inventario.
- ventas.service.ts: Registro y manejo de ventas.

## Rutas Principales
- /inventory: Inventario
- /pos: Punto de venta
- /caja: Caja
- /proveedores: Proveedores
- /facturacion: Facturación
- /settings: Configuración

## Características Adicionales
- Modo oscuro funcional.
- Diseño responsive.
- Animaciones suaves.
- Fallbacks a localStorage.
- Validaciones en frontend.
- Exportación de reportes.
- Arquitectura standalone.

## Instalación y Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Ejecutar servidor de desarrollo:
   ```bash
   npm start
   ```
3. Compilar para producción:
   ```bash
   npm run build
   ```
4. Ejecutar pruebas:
   ```bash
   npm test
   ```

## Notas
- El sistema está preparado para operar en local y en la nube, pero la configuración actual corresponde al estado antes de los cambios para despliegue en la nube.
- Para restaurar el sistema a este estado, se utilizó el commit correspondiente antes de las 3 am.
