-- full-reset.sql
-- Limpia datos de negocio manteniendo estructura de migraciones.
-- ATENCIÓN: Ejecuta SOLO en entorno de desarrollo.
-- Pasos:
-- 1. Desactiva FKs.
-- 2. Elimina datos dependientes (detalle ventas -> ventas -> cajas -> productos -> variantes -> clientes -> proveedores -> refresh tokens -> puntos de venta).
-- 3. Elimina usuarios y negocios al final para permitir recrear dueños limpias.
-- 4. Reactiva FKs.
-- 5. Verificaciones finales.
-- No toca __EFMigrationsHistory (mantiene migraciones aplicadas).

SET FOREIGN_KEY_CHECKS = 0;

-- Elimina tablas con posible relación circular primero detalle -> padre
DELETE FROM detalles_venta;
DELETE FROM ventas;
DELETE FROM cajas; -- si se desea conservar historial comenta esta línea
DELETE FROM variantes_producto;
DELETE FROM productos;
DELETE FROM categories; -- si se quieren conservar categorías, comentar
DELETE FROM clientes;
DELETE FROM proveedores;
DELETE FROM refresh_tokens;
DELETE FROM puntos_de_venta;

-- Finalmente entidades raíz
DELETE FROM usuarios;
DELETE FROM negocios;

SET FOREIGN_KEY_CHECKS = 1;

-- Verificaciones
SELECT COUNT(*) AS usuarios_restantes FROM usuarios;
SELECT COUNT(*) AS negocios_restantes FROM negocios;
SELECT COUNT(*) AS productos_restantes FROM productos;
SELECT COUNT(*) AS ventas_restantes FROM ventas;

-- Después de esto: usar endpoint /api/auth/register para crear nuevo dueño.
-- Si necesitas un dueño semilla rápido manualmente, puedes insertar y luego actualizar negocio_id.
-- Pero preferible usar flujo normal de registro (crea negocio y asocia owner).


