# VENTIFY — Sistema Web para Inventarios y Control Comercial

## 1. Nombre del sistema
VENTIFY – Sistema Web Integral de Gestión de Negocios en la Zona 30

## 2. Objetivo General
Desarrollar una aplicación web que permita a los negocios de la Zona 30 (o cualquier zona comercial) gestionar su inventario, productos, ventas, usuarios y configuraciones comerciales de forma sencilla, moderna y centralizada.

## 3. ¿Quién usará Ventify?
- **Dueños de negocios**: Panel administrativo para registrar productos, controlar inventario, consultar ventas, administrar empleados, personalizar tienda.
- **Empleados**: Registrar ventas, actualizar inventarios, ver productos (según permisos).
- **Administrador del sistema**: Gestiona comercios registrados, monitorea el sistema, da soporte.

## 4. Funcionalidades principales
### 4.1 Registro y autenticación
- Registro de negocio y usuario (nombre, correo, teléfono, ubicación, contraseña)
- Login con JWT

### 4.2 Módulo principal: Productos e Inventarios
- CRUD de productos con atributos: nombre, descripción, precio compra/venta, categoría, subcategoría, stock, unidad, código de barras, imágenes, variantes, fecha registro, activo.

### 4.3 Variantes personalizables del producto
- Productos con variaciones (tamaño, color, sabor, presentación) y stock/precio/código por variante.

### 4.4 Categorías y subcategorías
- CRUD de categorías y subcategorías personalizables por negocio.

### 4.5 Módulo de ventas
- Registro de ventas (productos, cantidades, total, forma de pago, fecha/hora, usuario, ticket)
- Descuento automático de stock

### 4.6 Reportes del negocio
- Productos más vendidos, ganancias, stock bajo, historial de ventas, reportes en gráficas/tablas

### 4.7 Panel de administración del negocio
- Configuración de datos del negocio, tema, categorías, permisos, reportes automáticos, descuentos

### 4.8 Administración de usuarios (empleados)
- CRUD de empleados, roles y permisos personalizables

### 4.9 Seguridad
- Contraseñas encriptadas, tokens JWT, expiración de sesión, validación en cada petición

## 5. Arquitectura del proyecto
### Frontend
- Angular 17+
- Componentes: Login, Dashboard, Inventarios, Productos, Ventas, Reportes, Configuración, Usuarios

### Backend
- .NET 8 Web API
- Arquitectura: Controllers, Data, Models, Services
- Base de datos: MySQL (Pomelo)
- Tablas: Usuarios, Negocios, Productos, VariantesProducto, Categorias, Ventas, DetalleVenta, Inventarios

## 6. Flujo del dueño del negocio
1. Registro
2. Login
3. Configura su negocio
4. Registra productos
5. Controla inventario
6. Registra ventas
7. Consulta reportes

## 7. Personalización avanzada
- Colores personalizados, logo, categorías propias, permisos, variantes dinámicas, reportes automatizados, alertas por stock bajo

## 8. Nombre comercial
VENTIFY – Tu negocio, más fácil

---

# APARTADO: API REST (Backend)

## Endpoints principales implementados

### Autenticación
- `POST /api/auth/register` — Registro de usuario
- `POST /api/auth/login` — Login de usuario

### Negocio
- `GET /api/negocio` — Listar negocios (filtro por nombre)
- `GET /api/negocio/{id}` — Obtener negocio por ID
- `POST /api/negocio` — Crear negocio
- `PUT /api/negocio/{id}` — Editar negocio
- `DELETE /api/negocio/{id}` — Eliminar negocio

### Producto
- `GET /api/producto` — Listar productos (filtro por nombre/categoría)
- `GET /api/producto/{id}` — Obtener producto por ID
- `POST /api/producto` — Crear producto
- `PUT /api/producto/{id}` — Editar producto
- `DELETE /api/producto/{id}` — Eliminar producto

### VarianteProducto
- `GET /api/varianteproducto` — Listar variantes
- `GET /api/varianteproducto/{id}` — Obtener variante por ID
- `POST /api/varianteproducto` — Crear variante
- `PUT /api/varianteproducto/{id}` — Editar variante
- `DELETE /api/varianteproducto/{id}` — Eliminar variante

### Venta
- `GET /api/venta` — Listar ventas
- `GET /api/venta/{id}` — Obtener venta por ID
- `POST /api/venta` — Registrar venta
- `PUT /api/venta/{id}` — Editar venta
- `DELETE /api/venta/{id}` — Eliminar venta

### PuntoDeVenta
- `GET /api/puntodeventa` — Listar puntos de venta
- `GET /api/puntodeventa/{id}` — Obtener punto de venta por ID
- `POST /api/puntodeventa` — Crear punto de venta
- `PUT /api/puntodeventa/{id}` — Editar punto de venta
- `DELETE /api/puntodeventa/{id}` — Eliminar punto de venta

## Notas para el frontend
- Todos los endpoints están documentados y probados en Swagger (`/swagger`).
- Los endpoints POST/PUT requieren enviar el objeto correspondiente en el body (ver ejemplo en Swagger).
- Los endpoints GET pueden aceptar filtros por query params (nombre, categoría, etc.).
- Las respuestas incluyen mensajes claros en caso de error o validación.

## Siguiente paso
- El frontend puede consumir estos endpoints directamente.
- Si necesitas endpoints adicionales, filtros, validaciones o ejemplos de requests/responses, avísame y los agrego.

---

**¡Listo para que el equipo de frontend avance!**
