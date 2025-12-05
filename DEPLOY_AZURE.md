# Ventify: Checklist y Guía de Despliegue en Azure

## 1. Base de datos MySQL en Azure (Gratis)
- Ve a Azure Portal > Crear recurso > Base de datos MySQL flexible server (puedes usar el tier gratuito)
- Crea la base de datos y usuario, anota la cadena de conexión (formato: `Server=...;Port=...;Database=...;User=...;Password=...;`)
- Importa tu backup usando Azure Data Studio o el portal (usa el archivo `db-backup/ventify DB.sql`)

## 2. Variables de entorno necesarias
Configura estas variables en Azure App Service o Container Apps:
- `MYSQL_CONN`: Cadena de conexión MySQL de Azure
- `JWT_SECRET`: Clave secreta para JWT (genera una nueva y guárdala segura)
- `ALLOWED_ORIGINS`: URL de tu frontend en Azure (ejemplo: `https://ventify-frontend.azurewebsites.net`)

## 3. Backend VentifyAPI (Docker)
- Sube el contenido de `BACKEND/VentifyAPI` a un repositorio (GitHub recomendado)
- Azure App Service/Container Apps detecta el Dockerfile automáticamente
- Configura las variables de entorno en el portal

## 4. Frontend Angular (Docker)
- Sube el contenido de `FRONTEND/FRONT` a un repositorio
- Azure App Service/Container Apps detecta el Dockerfile automáticamente
- Configura la variable de entorno para la URL de la API en `environment.prod.ts` si es necesario

## 5. Despliegue
- Crea los recursos en Azure (App Service o Container Apps)
- Conecta tu repositorio y habilita CI/CD si lo deseas
- Verifica que ambos servicios estén corriendo y conectados a la base de datos

## 6. Seguridad y buenas prácticas
- Nunca subas contraseñas ni secretos al código
- Usa variables de entorno para todo dato sensible
- Revisa los logs en Azure Portal para monitorear errores

## 7. Recursos útiles
- [Documentación Azure App Service](https://learn.microsoft.com/es-es/azure/app-service/)
- [Documentación Azure MySQL](https://learn.microsoft.com/es-es/azure/mysql/)

---

¿Dudas? Revisa este archivo o contacta soporte Azure. ¡Listo para la nube!
