CREATE DATABASE  IF NOT EXISTS `ventify` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ventify`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ventify
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__efmigrationshistory`
--

LOCK TABLES `__efmigrationshistory` WRITE;
/*!40000 ALTER TABLE `__efmigrationshistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `__efmigrationshistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cajas`
--

DROP TABLE IF EXISTS `cajas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cajas` (
  `id_caja` int NOT NULL AUTO_INCREMENT,
  `negocio_id` int NOT NULL,
  `usuario_apertura_id` int NOT NULL,
  `fecha_apertura` datetime(6) NOT NULL,
  `monto_inicial` decimal(10,2) NOT NULL,
  `monto_actual` decimal(10,2) NOT NULL,
  `abierta` tinyint(1) NOT NULL,
  `fecha_cierre` datetime(6) DEFAULT NULL,
  `monto_cierre` decimal(10,2) DEFAULT NULL,
  `resumen_cierre` text,
  `usuario_cierre_id` int DEFAULT NULL,
  `abierta_por` varchar(150) DEFAULT NULL,
  `turno` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_caja`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cajas`
--

LOCK TABLES `cajas` WRITE;
/*!40000 ALTER TABLE `cajas` DISABLE KEYS */;
INSERT INTO `cajas` VALUES (1,3,4,'2025-12-04 07:39:16.181475',500.00,500.00,1,NULL,NULL,NULL,NULL,'juan','General');
/*!40000 ALTER TABLE `cajas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `usuario_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalles_venta`
--

DROP TABLE IF EXISTS `detalles_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalles_venta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venta_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `variante_producto_id` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_detalles_venta_ventas_venta_id` (`venta_id`),
  KEY `FK_detalles_venta_productos_producto_id` (`producto_id`),
  KEY `FK_detalles_venta_variantes_producto_variante_producto_id` (`variante_producto_id`),
  CONSTRAINT `FK_detalles_venta_productos_producto_id` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_detalles_venta_variantes_producto_variante_producto_id` FOREIGN KEY (`variante_producto_id`) REFERENCES `variantes_producto` (`id`),
  CONSTRAINT `FK_detalles_venta_ventas_venta_id` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalles_venta`
--

LOCK TABLES `detalles_venta` WRITE;
/*!40000 ALTER TABLE `detalles_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalles_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `merma_eventos`
--

DROP TABLE IF EXISTS `merma_eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `merma_eventos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `motivo` text NOT NULL,
  `usuario_id` int NOT NULL,
  `negocio_id` int NOT NULL,
  `fecha_utc` datetime(6) NOT NULL,
  `stock_antes` int NOT NULL,
  `stock_despues` int NOT NULL,
  `merma_antes` int NOT NULL,
  `merma_despues` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `merma_eventos`
--

LOCK TABLES `merma_eventos` WRITE;
/*!40000 ALTER TABLE `merma_eventos` DISABLE KEYS */;
/*!40000 ALTER TABLE `merma_eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_caja`
--

DROP TABLE IF EXISTS `movimientos_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `caja_id` int NOT NULL,
  `negocio_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `fecha_hora` datetime(6) NOT NULL,
  `saldo_despues` decimal(10,2) NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_caja`
--

LOCK TABLES `movimientos_caja` WRITE;
/*!40000 ALTER TABLE `movimientos_caja` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `negocios`
--

DROP TABLE IF EXISTS `negocios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `negocios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_negocio` varchar(150) NOT NULL,
  `creado_en` datetime(6) NOT NULL,
  `Correo` varchar(100) DEFAULT NULL,
  `Direccion` varchar(255) DEFAULT NULL,
  `GiroComercial` varchar(100) DEFAULT NULL,
  `RFC` varchar(20) DEFAULT NULL,
  `Telefono` varchar(30) DEFAULT NULL,
  `ColorAcento` varchar(20) DEFAULT NULL,
  `ColorFondo` varchar(20) DEFAULT NULL,
  `ColorPrimario` varchar(20) DEFAULT NULL,
  `ColorSecundario` varchar(20) DEFAULT NULL,
  `ModoOscuro` tinyint(1) NOT NULL DEFAULT '0',
  `owner_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `negocios`
--

LOCK TABLES `negocios` WRITE;
/*!40000 ALTER TABLE `negocios` DISABLE KEYS */;
INSERT INTO `negocios` VALUES (1,'pepe pepe - Negocio','2025-12-04 07:00:40.668952',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1),(2,'el pepe y ete sehc - Negocio','2025-12-04 07:05:16.783653',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,2),(3,'bebeton dominguez - Negocio','2025-12-04 07:08:51.876589',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,3);
/*!40000 ALTER TABLE `negocios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text,
  `precio_compra` decimal(10,2) NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `subcategoria` varchar(100) DEFAULT NULL,
  `stock_actual` int NOT NULL,
  `stock_minimo` int NOT NULL,
  `unidad_medida` varchar(30) DEFAULT NULL,
  `codigo_barras` varchar(50) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `fecha_registro` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `category_id` int DEFAULT NULL,
  `usuario_id` int NOT NULL DEFAULT '0',
  `cantidad_inicial` int NOT NULL DEFAULT '0',
  `merma` int NOT NULL DEFAULT '0',
  `descuento_fecha_fin` datetime(6) DEFAULT NULL,
  `descuento_fecha_inicio` datetime(6) DEFAULT NULL,
  `descuento_hora_fin` time(6) DEFAULT NULL,
  `descuento_hora_inicio` time(6) DEFAULT NULL,
  `descuento_porcentaje` decimal(5,2) DEFAULT NULL,
  `negocio_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_productos_usuarios_usuario_id` (`usuario_id`),
  KEY `FK_productos_categories_category_id` (`category_id`),
  CONSTRAINT `FK_productos_categories_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_productos_usuarios_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `negocio_id` int DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puntos_de_venta`
--

DROP TABLE IF EXISTS `puntos_de_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puntos_de_venta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_punto` varchar(150) NOT NULL,
  `negocio_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puntos_de_venta`
--

LOCK TABLES `puntos_de_venta` WRITE;
/*!40000 ALTER TABLE `puntos_de_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `puntos_de_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` text NOT NULL,
  `usuario_id` int NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_RefreshTokens_UsuarioId` (`usuario_id`),
  CONSTRAINT `FK_refresh_tokens_usuarios_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,'jKXkVxMmaUa4yqT1CfGydQ==.5+lM4JargEmnoZvFcxhHJQ==',3,'2026-01-03 07:08:52.158549',0),(2,'Rl27XaHczUiqyW/WK7lliQ==.F07eqvdBA02aK9TGe34Hfw==',4,'2026-01-03 07:14:38.762563',0),(3,'fnteSkXN00+ci3QClPkDxg==.Wr7bgbeB5UyAFm5D+JJ2pg==',4,'2026-01-03 07:17:47.114777',0),(4,'qHxTBwsBVUmFIy4onqZsAA==.2I63A2QxCkydQPpNzX9Ctg==',3,'2026-01-03 07:38:25.250000',0),(5,'Z8kuLqlvIkaxhPZOnKEioA==.uyY6ttRvU0uSG/ZVwYkOKQ==',4,'2026-01-03 07:39:01.008680',0),(6,'1VEkmLNYpEKYhMrJQrpMAw==.MjXxeyNhS0CIb1pnPo34fg==',5,'2026-01-03 07:45:36.591572',0);
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refreshtokens`
--

DROP TABLE IF EXISTS `refreshtokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refreshtokens` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Token` text NOT NULL,
  `UsuarioId` int NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `Revoked` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_RefreshTokens_UsuarioId` (`UsuarioId`),
  CONSTRAINT `FK_RefreshTokens_usuarios_UsuarioId` FOREIGN KEY (`UsuarioId`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refreshtokens`
--

LOCK TABLES `refreshtokens` WRITE;
/*!40000 ALTER TABLE `refreshtokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refreshtokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `negocio_id` int DEFAULT NULL,
  `rol` varchar(50) NOT NULL DEFAULT 'dueño',
  `creado_en` datetime(6) NOT NULL,
  `Apellido1` varchar(100) DEFAULT NULL,
  `Apellido2` varchar(100) DEFAULT NULL,
  `SueldoDiario` decimal(10,2) DEFAULT NULL,
  `Telefono` varchar(30) DEFAULT NULL,
  `FechaIngreso` datetime(6) DEFAULT NULL,
  `NumeroSeguroSocial` varchar(30) DEFAULT NULL,
  `Puesto` varchar(100) DEFAULT NULL,
  `RFC` varchar(20) DEFAULT NULL,
  `FotoPerfil` varchar(255) DEFAULT NULL,
  `TokenVersion` int NOT NULL DEFAULT '0',
  `primer_acceso` tinyint(1) NOT NULL DEFAULT '0',
  `PermisosExtra` text,
  `PermisosExtraAsignadoPor` int DEFAULT NULL,
  `PermisosExtraFecha` datetime(6) DEFAULT NULL,
  `PermisosExtraNota` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `IX_usuarios_negocio_id` (`negocio_id`),
  CONSTRAINT `FK_usuarios_negocios_negocio_id` FOREIGN KEY (`negocio_id`) REFERENCES `negocios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'pepe pepe','elpepe@gmail.com','$2a$11$krG0wmEVWl..Ya5pPmN7S.h3kq5TGpGrY5Z45USj4YvqVc7b2tQnC',1,'dueño','2025-12-04 01:00:39.412643',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL),(2,'el pepe y ete sehc','etesech@gmail.com','$2a$11$in9xlMhYbkY5ugaKYix3qeg9ZX4dg6cXsv/spZxikjZ1JHgGpOTQe',2,'dueño','2025-12-04 01:05:15.474518',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL),(3,'bebeton dominguez','bebeton@gmail.com','$2a$11$gXfKbB9tyeuDzX27o8Af8eK0isPWxEMjZmAJr6U2fdyyBLFES/G5S',3,'dueño','2025-12-04 01:08:50.640825',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,NULL,NULL,NULL,NULL),(4,'juan','perez.garcia@negocio3.local','$2a$11$Qu.Qe.EEhCv6zLKcqjkDsu/otGspZfeXfKWWV3SVNU0OqqeqhzW2W',3,'Gerente','2025-12-04 01:13:58.976727','perez','Garcia',500.00,'6658548558','2025-12-04 00:00:00.000000','88057348750','Gerente de negocio','PEGJ050712H56',NULL,0,0,NULL,NULL,NULL,NULL),(5,'MARIA','perez.lerma@negocio3.local','$2a$11$gH6UQyq.vz0Ppsp4RYgEWOCoyuLgacYrWsAp9vIspBep.YUtkB3EO',3,'empleado','2025-12-04 01:45:10.175940','PEREZ','LERMA',300.00,'0234240920','2025-12-04 00:00:00.000000','35346346346','Almacenista','PELM020112V39',NULL,0,0,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variantes_producto`
--

DROP TABLE IF EXISTS `variantes_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variantes_producto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_variantes_producto_productos_producto_id` (`producto_id`),
  CONSTRAINT `FK_variantes_producto_productos_producto_id` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variantes_producto`
--

LOCK TABLES `variantes_producto` WRITE;
/*!40000 ALTER TABLE `variantes_producto` DISABLE KEYS */;
/*!40000 ALTER TABLE `variantes_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `negocio_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `total_pagado` decimal(10,2) NOT NULL,
  `forma_pago` varchar(50) NOT NULL,
  `fecha_hora` datetime(6) NOT NULL,
  `ticket` text,
  `cambio` decimal(10,2) DEFAULT NULL,
  `monto_recibido` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ventify'
--

--
-- Dumping routines for database 'ventify'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-04  2:18:34
