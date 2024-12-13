
--Scripts de criação de banco de dados e tabelas
DROP DATABASE IF EXISTS contasegodb;
CREATE DATABASE contasegodb;

CREATE TABLE empresa (
    cnpj VARCHAR(14) PRIMARY KEY,
    razao_social VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone1 VARCHAR(20),
    telefone2 VARCHAR(20),
    data_criacao DATE
);

CREATE TABLE pessoa (
    cpf VARCHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    telefone_principal VARCHAR(20),
    telefone_secundario VARCHAR(20),
    data_ultimo_login TIMESTAMP,
    ultima_empresa_acessada VARCHAR(14) REFERENCES empresa(cnpj),
    alterar_senha BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE permissao (
    sigla_permissao VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT
);

CREATE TABLE cargo (
    sigla_cargo VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE cargo_permissao (
    sigla_cargo VARCHAR(20),
    sigla_permissao VARCHAR(20),
    PRIMARY KEY (sigla_cargo, sigla_permissao),
    FOREIGN KEY (sigla_cargo) REFERENCES cargo(sigla_cargo),
    FOREIGN KEY (sigla_permissao) REFERENCES permissao(sigla_permissao)
);

CREATE TABLE contrato (
    cpf_pessoa VARCHAR(11),
    cnpj_empresa VARCHAR(14),
    sigla_cargo VARCHAR(20) NOT NULL,
    data_contrato DATE,
    PRIMARY KEY (cpf_pessoa, cnpj_empresa),
    FOREIGN KEY (cpf_pessoa) REFERENCES pessoa(cpf),
    FOREIGN KEY (cnpj_empresa) REFERENCES empresa(cnpj),
    FOREIGN KEY (sigla_cargo) REFERENCES cargo(sigla_cargo)
);


-- Criação de usuario de banco para utilizar na aplicação.
CREATE USER contasego_user WITH PASSWORD 'contasego123';
GRANT CONNECT ON DATABASE contasegodb TO contasego_user;
GRANT USAGE ON SCHEMA public TO contasego_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO contasego_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO contasego_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO contasego_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO contasego_user;

-- Scripts de população inicial. Lembrando de após criar conta solicitar alteração de senha.
INSERT INTO cargo (sigla_cargo, nome) VALUES
('ADS', 'Administrador do sistema');

INSERT INTO permissao (sigla_permissao, nome, descricao) VALUES
('ADM', 'Super Admin', 'Permissões de gerenciamento do sistema'),
('DF', 'Departamento Fiscal', 'Permissões de acesso a dados do fiscal'),
('DP', 'Departamento pessoal', 'Permissões de dados do departamento pessoal');

INSERT INTO cargo_permissao (sigla_cargo, sigla_permissao) VALUES
('ADS', 'ADM'),
('ADS', 'DF'),
('ADS', 'DP');

INSERT INTO empresa (cnpj, razao_social, email, data_criacao) VALUES
('12345678000199', 'Empresa Teste LTDA', 'contato@empresateste.com.br', CURRENT_DATE);

INSERT INTO pessoa (cpf, nome, email, senha, data_nascimento, alterar_senha) VALUES
('12345678901', 'Administrador Sistema', 
'seu@e-mail.com.br', -- adicionar um e-mail no qual você tem acesso para funcionar a troca de senha
'senha temporaria', -- para a senha funcionar deve solicitar nova senha para a aplicação.
'1990-01-01', true);

INSERT INTO contrato (cpf_pessoa, cnpj_empresa, sigla_cargo, data_contrato) VALUES
('12345678901', '12345678000199', 'ADS', CURRENT_DATE);

