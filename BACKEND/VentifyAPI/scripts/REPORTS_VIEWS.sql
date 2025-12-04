-- SQL Views for reports (MySQL)

-- Ventas por día (total y conteo)
CREATE OR REPLACE VIEW `vw_ventas_por_dia` AS
SELECT DATE(`fecha_hora`) AS `dia`, `negocio_id`, COUNT(*) AS `ventas_count`, SUM(`total_pagado`) AS `total_pagado`
FROM `ventas`
GROUP BY `negocio_id`, DATE(`fecha_hora`);

-- Ventas por mes (total y conteo)
CREATE OR REPLACE VIEW `vw_ventas_por_mes` AS
SELECT DATE_FORMAT(`fecha_hora`, '%Y-%m-01') AS `mes`, `negocio_id`, COUNT(*) AS `ventas_count`, SUM(`total_pagado`) AS `total_pagado`
FROM `ventas`
GROUP BY `negocio_id`, DATE_FORMAT(`fecha_hora`, '%Y-%m-01');

-- Ventas por año (total y conteo)
CREATE OR REPLACE VIEW `vw_ventas_por_anio` AS
SELECT DATE_FORMAT(`fecha_hora`, '%Y-01-01') AS `anio`, `negocio_id`, COUNT(*) AS `ventas_count`, SUM(`total_pagado`) AS `total_pagado`
FROM `ventas`
GROUP BY `negocio_id`, DATE_FORMAT(`fecha_hora`, '%Y-01-01');

-- Inventario resumen por categoría
CREATE OR REPLACE VIEW `vw_inventario_por_categoria` AS
SELECT p.`category_id`, c.`name` AS `categoria`, u.`negocio_id`,
       COUNT(p.`id`) AS `productos_count`,
       SUM(p.`stock_actual`) AS `stock_total`,
       SUM(p.`cantidad_inicial`) AS `cantidad_inicial_total`,
       SUM(p.`merma`) AS `merma_total`
FROM `productos` p
LEFT JOIN `categories` c ON p.`category_id` = c.`id`
INNER JOIN `usuarios` u ON p.`usuario_id` = u.`id`
WHERE p.`activo` = 1
GROUP BY u.`negocio_id`, p.`category_id`, c.`name`;

-- Productos con stock bajo
CREATE OR REPLACE VIEW `vw_productos_stock_bajo` AS
SELECT p.`id`, p.`nombre`, p.`stock_actual`, p.`stock_minimo`, u.`negocio_id`
FROM `productos` p
INNER JOIN `usuarios` u ON p.`usuario_id` = u.`id`
WHERE p.`activo` = 1 AND p.`stock_actual` <= p.`stock_minimo`;
