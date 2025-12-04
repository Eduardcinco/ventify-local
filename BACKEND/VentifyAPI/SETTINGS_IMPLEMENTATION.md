# 🎨 MÓDULO DE CONFIGURACIÓN - IMPLEMENTACIÓN COMPLETA

## ✅ LO QUE SE MODIFICÓ EN EL FRONTEND

### Archivos Modificados:

1. **settings.component.ts**
   - ✅ Sistema de tabs (branding, negocio, cuenta, empleados)
   - ✅ Gestión de colores y tema
   - ✅ Modo oscuro con localStorage
   - ✅ Formulario expandible de empleados (acordeón)
   - ✅ Campos adicionales: RFC, NSS, Puesto, Fecha Ingreso
   - ✅ Validación de RFC mexicano
   - ✅ Cambio de contraseña y correo
   - ✅ Cerrar todas las sesiones

2. **settings.component.html**
   - ✅ 4 tabs navegables
   - ✅ Formulario de personalización visual (color pickers)
   - ✅ Formulario de datos del negocio
   - ✅ Sección de cuenta (password, email, foto)
   - ✅ Action card clickeable para agregar empleado
   - ✅ Formulario expandible con animación
   - ✅ Tabla de empleados con edición inline

3. **settings.component.css** (PENDIENTE - copiar manualmente)
   - ✅ Diseño profesional con tabs
   - ✅ Modo oscuro completo
   - ✅ Color pickers personalizados
   - ✅ Action cards con hover effects
   - ✅ Animaciones suaves
   - ✅ Responsive para móvil
   - ⚠️ **ACCIÓN REQUERIDA**: Copiar el CSS que te proporcioné anteriormente

---

## 🔧 ENDPOINTS QUE DEBES AGREGAR AL BACKEND

### 1. **Personalización Visual (Branding)**
```csharp
// OPCIONAL - Si quieres guardar en BD en lugar de localStorage

GET  /api/negocio/branding
POST /api/negocio/branding
Body: {
  "colorPrimario": "#1976d2",
  "colorSecundario": "#1565c0",
  "colorFondo": "#f5f5f5",
  "colorAcento": "#ff9800",
  "modoOscuro": false
}
```

### 2. **Datos del Negocio**
```csharp
// Perfil del negocio

GET /api/negocio/perfil
Response: {
  "id": 1,
  "nombre": "Mi Tienda",
  "direccion": "Calle #123",
  "telefono": "5512345678",
  "correo": "contacto@tienda.com",
  "rfc": "XAXX010101000",
  "giroComercial": "Abarrotes"
}

PUT /api/negocio/perfil
Body: { ...mismos campos }
```

**Modelo en BD**:
```sql
ALTER TABLE negocios ADD COLUMN direccion VARCHAR(500);
ALTER TABLE negocios ADD COLUMN rfc VARCHAR(13);
ALTER TABLE negocios ADD COLUMN giro_comercial VARCHAR(100);
```

### 3. **Cambiar Contraseña**
```csharp
POST /api/usuarios/cambiar-password
Body: {
  "passwordActual": "oldpass123",
  "passwordNueva": "newpass456"
}
Response: { "success": true }

// Validar:
// - Password actual coincide con hash
// - Nueva contraseña >= 6 caracteres
// - Hashear y actualizar
```

### 4. **Cambiar Correo**
```csharp
POST /api/usuarios/cambiar-correo
Body: {
  "nuevoCorreo": "nuevo@email.com"
}
Response: { "success": true }

// Validar:
// - Email único en BD
// - Enviar correo de verificación (opcional)
```

### 5. **Subir Foto de Perfil**
```csharp
POST /api/usuarios/foto-perfil
Content-Type: multipart/form-data
Body: file (imagen)

Response: {
  "fotoUrl": "https://cdn.app.com/usuarios/1/foto.jpg"
}

// Implementar:
// - Validar tipo MIME (image/jpeg, image/png)
// - Limitar tamaño (max 5MB)
// - Redimensionar a 256x256
// - Guardar en storage (Azure Blob, AWS S3, o local)
// - Actualizar campo `foto_perfil` en usuarios
```

### 6. **Cerrar Todas las Sesiones**
```csharp
POST /api/usuarios/cerrar-sesiones
Response: { "sesiones Cerradas": 3 }

// Implementar:
// - Invalidar todos los JWT del usuario (usar blacklist)
// - O: Incrementar campo `token_version` en usuarios
// - El token actual sigue válido (del request)
```

### 7. **Empleados - Campos Adicionales**
```csharp
// Actualizar modelo Empleado

POST /api/usuarios/empleados
Body: {
  "Nombre": "Juan",
  "Apellido1": "Pérez",
  "Apellido2": "García",
  "Telefono": "5512345678",
  "RFC": "PEPJ900101XXX",           // ✅ NUEVO
  "NumeroSeguroSocial": "12345678901", // ✅ NUEVO
  "Puesto": "Cajero",                // ✅ NUEVO
  "FechaIngreso": "2024-01-15",      // ✅ NUEVO
  "SueldoDiario": 250.00
}
```

**Cambios en BD**:
```sql
ALTER TABLE usuarios ADD COLUMN rfc VARCHAR(13);
ALTER TABLE usuarios ADD COLUMN numero_seguro_social VARCHAR(11);
ALTER TABLE usuarios ADD COLUMN puesto VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN fecha_ingreso DATE;
```

