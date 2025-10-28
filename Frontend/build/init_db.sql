-- Initialize Database script for Cortez
-- MySQL initialization script

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS cadastro;
USE cadastro;

-- Disable foreign key checks during setup
SET FOREIGN_KEY_CHECKS = 0;

-- Create tables
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint NOT NULL DEFAULT '0',
  `displayName` varchar(255) NULL,
  `photoPath` text NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`username`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `materia_prima` (
  `id` varchar(36) NOT NULL,
  `num` int NOT NULL,
  `produto` varchar(30) NOT NULL DEFAULT 'Sem Produto',
  `medida` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`num`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `relatorio` (
  `id` varchar(36) NOT NULL,
  `Dia` varchar(10) NULL,
  `Hora` time NULL,
  `Nome` varchar(30) NULL,
  `Form1` int NOT NULL DEFAULT 0,
  `Form2` int NOT NULL DEFAULT 0,
  Prod_1 INTEGER NOT NULL DEFAULT 0,
  Prod_2 INTEGER NOT NULL DEFAULT 0,
  Prod_3 INTEGER NOT NULL DEFAULT 0,
  Prod_4 INTEGER NOT NULL DEFAULT 0,
  Prod_5 INTEGER NOT NULL DEFAULT 0,
  Prod_6 INTEGER NOT NULL DEFAULT 0,
  Prod_7 INTEGER NOT NULL DEFAULT 0,
  Prod_8 INTEGER NOT NULL DEFAULT 0,
  Prod_9 INTEGER NOT NULL DEFAULT 0,
  Prod_10 INTEGER NOT NULL DEFAULT 0,
  Prod_11 INTEGER NOT NULL DEFAULT 0,
  Prod_12 INTEGER NOT NULL DEFAULT 0,
  Prod_13 INTEGER NOT NULL DEFAULT 0,
  Prod_14 INTEGER NOT NULL DEFAULT 0,
  Prod_15 INTEGER NOT NULL DEFAULT 0,
  Prod_16 INTEGER NOT NULL DEFAULT 0,
  Prod_17 INTEGER NOT NULL DEFAULT 0,
  Prod_18 INTEGER NOT NULL DEFAULT 0,
  Prod_19 INTEGER NOT NULL DEFAULT 0,
  Prod_20 INTEGER NOT NULL DEFAULT 0,
  Prod_21 INTEGER NOT NULL DEFAULT 0,
  Prod_22 INTEGER NOT NULL DEFAULT 0,
  Prod_23 INTEGER NOT NULL DEFAULT 0,
  Prod_24 INTEGER NOT NULL DEFAULT 0,
  Prod_25 INTEGER NOT NULL DEFAULT 0,
  Prod_26 INTEGER NOT NULL DEFAULT 0,
  Prod_27 INTEGER NOT NULL DEFAULT 0,
  Prod_28 INTEGER NOT NULL DEFAULT 0,
  Prod_29 INTEGER NOT NULL DEFAULT 0,
  Prod_30 INTEGER NOT NULL DEFAULT 0,
  Prod_31 INTEGER NOT NULL DEFAULT 0,
  Prod_32 INTEGER NOT NULL DEFAULT 0,
  Prod_33 INTEGER NOT NULL DEFAULT 0,
  Prod_34 INTEGER NOT NULL DEFAULT 0,
  Prod_35 INTEGER NOT NULL DEFAULT 0,
  Prod_36 INTEGER NOT NULL DEFAULT 0,
  Prod_37 INTEGER NOT NULL DEFAULT 0,
  Prod_38 INTEGER NOT NULL DEFAULT 0,
  Prod_39 INTEGER NOT NULL DEFAULT 0,
  Prod_40 INTEGER NOT NULL DEFAULT 0,
  processedFile TEXT
);

CREATE TABLE IF NOT EXISTS `batch` (
  `id` varchar(36) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `processedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `estoque` (
  `id` varchar(36) NOT NULL,
  `produto` varchar(255) NOT NULL,
  `quantidade` decimal(10,2) NOT NULL DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `movimentacao_estoque` (
  `id` varchar(36) NOT NULL,
  `produto` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `quantidade` decimal(10,2) NOT NULL,
  `data` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `cache_file` (
  `id` varchar(36) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `processedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `filename` (`filename`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `setting` (
  `id` varchar(36) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB;

-- Add default settings
INSERT IGNORE INTO `setting` (`id`, `key`, `value`) VALUES
  ('1', 'app_version', '1.2.0-beta'),
  ('2', 'first_run', 'true'),
  ('3', 'theme', 'light');

-- Add default admin user if no users exist
INSERT IGNORE INTO `user` (`username`, `password`, `isAdmin`, `displayName`) 
VALUES ('admin', 'admin', 1, 'Administrador');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS `batch` (
  `id` varchar(36) NOT NULL,
  `source` varchar(255) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `fileTimestamp` datetime NULL,
  `rowCount` int NOT NULL DEFAULT 0,
  `meta` text NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `row` (
  `id` varchar(36) NOT NULL,
  `batchId` varchar(36) NULL,
  `datetime` datetime NULL,
  `Nome` varchar(255) NULL,
  `Código Fórmula` int NULL,
  `Número Fórmula` int NULL,
  `values` text NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_row_batch` FOREIGN KEY (`batchId`) REFERENCES `batch` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

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
  CONSTRAINT `fk_estoque_materia` FOREIGN KEY (`materia_prima_id`) REFERENCES `materia_prima` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

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
  CONSTRAINT `fk_mov_materia` FOREIGN KEY (`materia_prima_id`) REFERENCES `materia_prima` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

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
  UNIQUE KEY (`originalName`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `setting` (
  `key` varchar(255) NOT NULL,
  `value` text NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB;

-- Insert default admin user if not exists
INSERT IGNORE INTO `user` (`username`, `password`, `isAdmin`, `displayName`) 
VALUES ('admin', 'admin', 1, 'Administrador');

-- Insert some default settings
INSERT IGNORE INTO `setting` (`key`, `value`) 
VALUES 
  ('granja', 'Minha Granja'),
  ('proprietario', 'Proprietário'),
  ('db-config', '{"serverDB":"localhost","port":"3306","userDB":"root","passwordDB":"root","database":"cadastro"}'),
  ('ihm-config', '{"ip":"192.168.5.254","user":"","password":"","localCSV":"","metodoCSV":"1","habilitarCSV":false}');