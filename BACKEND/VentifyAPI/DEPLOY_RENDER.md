# Ventify API - Deploy en Render (Gratis)

Sistema de inventarios y POS con IA integrada (OpenRouter) para tiendas.

## Variables de Entorno Requeridas

Configura estas variables en Render Dashboard → Environment:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MYSQL_CONN` | Conexión MySQL/MariaDB | `Server=mysql.render.com;Port=3306;Database=ventify;User=user;Password=***` |
| `JWT_SECRET` | Secret para tokens JWT | `tu-secret-muy-seguro-de-32-chars` |
| `OPENROUTER_API_KEY` | API key de OpenRouter para IA | `sk-or-v1-...` |
| `ALLOWED_ORIGINS` | Orígenes permitidos CORS | `https://tu-front.onrender.com,https://ventify.app` |
| `EPPlusLicenseContext` | Licencia EPPlus | `NonCommercial` |

## Deploy Rápido en Render

### 1. Subir a GitHub
```bash
cd "C:\Users\torbe\Documents\A - Zona 30\Zona 30\ZONA 30 ANGULAR 20\VentifyAPI"
git init
git add .
git commit -m "Initial commit - Ventify API con IA"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/ventify-api.git
git push -u origin main
```

### 2. Base de datos MySQL en Render
- Ve a Render Dashboard → New → MySQL
- Plan: Free (1 GB, 90 días activa; después duerme si no usas)
- Copia el **Internal Connection String** y pégalo en `MYSQL_CONN`

### 3. API en Render
- New → Web Service → Connect GitHub repo
- Runtime: .NET
- Build: `dotnet restore && dotnet publish -c Release -o out`
- Start: `cd out && dotnet VentifyAPI.dll`
- Plan: **Free** (750 hrs/mes; duerme tras 15 min inactividad)
- Environment: añade las 5 variables arriba

### 4. Migraciones automáticas
La API ejecuta `db.Database.Migrate()` en `Program.cs` al iniciar; las tablas se crearán solas.

### 5. Frontend (Angular)
- Build: `cd FRONT && npm install && npm run build`
- Deploy: Render Static Site o Vercel/Netlify (gratis)
- Configura `environment.prod.ts`:
  ```
  apiBaseUrl: 'https://ventify-api.onrender.com'
  ```

## Endpoints IA

### Chat de ayuda
```http
POST /api/ai/chat
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "¿Cómo registro una merma?" }
  ]
}
```

Respuesta (0.5–1s con gpt-4o-mini):
```json
{ "message": "Para registrar una merma..." }
```

### Generar post para redes
```http
POST /api/ai/post-producto
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "productoId": 123,
  "plataforma": "instagram"
}
```

Respuesta:
```json
{ "copies": "Versión 1:\n...\n\nVersión 2:\n...\n\nVersión 3:\n..." }
```

## Seguridad

- API key de OpenRouter **NUNCA** en el frontend; sólo en backend.
- Prompt restrictivo: IA sólo habla de Ventify (POS, inventario, reportes); si preguntan otra cosa, responde "No tengo acceso...".
- Contexto por negocio: cada usuario sólo ve/modifica datos de su `negocio_id`.
- JWT con `HttpOnly` cookies y `TokenVersion` para invalidación.

## Costos

- **Render Free**: 750 hrs/mes API + 1 GB MySQL (gratis; duerme tras 15 min inactividad).
- **OpenRouter**: pay-as-you-go (~$0.0001–0.001 por consulta con modelos rápidos).
- **Frontend**: Vercel/Netlify gratis ilimitado.

Costo mensual estimado para 1 negocio: **$0–5 USD** (depende de uso de IA).

## Producción

Para plan pago (API siempre activa, DB persistente):
- Render Pro: $7/mes API + $7/mes MySQL (5 GB)
- Upgrade en Dashboard → Upgrade to Paid

## Soporte

- Docs: `VENTIFY_DOCUMENTACION.md`, `SECURITY_NOTES.md`
- IA integrada vía OpenRouter con prompt seguro
- Multi-tenant con filtros por negocio
