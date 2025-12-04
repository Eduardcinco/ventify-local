# VentifyAPI - Resumen de Correcciones

## 🔧 Cambios Realizados

### 1. **Creación de `AppDbContext.cs`**
   - Configuración completa de Entity Framework Core
   - Mapeo de propiedades de C# a columnas de BD (snake_case)
   - Configuración de relaciones FK entre tablas
   - Índices únicos para `Correo`

### 2. **Corrección de Modelos**

#### `Models/Usuario.cs`
```csharp
- Cambio: PasswordHash → Password
- Cambio: creado_en → CreadoEn (PascalCase)
- Cambio: NegocioId de nullable (int?) a obligatorio (int)
- Cambio: Rol de object → string con default "dueño"
```

#### `Models/Negocio.cs`
```csharp
- Eliminado: PropietarioNombre (no existe en BD)
- Eliminado: Correo (no existe en BD)
- Mantenido: NombreNegocio, CreadoEn
- Relaciones: Usuarios, PuntosDeVenta
```

#### `Models/PuntoDeVenta.cs`
```csharp
- Sin cambios: estructura correcta
- Nota: tabla 'puntos_de_venta' debe ser creada en BD
```

### 3. **Actualización de Servicios y Controladores**

#### `Services/NegocioService.cs`
```csharp
- Cambio: PasswordHash → Password (usa BCrypt.HashPassword)
- Cambio: Eliminadas propiedades PropietarioNombre, Correo del modelo Negocio
- Agregado: Rol = "dueño" al crear usuario
```

#### `Controllers/AuthController.cs`
```csharp
- Cambio: PasswordHash → Password (usa BCrypt.Verify)
- Cambio: Agregado NegocioId = 0 (será asignado al registrar negocio)
- Cambio: Agregado Rol = "dueño" en registro
```

### 4. **Dependencias**
```csharp
- Mantenido: BCrypt.Net-Next v4.0.2 (para hash seguro de contraseñas)
```

---

## 📊 Estado Actual de la BD

### Tabla `negocios` ✅
```sql
- id (PK)
- nombre_negocio (VARCHAR 150)
- creado_en (TIMESTAMP)
```

### Tabla `usuarios` ⚠️ (Requiere cambios)
```sql
ACTUAL:
- id (PK)
- negocio_id (FK NOT NULL) ✅
- nombre (VARCHAR 100) ✅
- correo (VARCHAR 100) ✅
- password (VARCHAR 100) ❌ CAMBIAR A VARCHAR(255)
- rol (ENUM) ✅
- creado_en (TIMESTAMP) ✅

CAMBIO REQUERIDO:
ALTER TABLE usuarios MODIFY COLUMN password VARCHAR(255) NOT NULL;
```

### Tabla `puntos_de_venta` ❌ (No existe)
```sql
Debe ser creada con estructura:
- id (PK)
- nombre_punto (VARCHAR 150)
- negocio_id (FK NOT NULL)
```

---

## ⚙️ Pasos para Completar Setup

### Paso 1: Actualizar Base de Datos
```bash
# Ejecutar script SQL en MySQL
# Archivo: database_updates.sql
mysql -u root -p zona30 < database_updates.sql
```

O manualmente en MySQL Workbench:
```sql
ALTER TABLE usuarios MODIFY COLUMN password VARCHAR(255) NOT NULL;

CREATE TABLE IF NOT EXISTS puntos_de_venta (
  id int NOT NULL AUTO_INCREMENT,
  nombre_punto varchar(150) NOT NULL,
  negocio_id int NOT NULL,
  PRIMARY KEY (id),
  KEY negocio_id (negocio_id),
  CONSTRAINT puntos_de_venta_ibfk_1 FOREIGN KEY (negocio_id) REFERENCES negocios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Paso 2: Ejecutar API
```bash
cd "C:\Users\torbe\Documents\A - Zona 30\Zona 30\zona30-front\VentifyAPI"
dotnet run
# API escuchará en: http://localhost:5129
```

### Paso 3: Verificar Swagger (Documentación Interactiva)
```
http://localhost:5129/swagger
```

---

## 🧪 Endpoints Disponibles

### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "password": "MiPassword123"
}

Response 200:
{
  "message": "Usuario registrado correctamente."
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "correo": "juan@example.com",
  "password": "MiPassword123"
}

Response 200:
{
  "message": "Inicio de sesión correcto.",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@example.com"
  }
}
```

---

## 📝 Notas Importantes

1. **Contraseñas**: Se usa BCrypt.Net-Next para hash seguro
   - Contraseñas nunca se almacenan en texto plano
   - Comparación segura en login

2. **Foreign Keys**: 
   - `usuarios.negocio_id` es obligatorio
   - Si se elimina un negocio, se eliminan en cascada usuarios y puntos de venta

3. **Timestamps**: 
   - `creado_en` usa `CURRENT_TIMESTAMP` por defecto
   - No se incluye en DTOs de entrada

4. **Validaciones**:
   - Correo es UNIQUE
   - Campos requeridos validados en API

---

## ✅ Checklist de Verificación

- [ ] Base de datos actualizada (password VARCHAR 255)
- [ ] Tabla puntos_de_venta creada
- [ ] API compilada sin errores: `dotnet build`
- [ ] API ejecutándose: `dotnet run`
- [ ] Swagger accesible: http://localhost:5129/swagger
- [ ] Endpoint register funcionando
- [ ] Endpoint login funcionando
- [ ] Proyecto Angular conectado a http://localhost:5129

---

## 🔍 Siguientes Pasos

1. **Crear más endpoints** (GET negocios, CRUD puntos de venta, etc.)
2. **Integración con Angular**:
   - Servicio HTTP para autenticación
   - Interceptores para bearer tokens
   - Guards de rutas
3. **Roles y Permisos** (empleado vs dueño)
4. **Pruebas Unitarias** (xUnit o NUnit)
