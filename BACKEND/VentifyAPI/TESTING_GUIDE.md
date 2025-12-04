# Guía de Pruebas - Endpoints de Reportes y Merma

## Estado Actual
✅ Compilación exitosa  
✅ Endpoint de merma implementado (`POST /api/producto/{id}/merma`)  
✅ Endpoints de reportes implementados con fallback automático  
✅ Corrección de nullable `negocioId` en controladores

## Cómo Probar

### 1. Iniciar el Servidor

Abre una terminal PowerShell y ejecuta:

```powershell
cd "C:\Users\torbe\Documents\A - Zona 30\Zona 30\ZONA 30 ANGULAR 20\VentifyAPI"
$env:ASPNETCORE_ENVIRONMENT='Development'
dotnet run
```

**Deja esta terminal abierta** (el servidor debe seguir corriendo).

### 2. Hacer Login (en OTRA terminal)

Abre una **segunda** terminal PowerShell:

```powershell
cd "C:\Users\torbe\Documents\A - Zona 30\Zona 30\ZONA 30 ANGULAR 20\VentifyAPI"

$login = Invoke-RestMethod -Method Post -Uri "http://localhost:5129/api/auth/login" -ContentType "application/json" -Body (@{ Correo="kev@gmail.com"; Password="jugador1" } | ConvertTo-Json)

$token = $login.accessToken

# Verificar token
$token
```

### 3. Probar Endpoints de Reportes

Con el `$token` guardado, ejecuta estos comandos **en la misma terminal**:

#### Ventas por Día
```powershell
$uri1 = "http://localhost:5129/api/reportes/ventas/dia?desde=2025-11-01&hasta=2025-11-30"
Invoke-RestMethod -Method Get -Uri $uri1 -Headers @{ Authorization = "Bearer $token" }
```

#### Inventario con Stock Bajo
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5129/api/reportes/inventario/stock-bajo" -Headers @{ Authorization = "Bearer $token" }
```

#### Ventas por Mes
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5129/api/reportes/ventas/mes?anio=2025" -Headers @{ Authorization = "Bearer $token" }
```

#### Ventas por Año
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5129/api/reportes/ventas/anio" -Headers @{ Authorization = "Bearer $token" }
```

#### Inventario por Categoría
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5129/api/reportes/inventario/categoria" -Headers @{ Authorization = "Bearer $token" }
```

### 4. Probar Endpoint de Merma

Primero, obtén un ID de producto válido:

```powershell
$productos = Invoke-RestMethod -Method Get -Uri "http://localhost:5129/api/producto" -Headers @{ Authorization = "Bearer $token" }
$productoId = $productos[0].Id
$productoId
```

Luego, registra merma:

```powershell
$mermaBody = @{
    incremento = 2
    motivo = "Producto dañado en almacén"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5129/api/producto/$productoId/merma" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $mermaBody
```

Verifica que se actualizó:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5129/api/producto/$productoId" -Headers @{ Authorization = "Bearer $token" }
```

## Mejoras Implementadas

### ReportesController
- **Fallback automático**: Si las vistas SQL (`vw_ventas_por_dia`, etc.) no existen o fallan, los endpoints calculan los datos directamente desde las tablas base usando LINQ.
- **Claims de JWT**: Lee `negocioId` directamente del token para evitar consultas extra a la BD.
- **Filtros por rango de fechas**: Parámetros `desde` y `hasta` opcionales.

### ProductoController
- **Endpoint de merma**: `POST /api/producto/{id}/merma` con validaciones de negocio:
  - Merma no puede exceder stock actual
  - Merma acumulada no puede exceder cantidad inicial
- **Auditoría**: Registro en tabla `merma_eventos` con stock/merma antes y después, usuario, motivo y timestamp.
- **Manejo nullable**: Corrección de conversión `int?` a `int` en filtros de negocio.

### AuthController
- **Auto-reparación**: Si un dueño no tiene `NegocioId` al hacer login, se crea automáticamente.
- **Rol dueño**: El registro crea usuarios con rol `"dueño"` y asocia un negocio nuevo.

## Notas Importantes

- Si algún endpoint de reportes devuelve `[]` (vacío), es normal si no hay datos para ese rango/filtro.
- Los endpoints de reportes usan **fallback** en caso de que las vistas SQL no existan; si quieres aprovechar las vistas para mejor rendimiento, ejecuta:
  ```bash
  mysql -u root -p zona30 < scripts/REPORTS_VIEWS.sql
  ```
- Para crear la tabla de auditoría de merma (si no existe):
  ```bash
  mysql -u root -p zona30 < scripts/create_merma_eventos.sql
  ```

## Siguientes Pasos

- [ ] Verificar que el rol "dueño" se muestra correctamente en el front
- [ ] Seleccionar librería PDF (QuestPDF recomendada por licencia MIT)
- [ ] Implementar endpoints PDF para ventas e inventario
- [ ] Diseñar módulo de descuentos

---

**¿Problemas?**
- Si el servidor se cierra al hacer peticiones, revisa la consola del servidor para ver el stack trace del error.
- Si ves 401 Unauthorized, verifica que el token sea válido (no haya expirado) y que contenga el claim `negocioId`.
- Si ves 500 Internal Server Error, mira los logs de la consola del servidor.
