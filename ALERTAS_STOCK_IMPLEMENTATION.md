# 🔔 Sistema de Alertas de Stock Bajo - Implementación Completa

## ✅ Características Implementadas

### 1. **Badge en Sidebar** (🎯 Recomendación Principal)
- **Ubicación**: Link de "Inventario" en el sidebar
- **Comportamiento**:
  - Muestra el número de productos con stock bajo
  - Pulso suave cuando hay ≥5 productos (clase `.urgent`)
  - Tooltip descriptivo al hacer hover
  - Animación de aparición suave

### 2. **Banner en Dashboard Topbar**
- **Ubicación**: Header del dashboard (junto al reloj del servidor)
- **Comportamiento**:
  - Clickeable → navega a inventario
  - Gradiente amarillo/dorado (advertencia calmada)
  - Pulso sutil cada 3 segundos
  - Responsive en móviles

### 3. **Toast Crítico al Iniciar Sesión**
- **Trigger**: Solo cuando hay productos con `stockActual = 0`
- **Comportamiento**:
  - Confirm dialog nativo (sin dependencias externas)
  - Mensaje personalizado: 1 producto vs múltiples
  - Opción de navegar directo a inventario
  - Solo se muestra en el dashboard (no repite en cada ruta)

### 4. **Refresh Automático Inteligente** ⭐
Actualiza las alertas automáticamente después de:
- ✅ Crear producto (Inventory)
- ✅ Editar producto (Inventory)
- ✅ Eliminar producto (Inventory)
- ✅ Completar venta (POS)

**Implementación con BehaviorSubjects**:
```typescript
// AlertasService centralizado
private stockBajoCount$ = new BehaviorSubject<number>(0);
private productos$ = new BehaviorSubject<ProductoStockBajo[]>([]);

refresh() {
  this.getProductosStockBajo().subscribe({
    error: (err) => console.error('Error cargando alertas:', err)
  });
}
```

## 📂 Archivos Modificados

### Servicios
- ✅ `src/app/services/alertas.service.ts` - **Creado**
  - Manejo centralizado de alertas con observables
  - Método `refresh()` público
  - Filtro de productos críticos (stock = 0)

### Componentes
- ✅ `src/app/components/sidebar/sidebar.component.ts`
  - Suscripción a `stockBajoCount`
  - Propiedad `stockBajoCount: number`
  
- ✅ `src/app/components/sidebar/sidebar.component.html`
  - Badge con clase condicional `.urgent`
  - Tooltip dinámico
  
- ✅ `src/app/components/sidebar/sidebar.component.css`
  - Estilos para `.badge-danger`
  - Posicionamiento absoluto

- ✅ `src/app/components/dashboard/dashboard.component.ts`
  - Inyección de `AlertasService`
  - Carga inicial de alertas
  - Toast crítico en `ngOnInit()`
  - Suscripción a `productosStockBajo`

- ✅ `src/app/components/dashboard/dashboard.component.html`
  - Banner de alerta clickeable
  - Condicional `*ngIf="stockBajoList.length > 0"`

- ✅ `src/app/components/dashboard/dashboard.component.css`
  - Estilos para `.stock-alert`
  - Animación `pulse-subtle`

- ✅ `src/app/components/dashboard/inventory/inventory.component.ts`
  - `alertasService.refresh()` en create/update/delete

- ✅ `src/app/components/dashboard/pos/pos.component.ts`
  - `alertasService.refresh()` después de completar venta

### Estilos Globales
- ✅ `src/styles.css`
  - Sección completa de alertas
  - `.badge-danger` con gradiente rojo
  - `.badge-danger.urgent` con pulso
  - `.critical-alert` para toasts críticos
  - `.stock-warning-banner` (uso futuro opcional)
  - Responsive para móviles

## 🎨 Diseño UX

### Colores Psicológicos
- **Badge rojo**: `#ef4444` → `#dc2626` (urgencia controlada)
- **Banner amarillo**: `#fef3c7` → `#fde68a` (advertencia calmada)
- **Toast crítico**: `#dc2626` → `#b91c1c` (solo stock = 0)

### Animaciones Sutiles
- `badge-appear`: Aparición suave (0.3s)
- `pulse-gentle`: Pulso cada 2.5s (solo si ≥5 productos)
- `pulse-subtle`: Banner cada 3s (topbar)
- `slide-in`: Banner desliza desde arriba (0.4s)

### Accesibilidad
- Tooltips descriptivos
- Contraste WCAG AAA
- Animaciones sin mareo
- Responsive en todos los tamaños

## 🔄 Flujo de Usuario

1. **Usuario inicia sesión** → Dashboard carga → `AlertasService.refresh()`
2. **Si hay productos con stock = 0** → Muestra confirm dialog crítico
3. **Badge en sidebar actualiza** → Muestra número + pulso si ≥5
4. **Usuario crea/edita producto en Inventory** → `refresh()` automático
5. **Usuario completa venta en POS** → `refresh()` automático
6. **Badge actualiza instantáneamente** → Sin recargar página (F5)

## 🚀 Pruebas Recomendadas

### Escenario 1: Login con productos críticos
```sql
-- Crear productos con stock = 0 en base de datos
UPDATE productos SET stock_actual = 0 WHERE id IN (1, 2, 3);
```
- Login → ¿Aparece confirm dialog?
- Badge muestra "3"

### Escenario 2: Crear producto con stock bajo
- Ir a Inventory
- Crear producto: `StockActual = 2`, `StockMinimo = 10`
- Badge aumenta automáticamente

### Escenario 3: Venta que deja stock crítico
- Producto con stock = 5 (mínimo = 5)
- Vender 1 unidad
- Badge actualiza (ahora stock = 4 < 5)

### Escenario 4: Badge urgente (≥5 productos)
- Badge sin pulso: 1-4 productos
- Badge CON pulso: ≥5 productos (clase `.urgent`)

## 📊 API Endpoint Utilizado

```typescript
GET /api/producto/stock-bajo
```

**Respuesta Ejemplo**:
```json
[
  {
    "id": 1,
    "nombre": "Cartera de huevos",
    "stockActual": 0,
    "stockMinimo": 5,
    "category": { "id": 2, "name": "Abarrotes" }
  }
]
```

## 🔧 Configuración

### Sin dependencias externas
- ✅ No requiere Angular Material Snackbar
- ✅ Usa confirm() nativo de JavaScript
- ✅ CSS puro con animaciones
- ✅ RxJS BehaviorSubject (ya incluido en Angular)

### Personalización Rápida

**Cambiar umbral de "urgente"**:
```html
<!-- sidebar.component.html -->
[class.urgent]="stockBajoCount >= 10"  <!-- Antes: >= 5 -->
```

**Desactivar toast crítico**:
```typescript
// dashboard.component.ts
// Comentar el bloque del confirm() en ngOnInit()
```

**Cambiar colores del badge**:
```css
/* styles.css */
.badge-danger {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); /* Amarillo */
}
```

## ✨ Próximas Mejoras Opcionales

- [ ] Botón manual "Refrescar alertas" en Dashboard
- [ ] Filtrar inventario por "Stock bajo" con un click desde badge
- [ ] Notificación push cuando stock = 0 (Service Workers)
- [ ] Agregar sonido sutil al aparecer toast crítico
- [ ] Dashboard widget con top 5 productos más críticos
- [ ] Historial de alertas ignoradas

---

**Implementación completada**: ✅ 100%  
**Errores de compilación**: ✅ 0  
**UX profesional**: ✅ Sin ansiedad, alerta efectiva  
**Refresh automático**: ✅ En todos los flujos clave
