# Uso de los scripts de reset

## 1. Por qué falló `SOURCE scripts/full-reset.sql`
El comando `SOURCE` solo funciona como comando interno del cliente CLI `mysql`. En MySQL Workbench (o editores gráficos) no se interpreta si lo escribes dentro de un script normal sin ruta absoluta o si el editor no soporta `SOURCE` directamente.

## 2. Formas correctas de ejecutar `full-reset.sql`
### Opción A: Abrir y ejecutar
1. En Workbench: File > Open SQL Script.
2. Selecciona `scripts/full-reset.sql`.
3. Presiona el ícono de rayo (Execute). Listo.

### Opción B: Línea de comandos (PowerShell)
Asegura que `mysql.exe` esté en PATH.
```powershell
$MYSQL_USER = "root"
$MYSQL_PASS = "TU_PASSWORD"  # o usa -p para que pida interactivo
$DB = "zona30"
mysql -u $MYSQL_USER -p $DB < "scripts/full-reset.sql"
```
(Te pedirá la contraseña si usas `-p` sin especificarla.)

### Opción C: Usar `SOURCE` correctamente
Dentro del cliente interactivo:
```sql
mysql -u root -p
USE zona30;
SOURCE C:/Users/torbe/Documents/A - Zona 30/Zona 30/ZONA 30 ANGULAR 20/VentifyAPI/scripts/full-reset.sql;
```
Nota: Usa la ruta absoluta con `/` o `\\` para evitar problemas con espacios.

## 3. Verificación posterior
Después de ejecutar:
```sql
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM negocios;
```
Ambos deberían devolver 0.

## 4. Flujo de reconstrucción
1. Ejecuta el backend (`dotnet run`).
2. Registra un nuevo dueño vía `POST /api/auth/register`.
3. El sistema crea automáticamente: usuario dueño + negocio asociado.

## 5. Reutilización de correos sin reset total
Usa `scripts/cleanup-reuse-email.sql` para liberar un correo puntual sin tocar ventas/productos.

## 6. Datos huérfanos
Si ves IDs (ej. ventas con negocio_id que ya no existe) se originan de haber desactivado `FOREIGN_KEY_CHECKS` en algún momento. Tras el reset completo esto se limpia.

## 7. Auto-increment opcional
Si quieres reiniciar los contadores:
```sql
ALTER TABLE usuarios AUTO_INCREMENT = 1;
ALTER TABLE negocios AUTO_INCREMENT = 1;
```
(No estrictamente necesario.)

## 8. Precauciones
- No ejecutes `full-reset.sql` en producción.
- Asegúrate de que nadie más esté escribiendo datos al mismo tiempo.
- Haz un dump previo si quieres conservar algo.

## 9. Problemas comunes
| Síntoma | Causa | Solución |
|--------|-------|----------|
| Error 1064 al usar SOURCE | Ejecutado en editor no compatible | Usa ruta absoluta en cliente CLI o abre el script y ejecútalo |
| FKs no se aplican | FOREIGN_KEY_CHECKS quedó en 0 | Ejecuta `SET FOREIGN_KEY_CHECKS = 1;` |
| Correo duplicado al registrar | Existe correo en `usuarios` | Ejecuta `cleanup-reuse-email.sql` o haz reset |

## 10. Siguientes pasos
Tras limpiar y registrar de nuevo: continuar con endpoints PDF y módulo descuentos.

---
Si necesitas un script de auditoría para detectar huérfanos antes de borrar avísame y lo agrego.
