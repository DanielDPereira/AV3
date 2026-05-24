-- ═══════════════════════════════════════════════════════════
-- Aerocode V3 — Database Initialization
-- Este script roda automaticamente quando o container MySQL
-- é criado pela primeira vez.
-- O Prisma gerencia o schema; este arquivo serve apenas para
-- configurações extras de charset e permissões.
-- ═══════════════════════════════════════════════════════════

-- Garantir charset UTF-8 para suporte a acentos (pt-BR)
ALTER DATABASE aerocode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Concede todos os privilégios ao usuário da aplicação
GRANT ALL PRIVILEGES ON aerocode.* TO 'aerocode_user'@'%';

-- Permissão para criar shadow databases (necessário para Prisma migrate dev)
GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO 'aerocode_user'@'%';
FLUSH PRIVILEGES;