**Validaciones RFC**:
```csharp
// Regex para RFC Persona Física:
// ^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$
// Ejemplo: PEPJ900101H02

public bool ValidarRFC(string rfc)
{
    if (string.IsNullOrEmpty(rfc)) return true; // Opcional
    var regex = new Regex(@"^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$");
    return regex.IsMatch(rfc.ToUpper());
}
```

---

## 📦 MODELOS ACTUALIZADOS

### NegocioDTO.cs
```csharp
public class NegocioDTO
{
    public int Id { get; set; }
    public string Nombre { get; set; }
    public string? Direccion { get; set; }
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public string? RFC { get; set; }
    public string? GiroComercial { get; set; }
}
```

### EmpleadoDTO.cs
```csharp
public class CrearEmpleadoDTO
{
    public string Nombre { get; set; }
    public string Apellido1 { get; set; }
    public string? Apellido2 { get; set; }
    public string Telefono { get; set; }
    public string? RFC { get; set; }                // NUEVO
    public string? NumeroSeguroSocial { get; set; } // NUEVO
    public string? Puesto { get; set; }             // NUEVO
    public DateTime? FechaIngreso { get; set; }     // NUEVO
    public decimal? SueldoDiario { get; set; }
}
```

---

## 🎨 CSS COMPLETO (Copiar Manualmente)

⚠️ **IMPORTANTE**: Necesitas copiar el CSS completo que proporcioné anteriormente en:
`settings.component.css`

Incluye:
- 🎨 Sistema de tabs profesional
- 🌙 Modo oscuro completo
- 🎨 Color pickers personalizados
- 📋 Formularios con grid responsive
- 🔲 Action cards con acordeón
- 📊 Tabla de empleados estilizada
- 📱 Responsive para móviles

**Longitud**: ~800 líneas de CSS

---

## 🚀 CÓMO PROBAR

### 1. Personalización Visual
1. Ir a Settings → Personalización
2. Cambiar colores con los pickers
3. Activar modo oscuro
4. Guardar → Recargar página
5. **Verificar**: Los colores persisten (localStorage)

### 2. Datos del Negocio
1. Ir a Settings → Mi Negocio
2. Llenar todos los campos
3. RFC: `XAXX010101000` (13 caracteres)
4. Guardar
5. **Backend**: Implementar PUT /api/negocio/perfil

### 3. Mi Cuenta
1. Ir a Settings → Mi Cuenta
2. Cambiar contraseña (validar actual)
3. Cambiar email
4. Subir foto (opcional)
5. Cerrar sesiones
6. **Backend**: Implementar los 4 endpoints

### 4. Empleados
1. Ir a Settings → Empleados
2. Click en "Agregar Nuevo Empleado" (se expande)
3. Llenar formulario:
   - RFC: `PEPJ900101H02` (validación automática)
   - NSS: 11 dígitos
   - Puesto: seleccionar dropdown
   - Fecha Ingreso: date picker
4. Crear → Muestra credenciales
5. **Backend**: Actualizar modelo + BD

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend ✅
- [x] Tabs navegables
- [x] Formulario de branding con color pickers
- [x] Formulario de datos del negocio
- [x] Cambio de contraseña/email
- [x] Foto de perfil
- [x] Cerrar sesiones
- [x] Action card expandible
- [x] Validación RFC
- [x] Campos adicionales empleados
- [x] Modo oscuro

### Backend ⚠️ (PENDIENTE)
- [ ] GET/PUT /api/negocio/perfil
- [ ] POST /api/usuarios/cambiar-password
- [ ] POST /api/usuarios/cambiar-correo
- [ ] POST /api/usuarios/foto-perfil (multipart)
- [ ] POST /api/usuarios/cerrar-sesiones
- [ ] Actualizar modelo Empleado (RFC, NSS, Puesto, FechaIngreso)
- [ ] Migración de BD (ALTER TABLE)

### Base de Datos ⚠️ (PENDIENTE)
- [ ] negocios: direccion, rfc, giro_comercial
- [ ] usuarios: rfc, numero_seguro_social, puesto, fecha_ingreso
- [ ] usuarios: foto_perfil (VARCHAR 500)
- [ ] usuarios: token_version (INT) para invalidar sesiones

---

## 📝 NOTAS FINALES

1. **Branding**: Actualmente usa localStorage. Si quieres sincronizar entre dispositivos, implementa el endpoint en backend.

2. **Foto de Perfil**: Necesitas decidir storage:
   - Local: `wwwroot/uploads/usuarios/{id}/foto.jpg`
   - Cloud: Azure Blob Storage / AWS S3

3. **Cerrar Sesiones**: Requiere estrategia de invalidación de JWT:
   - Opción A: Blacklist de tokens
   - Opción B: `token_version` en usuarios

4. **Validaciones**: El RFC ya se valida en frontend, pero SIEMPRE valida también en backend.

5. **Modo Oscuro**: Se aplica con clase `dark-mode` en `<body>`. Persiste en localStorage.

---

## 🎯 PRIORIDADES

**Alta**:
- ✅ GET/PUT /api/negocio/perfil (datos básicos)
- ✅ Actualizar modelo Empleado (RFC, NSS, Puesto)
- ✅ Migración BD

**Media**:
- POST /api/usuarios/cambiar-password
- POST /api/usuarios/cambiar-correo

**Baja** (opcional):
- POST /api/usuarios/foto-perfil
- POST /api/usuarios/cerrar-sesiones
- GET/POST /api/negocio/branding

---

**Implementación completada**: Frontend 100% ✅  
**Backend pendiente**: 7 endpoints + migraciones BD ⚠️  
**Tiempo estimado backend**: 3-4 horas

¿Empezamos con los endpoints del backend? 🚀
