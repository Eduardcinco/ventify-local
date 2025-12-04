-- Uso: edita la variable @email con el correo a liberar
-- Efecto: renombra el correo existente agregando un sufijo de timestamp
--         y limpia sus refresh tokens. No borra ventas/negocio ni otros datos.

START TRANSACTION;

SET @email = 'kev@gmail.com'; -- <==== CAMBIA AQUÍ EL CORREO A LIBERAR

SELECT id INTO @uid FROM usuarios WHERE correo = @email LIMIT 1;

-- Si no existe, no hace nada
SET @ts = DATE_FORMAT(NOW(), '%Y%m%d%H%i%s');
UPDATE usuarios
SET correo = CONCAT(@email, '.old-', @ts)
WHERE id = @uid;

-- Limpia refresh tokens del usuario para evitar sesiones huérfanas
DELETE FROM refresh_tokens WHERE usuario_id = @uid;

COMMIT;

-- Verifica el resultado
SELECT id, nombre, correo FROM usuarios WHERE id = @uid;