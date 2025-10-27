-- Initialize Database script for Cortez
-- This script will create all necessary tables and initial data

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS cadastro;
USE cadastro;

-- Safety check: if any of our tables exist, stop execution
-- This prevents overwriting existing data
DELIMITER //
CREATE PROCEDURE check_tables_exist()
BEGIN
    DECLARE table_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO table_exists
    FROM information_schema.tables 
    WHERE table_schema = 'cadastro'
    AND table_name IN ('user', 'materia_prima', 'relatorio', 'row', 'batch', 'estoque', 'movimentacao_estoque', 'cache_file', 'setting');
    
    IF table_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Database tables already exist. Skipping initialization.';
    END IF;
END //
DELIMITER ;

CALL check_tables_exist();
DROP PROCEDURE check_tables_exist;

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
  `processedFile` varchar(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

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