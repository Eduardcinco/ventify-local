# Guía rápida para capturar errores durante las pruebas

## Preparación previa
1. **Limpiar cache del navegador:**
   - Chrome/Edge: F12 → Application → Clear storage → Clear site data
   - Firefox: F12 → Storage → Clear All
   - O usa modo incógnito directo.

2. **Dos navegadores diferentes** (para simular dos negocios):
   - Navegador A: Usuario 1 (ej. `owner1@test.com`)
   - Navegador B: Usuario 2 (ej. `owner2@test.com`)

## Si encuentras errores en el frontend

### Opción 1: Copiar desde DevTools
1. F12 → Network
2. Encuentra la petición que falló
3. Copia:
   - URL
   - Method (GET/POST/PUT/DELETE)
   - Request Headers (especialmente `Authorization` si tiene token)
   - Request Payload (si es POST/PUT)
   - Response (el body del error)
4. Pégalo aquí en el chat.

### Opción 2: Usar el script de captura
Si tienes el token JWT guardado (desde localStorage o la respuesta de login):

**GET request:**
```powershell
.\scripts\capture-endpoint-error.ps1 -Method GET -Endpoint "/api/productos" -Token "eyJhbGc..."
```

**POST request con body:**
```powershell
$body = @{ nombre = "Producto Test"; precio_venta = 100 } | ConvertTo-Json
.\scripts\capture-endpoint-error.ps1 -Method POST -Endpoint "/api/productos" -Token "eyJhbGc..." -BodyJson $body
```

**Sin autenticación (ej. endpoints públicos):**
```powershell
.\scripts\capture-endpoint-error.ps1 -Method GET -Endpoint "/api/system/time"
```

El script guardará todo en `logs/error-{METHOD}-{STATUS}-{timestamp}.txt` o `logs/success-{METHOD}-{timestamp}.txt`.

## Escenarios de prueba sugeridos

### Escenario 1: Registro y login de dos dueños
- [ ] Navegador A: registrar `owner1@test.com`
- [ ] Navegador B: registrar `owner2@test.com`
- [ ] Ambos: verificar que reciben `negocioId` diferente
- [ ] Ambos: login y guardar tokens

### Escenario 2: Productos multi-tenant
- [ ] Usuario 1: crear producto "Producto A"
- [ ] Usuario 2: crear producto "Producto A" (mismo nombre, diferente negocio)
- [ ] Usuario 1: listar productos (solo debe ver su producto)
- [ ] Usuario 2: listar productos (solo debe ver su producto)
- [ ] Usuario 1: intentar acceder al ID del producto del usuario 2 (debe fallar 404/403)

### Escenario 3: Clientes multi-tenant
- [ ] Usuario 1: crear cliente "Juan Pérez"
- [ ] Usuario 2: crear cliente "Juan Pérez" (mismo nombre, diferente negocio)
- [ ] Verificar aislamiento (cada uno ve solo sus clientes)

### Escenario 4: Caja
- [ ] Usuario 1: abrir caja con monto inicial
- [ ] Usuario 2: abrir caja con monto inicial
- [ ] Usuario 1: intentar cerrar caja del usuario 2 (debe fallar)

### Escenario 5: Ventas
- [ ] Usuario 1: crear venta
- [ ] Usuario 2: crear venta
- [ ] Verificar que cada uno ve solo sus ventas

## Tipos de errores comunes a reportar

| Error | Qué capturar |
|-------|-------------|
| 400 Bad Request | Body completo de respuesta (validación que falló) |
| 401 Unauthorized | Verificar si token está presente y válido |
| 403 Forbidden | URL + método + payload (permisos insuficientes) |
| 404 Not Found | URL completa + método |
| 500 Internal Server | Body de respuesta + logs del servidor si están visibles |

## Obtener el token JWT del navegador
Abre consola del navegador (F12 → Console):
```javascript
// Si el front guarda en localStorage:
console.log(localStorage.getItem('accessToken'));

// Si está en sessionStorage:
console.log(sessionStorage.getItem('accessToken'));

// Ver todo el localStorage:
console.log(localStorage);
```

## Siguiente paso
Haz las pruebas con ambos navegadores y cuando encuentres un error:
1. Captura toda la info (URL, método, request, response).
2. Pega aquí o usa el script para generar el log.
3. Avísame y lo analizo/corrijo inmediatamente.

¡Suerte con las pruebas! 🚀
