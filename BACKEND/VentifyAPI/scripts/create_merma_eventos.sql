-- Create table for merma audit events
-- MySQL/MariaDB
CREATE TABLE IF NOT EXISTS `merma_eventos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `producto_id` INT NOT NULL,
  `cantidad` INT NOT NULL,
  `motivo` VARCHAR(255) NULL,
  `usuario_id` INT NOT NULL,
  `negocio_id` INT NOT NULL,
  `fecha_utc` DATETIME NOT NULL,
  `stock_antes` INT NOT NULL,
  `stock_despues` INT NOT NULL,
  `merma_antes` INT NOT NULL,
  `merma_despues` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_merma_eventos_producto` (`producto_id`),
  INDEX `idx_merma_eventos_negocio_fecha` (`negocio_id`, `fecha_utc`),
  CONSTRAINT `fk_merma_eventos_producto`
    FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_merma_eventos_usuario`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
