  -- MySQL Script generated by MySQL Workbench
  -- Tue Sep  5 09:23:29 2023
  -- Model: New Model    Version: 1.0
  -- MySQL Workbench Forward Engineering

  SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
  SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
  SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

  -- -----------------------------------------------------
  -- Schema bandeijao
  -- -----------------------------------------------------

  -- -----------------------------------------------------
  -- Schema bandeijao
  -- -----------------------------------------------------
  CREATE SCHEMA IF NOT EXISTS `bandeijao` ;
  USE `bandeijao` ;

  -- -----------------------------------------------------
  -- Table `bandeijao`.`curso`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `bandeijao`.`curso` (
    `id_curso` INT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(60) NOT NULL,
    `tempo` VARCHAR(60) NOT NULL,
    `modalidade` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`id_curso`))
  ENGINE = InnoDB;


  -- -----------------------------------------------------
  -- Table `bandeijao`.`usuario`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `bandeijao`.`usuario` (
    `cpf` VARCHAR(11) NOT NULL,
    `nome` VARCHAR(45) NOT NULL,
    `perfil` ENUM('adm','user') default 'user',
    `sobrenome` VARCHAR(100) NOT NULL,
    `matricula` VARCHAR(45) NOT NULL,
    `telefone` VARCHAR(11) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `caracteristica_alimenticia` ENUM('onivoro', 'vegetariano', 'vegano') NOT NULL,
    `curso_id_curso` INT NOT NULL,
    `senha` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`cpf`, `curso_id_curso`),
    INDEX `fk_usuario_curso_idx` (`curso_id_curso` ASC) ,
    CONSTRAINT `fk_usuario_curso`
      FOREIGN KEY (`curso_id_curso`)
      REFERENCES `bandeijao`.`curso` (`id_curso`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION)
  ENGINE = InnoDB;


  -- -----------------------------------------------------
  -- Table `bandeijao`.`restricao_alimentar`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `bandeijao`.`restricao_alimentar` (
    `id_restricao` INT NOT NULL AUTO_INCREMENT,
    `nome_restricao` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`id_restricao`))
  ENGINE = InnoDB;


  -- -----------------------------------------------------
  -- Table `bandeijao`.`cardapio`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `bandeijao`.`cardapio` (
    `id_cardapio` INT NOT NULL AUTO_INCREMENT,
    `dia` ENUM('segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira') NOT NULL,
    `imagem` TEXT NULL,
    `tipo` ENUM('onivoro', 'vegetariano', 'vegano') NOT NULL,
    `descricao` VARCHAR(100) NOT NULL,
    `valor` INT NOT NULL,
    PRIMARY KEY (`id_cardapio`))
  ENGINE = InnoDB;


  -- -----------------------------------------------------
  -- Table `bandeijao`.`pedido`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `bandeijao`.`pedido` (
    `id_pedido` INT NOT NULL AUTO_INCREMENT,
    `data_emissao` DATETIME NOT NULL,
    `pagamento` ENUM('pago', 'pendente') NOT NULL,
    `usuario_cpf` VARCHAR(11) NOT NULL,
    `ticket` ENUM('usado','desusado') default 'desusado',
    `usuario_curso_id_curso` INT NOT NULL,
    `cardapio_id_cardapio` INT NOT NULL,
    `observacao` VARCHAR(255) NULL,
    PRIMARY KEY (`id_pedido`, `usuario_cpf`, `usuario_curso_id_curso`, `cardapio_id_cardapio`),
    INDEX `fk_pedido_usuario1_idx` (`usuario_cpf` ASC, `usuario_curso_id_curso` ASC) ,
    INDEX `fk_pedido_cardapio1_idx` (`cardapio_id_cardapio` ASC) ,
    CONSTRAINT `fk_pedido_usuario1`
      FOREIGN KEY (`usuario_cpf` , `usuario_curso_id_curso`)
      REFERENCES `bandeijao`.`usuario` (`cpf` , `curso_id_curso`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    CONSTRAINT `fk_pedido_cardapio1`
      FOREIGN KEY (`cardapio_id_cardapio`)
      REFERENCES `bandeijao`.`cardapio` (`id_cardapio`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION)
  ENGINE = InnoDB;


  -- -----------------------------------------------------
  -- Table `bandeijao`.`alimento`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `bandeijao`.`alimento` (
    `id_alimento` INT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(45) NOT NULL,
    `unidade` VARCHAR(45) NOT NULL,
    `valor_nutricional` VARCHAR(45) NULL,
    PRIMARY KEY (`id_alimento`))
  ENGINE = InnoDB;


  -- -----------------------------------------------------
  -- Table `bandeijao`.`usuario_has_restricao_alimentar`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `bandeijao`.`usuario_has_restricao_alimentar` (
    `usuario_cpf` VARCHAR(11) NOT NULL,
    `usuario_curso_id_curso` INT NOT NULL,
    `restricao_alimentar_id_restricao` INT NOT NULL,
    PRIMARY KEY (`usuario_cpf`, `usuario_curso_id_curso`, `restricao_alimentar_id_restricao`),
    INDEX `fk_usuario_has_restricao_alimentar_restricao_alimentar1_idx` (`restricao_alimentar_id_restricao` ASC) ,
    INDEX `fk_usuario_has_restricao_alimentar_usuario1_idx` (`usuario_cpf` ASC, `usuario_curso_id_curso` ASC) ,
    CONSTRAINT `fk_usuario_has_restricao_alimentar_usuario1`
      FOREIGN KEY (`usuario_cpf` , `usuario_curso_id_curso`)
      REFERENCES `bandeijao`.`usuario` (`cpf` , `curso_id_curso`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    CONSTRAINT `fk_usuario_has_restricao_alimentar_restricao_alimentar1`
      FOREIGN KEY (`restricao_alimentar_id_restricao`)
      REFERENCES `bandeijao`.`restricao_alimentar` (`id_restricao`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION)
  ENGINE = InnoDB;


  -- -----------------------------------------------------
  -- Table `bandeijao`.`cardapio_has_alimento`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `bandeijao`.`cardapio_has_alimento` (
    `cardapio_id_cardapio` INT NOT NULL,
    `alimento_id_alimento` INT NOT NULL,
    PRIMARY KEY (`cardapio_id_cardapio`, `alimento_id_alimento`),
    INDEX `fk_cardapio_has_alimento_alimento1_idx` (`alimento_id_alimento` ASC) ,
    INDEX `fk_cardapio_has_alimento_cardapio1_idx` (`cardapio_id_cardapio` ASC) ,
    CONSTRAINT `fk_cardapio_has_alimento_cardapio1`
      FOREIGN KEY (`cardapio_id_cardapio`)
      REFERENCES `bandeijao`.`cardapio` (`id_cardapio`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    CONSTRAINT `fk_cardapio_has_alimento_alimento1`
      FOREIGN KEY (`alimento_id_alimento`)
      REFERENCES `bandeijao`.`alimento` (`id_alimento`)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION)
  ENGINE = InnoDB;


  -- -----------------------------------------------------
  -- Table `bandeijao`.`mensagem`
  -- -----------------------------------------------------
  CREATE TABLE IF NOT EXISTS `bandeijao`.`mensagem` (
    `id_mensagem` INT NOT NULL AUTO_INCREMENT,
    `assunto` VARCHAR(100) NOT NULL,
    `mensagem` TEXT NOT NULL,
    `usuario_cpf` VARCHAR(11) NOT NULL,
    `usuario_curso_id_curso` INT NOT NULL,
    PRIMARY KEY (`id_mensagem`, `usuario_cpf`, `usuario_curso_id_curso`),
    INDEX `fk_Mensagem_usuario1_idx` (`usuario_cpf` ASC, `usuario_curso_id_curso` ASC),
    CONSTRAINT `fk_Mensagem_usuario1`
      FOREIGN KEY (`usuario_cpf` , `usuario_curso_id_curso`)
      REFERENCES `bandeijao`.`usuario` (`cpf` , `curso_id_curso`)
      ON DELETE NO ACTION
      ON UPDATE CASCADE  
  )
  ENGINE = InnoDB;


  SET SQL_MODE=@OLD_SQL_MODE;
  SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
  SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
