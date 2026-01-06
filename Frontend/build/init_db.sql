-- Initialize Database script
-- MySQL initialization script for syncing with TypeORM entities

CREATE DATABASE IF NOT EXISTS cadastro;
USE cadastro;

SET FOREIGN_KEY_CHECKS = 0;

-- Users table
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint NOT NULL DEFAULT 0,
  `displayName` varchar(255) NULL,
  `photoPath` text NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Raw materials table
CREATE TABLE IF NOT EXISTS `materia_prima` (
  `id` varchar(36) NOT NULL,
  `num` int NOT NULL,
  `produto` varchar(30) NOT NULL DEFAULT 'Sem Produto',
  `medida` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_num` (`num`),
  INDEX `idx_produto` (`produto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports table (formulas and products)
CREATE TABLE IF NOT EXISTS `relatorio` (
  `id` varchar(36) NOT NULL,
  `Dia` varchar(10) NULL,
  `Hora` time NULL,
  `Nome` varchar(255) NULL,
  `Form1` int NOT NULL DEFAULT 0,
  `Form2` int NOT NULL DEFAULT 0,
  `Prod_1` int NOT NULL DEFAULT 0,
  `Prod_2` int NOT NULL DEFAULT 0,
  `Prod_3` int NOT NULL DEFAULT 0,
  `Prod_4` int NOT NULL DEFAULT 0,
  `Prod_5` int NOT NULL DEFAULT 0,
  `Prod_6` int NOT NULL DEFAULT 0,
  `Prod_7` int NOT NULL DEFAULT 0,
  `Prod_8` int NOT NULL DEFAULT 0,
  `Prod_9` int NOT NULL DEFAULT 0,
  `Prod_10` int NOT NULL DEFAULT 0,
  `Prod_11` int NOT NULL DEFAULT 0,
  `Prod_12` int NOT NULL DEFAULT 0,
  `Prod_13` int NOT NULL DEFAULT 0,
  `Prod_14` int NOT NULL DEFAULT 0,
  `Prod_15` int NOT NULL DEFAULT 0,
  `Prod_16` int NOT NULL DEFAULT 0,
  `Prod_17` int NOT NULL DEFAULT 0,
  `Prod_18` int NOT NULL DEFAULT 0,
  `Prod_19` int NOT NULL DEFAULT 0,
  `Prod_20` int NOT NULL DEFAULT 0,
  `Prod_21` int NOT NULL DEFAULT 0,
  `Prod_22` int NOT NULL DEFAULT 0,
  `Prod_23` int NOT NULL DEFAULT 0,
  `Prod_24` int NOT NULL DEFAULT 0,
  `Prod_25` int NOT NULL DEFAULT 0,
  `Prod_26` int NOT NULL DEFAULT 0,
  `Prod_27` int NOT NULL DEFAULT 0,
  `Prod_28` int NOT NULL DEFAULT 0,
  `Prod_29` int NOT NULL DEFAULT 0,
  `Prod_30` int NOT NULL DEFAULT 0,
  `Prod_31` int NOT NULL DEFAULT 0,
  `Prod_32` int NOT NULL DEFAULT 0,
  `Prod_33` int NOT NULL DEFAULT 0,
  `Prod_34` int NOT NULL DEFAULT 0,
  `Prod_35` int NOT NULL DEFAULT 0,
  `Prod_36` int NOT NULL DEFAULT 0,
  `Prod_37` int NOT NULL DEFAULT 0,
  `Prod_38` int NOT NULL DEFAULT 0,
  `Prod_39` int NOT NULL DEFAULT 0,
  `Prod_40` int NOT NULL DEFAULT 0,
  `Prod_41` int NOT NULL DEFAULT 0,
  `Prod_42` int NOT NULL DEFAULT 0,
  `Prod_43` int NOT NULL DEFAULT 0,
  `Prod_44` int NOT NULL DEFAULT 0,
  `Prod_45` int NOT NULL DEFAULT 0,
  `Prod_46` int NOT NULL DEFAULT 0,
  `Prod_47` int NOT NULL DEFAULT 0,
  `Prod_48` int NOT NULL DEFAULT 0,
  `Prod_49` int NOT NULL DEFAULT 0,
  `Prod_50` int NOT NULL DEFAULT 0,
  `Prod_51` int NOT NULL DEFAULT 0,
  `Prod_52` int NOT NULL DEFAULT 0,
  `Prod_53` int NOT NULL DEFAULT 0,
  `Prod_54` int NOT NULL DEFAULT 0,
  `Prod_55` int NOT NULL DEFAULT 0,
  `Prod_56` int NOT NULL DEFAULT 0,
  `Prod_57` int NOT NULL DEFAULT 0,
  `Prod_58` int NOT NULL DEFAULT 0,
  `Prod_59` int NOT NULL DEFAULT 0,
  `Prod_60` int NOT NULL DEFAULT 0,
  `Prod_61` int NOT NULL DEFAULT 0,
  `Prod_62` int NOT NULL DEFAULT 0,
  `Prod_63` int NOT NULL DEFAULT 0,
  `Prod_64` int NOT NULL DEFAULT 0,
  `Prod_65` int NOT NULL DEFAULT 0,
  `processedFile` text NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_dia` (`Dia`),
  INDEX `idx_nome` (`Nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Peanut weighing records
CREATE TABLE IF NOT EXISTS `amendoim` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(10) NOT NULL DEFAULT 'entrada',
  `dia` varchar(10) NOT NULL,
  `hora` varchar(8) NOT NULL,
  `codigoProduto` varchar(50) NULL,
  `codigoCaixa` varchar(50) NULL,
  `nomeProduto` varchar(255) NULL,
  `peso` decimal(10,3) NULL,
  `balanca` varchar(10) NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tipo_dia` (`tipo`, `dia`),
  INDEX `idx_dia_hora` (`dia`, `hora`),
  INDEX `idx_codigo_produto` (`codigoProduto`),
  UNIQUE KEY `unique_record` (`tipo`, `dia`, `hora`, `codigoProduto`, `peso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Peanut raw data (before processing)
CREATE TABLE IF NOT EXISTS `amendoim_raw` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(10) NOT NULL DEFAULT 'entrada',
  `dia` varchar(10) NOT NULL,
  `hora` varchar(8) NOT NULL,
  `codigoProduto` varchar(50) NULL,
  `codigoCaixa` varchar(50) NULL,
  `nomeProduto` varchar(255) NULL,
  `peso` decimal(10,3) NULL,
  `balanca` varchar(10) NULL,
  `sourceIhm` varchar(50) NULL,
  `rawLine` text NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_dia` (`dia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File batch processing
CREATE TABLE IF NOT EXISTS `batch` (
  `id` varchar(36) NOT NULL,
  `source` varchar(255) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `fileTimestamp` datetime NULL,
  `rowCount` int NOT NULL DEFAULT 0,
  `meta` json NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_source` (`source`),
  INDEX `idx_file_timestamp` (`fileTimestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Processed rows from batches
CREATE TABLE IF NOT EXISTS `row` (
  `id` varchar(36) NOT NULL,
  `batchId` varchar(36) NULL,
  `datetime` datetime NULL,
  `Nome` varchar(255) NULL,
  `Código Fórmula` int NULL,
  `Número Fórmula` int NULL,
  `values` text NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_datetime` (`datetime`),
  INDEX `idx_batch` (`batchId`),
  CONSTRAINT `fk_row_batch` FOREIGN KEY (`batchId`) REFERENCES `batch` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory table
CREATE TABLE IF NOT EXISTS `estoque` (
  `id` varchar(36) NOT NULL,
  `materia_prima_id` varchar(36) NOT NULL,
  `quantidade` decimal(10,3) NOT NULL DEFAULT 0,
  `quantidade_minima` decimal(10,3) NOT NULL DEFAULT 0,
  `quantidade_maxima` decimal(10,3) NOT NULL DEFAULT 0,
  `unidade` varchar(20) NOT NULL DEFAULT 'kg',
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `observacoes` text NULL,
  `localizacao` varchar(50) NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_materia_prima` (`materia_prima_id`),
  INDEX `idx_ativo` (`ativo`),
  CONSTRAINT `fk_estoque_materia` FOREIGN KEY (`materia_prima_id`) REFERENCES `materia_prima` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory movement history
CREATE TABLE IF NOT EXISTS `movimentacao_estoque` (
  `id` varchar(36) NOT NULL,
  `materia_prima_id` varchar(36) NOT NULL,
  `tipo` varchar(20) NOT NULL DEFAULT 'entrada',
  `quantidade` decimal(10,3) NOT NULL,
  `quantidade_anterior` decimal(10,3) NOT NULL,
  `quantidade_atual` decimal(10,3) NOT NULL,
  `unidade` varchar(20) NOT NULL DEFAULT 'kg',
  `documento_referencia` varchar(100) NULL,
  `responsavel` varchar(50) NULL,
  `observacoes` text NULL,
  `data_movimentacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_materia_prima` (`materia_prima_id`),
  INDEX `idx_tipo` (`tipo`),
  INDEX `idx_data` (`data_movimentacao`),
  CONSTRAINT `fk_mov_materia` FOREIGN KEY (`materia_prima_id`) REFERENCES `materia_prima` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File cache for change detection
CREATE TABLE IF NOT EXISTS `cache_file` (
  `id` varchar(36) NOT NULL,
  `originalName` varchar(255) NOT NULL,
  `lastHash` varchar(64) NULL,
  `lastSize` int NULL,
  `lastMTime` varchar(32) NULL,
  `lastRowDia` varchar(32) NULL,
  `lastRowHora` varchar(16) NULL,
  `lastRowTimestamp` varchar(40) NULL,
  `lastRowCount` int NULL,
  `lastProcessedAt` varchar(40) NULL,
  `ingestedRows` int NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_original_name` (`originalName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application settings (key-value store)
CREATE TABLE IF NOT EXISTS `setting` (
  `key` varchar(255) NOT NULL,
  `value` text NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Default data
INSERT IGNORE INTO `user` (`username`, `password`, `isAdmin`, `displayName`) 
VALUES ('admin', 'admin', 1, 'Administrador');

INSERT IGNORE INTO `setting` (`key`, `value`) VALUES 
  ('granja', 'Minha Granja'),
  ('proprietario', 'Proprietário'),
  ('ihm-config', '{"ip":"192.168.5.254","user":"","password":"","localCSV":"","metodoCSV":"1","habilitarCSV":false}'),
  ('amendoim-config', '{"ip":"","user":"anonymous","password":"","caminhoRemoto":"/InternalStorage/data/","duasIHMs":true}');