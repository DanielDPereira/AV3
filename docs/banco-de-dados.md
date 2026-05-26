# 🗄 Banco de Dados — Modelo Relacional

Documentação técnica do modelo de dados do Aerocode V3.

**SGBD:** MySQL 8.0
**ORM:** Prisma 6
**Charset:** `utf8mb4_unicode_ci` (suporte completo a caracteres especiais e acentuação em pt-BR)

---

## Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    Funcionario ||--o{ EtapaFuncionario : "é alocado em"
    Etapa ||--o{ EtapaFuncionario : "possui"
    Aeronave ||--o{ Peca : "possui"
    Aeronave ||--o{ Etapa : "possui"
    Aeronave ||--o{ Teste : "possui"
    Aeronave ||--o{ Relatorio : "possui"

    Funcionario {
        int id PK
        string nome
        string usuario UK
        string senhaHash
        string telefone
        string endereco
        enum nivelPermissao
        string foto
        boolean ativo
        datetime criadoEm
        datetime atualizadoEm
    }

    Aeronave {
        int id PK
        string codigo UK
        string modelo
        enum tipo
        int capacidade
        int alcance
        datetime criadoEm
        datetime atualizadoEm
    }

    Peca {
        int id PK
        string nome
        enum tipo
        string fornecedor
        enum status
        int aeronaveId FK
        datetime criadoEm
        datetime atualizadoEm
    }

    Etapa {
        int id PK
        string nome
        datetime prazo
        enum status
        int aeronaveId FK
        datetime criadoEm
        datetime atualizadoEm
    }

    EtapaFuncionario {
        int etapaId PK-FK
        int funcionarioId PK-FK
        datetime alocadoEm
    }

    Teste {
        int id PK
        enum tipo
        enum resultado
        int aeronaveId FK
        datetime criadoEm
        datetime atualizadoEm
    }

    Relatorio {
        int id PK
        string nomeArquivo
        int aeronaveId FK
        text conteudo
        datetime dataGeracao
    }
```

---

## Tabelas

### `funcionarios`

Armazena os usuários do sistema com diferentes níveis de permissão.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `INT` | PK, auto-increment | Identificador único |
| `nome` | `VARCHAR(100)` | NOT NULL | Nome completo |
| `usuario` | `VARCHAR(50)` | UNIQUE, NOT NULL | Login de acesso |
| `senhaHash` | `VARCHAR(255)` | NOT NULL | Hash bcrypt da senha |
| `telefone` | `VARCHAR(20)` | NULLABLE | Telefone de contato |
| `endereco` | `VARCHAR(200)` | NULLABLE | Endereço |
| `nivelPermissao` | `ENUM` | DEFAULT `OPERADOR` | Nível de acesso (RBAC) |
| `foto` | `VARCHAR(500)` | NULLABLE | URL da foto de perfil |
| `ativo` | `BOOLEAN` | DEFAULT `true` | Flag para soft delete |
| `criado_em` | `DATETIME` | DEFAULT `now()` | Data de criação |
| `atualizado_em` | `DATETIME` | Auto-update | Data da última atualização |

---

### `aeronaves`

Cadastro de aeronaves gerenciadas pelo sistema.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `INT` | PK, auto-increment | Identificador único |
| `codigo` | `VARCHAR(30)` | UNIQUE, NOT NULL | Código único da aeronave |
| `modelo` | `VARCHAR(100)` | NOT NULL | Modelo da aeronave |
| `tipo` | `ENUM` | DEFAULT `COMERCIAL` | Tipo (COMERCIAL / MILITAR) |
| `capacidade` | `INT` | NOT NULL | Capacidade de passageiros |
| `alcance` | `INT` | NOT NULL | Alcance em quilômetros |
| `criado_em` | `DATETIME` | DEFAULT `now()` | Data de criação |
| `atualizado_em` | `DATETIME` | Auto-update | Data da última atualização |

**Relações:** Uma aeronave possui múltiplas peças, etapas, testes e relatórios.

---

### `pecas`

Componentes associados às aeronaves.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `INT` | PK, auto-increment | Identificador único |
| `nome` | `VARCHAR(150)` | NOT NULL | Nome do componente |
| `tipo` | `ENUM` | DEFAULT `NACIONAL` | Origem (NACIONAL / IMPORTADA) |
| `fornecedor` | `VARCHAR(100)` | NOT NULL | Nome do fornecedor |
| `status` | `ENUM` | DEFAULT `EM_PRODUCAO` | Status atual |
| `aeronave_id` | `INT` | FK → `aeronaves.id`, NULLABLE | Aeronave associada |
| `criado_em` | `DATETIME` | DEFAULT `now()` | Data de criação |
| `atualizado_em` | `DATETIME` | Auto-update | Data da última atualização |

**On Delete:** Se a aeronave for deletada, o `aeronave_id` da peça é definido como `NULL` (`SetNull`).

---

### `etapas`

Fases do fluxo de produção de uma aeronave.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `INT` | PK, auto-increment | Identificador único |
| `nome` | `VARCHAR(150)` | NOT NULL | Nome da etapa |
| `prazo` | `DATETIME` | NOT NULL | Data limite |
| `status` | `ENUM` | DEFAULT `PENDENTE` | Status da etapa |
| `aeronave_id` | `INT` | FK → `aeronaves.id`, NOT NULL | Aeronave associada |
| `criado_em` | `DATETIME` | DEFAULT `now()` | Data de criação |
| `atualizado_em` | `DATETIME` | Auto-update | Data da última atualização |

**On Delete:** `Cascade` — se a aeronave for deletada, todas as suas etapas também são removidas.

---

### `etapas_funcionarios`

Tabela intermediária para a relação **N:M** (muitos-para-muitos) entre etapas e funcionários.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `etapa_id` | `INT` | PK, FK → `etapas.id` | Etapa associada |
| `funcionario_id` | `INT` | PK, FK → `funcionarios.id` | Funcionário alocado |
| `alocado_em` | `DATETIME` | DEFAULT `now()` | Data da alocação |

**Chave primária composta:** `(etapa_id, funcionario_id)` — garante que um funcionário não pode ser alocado duas vezes na mesma etapa.

**On Delete:** `Cascade` em ambas as direções.

---

### `testes`

Registros de testes de qualidade aplicados às aeronaves.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `INT` | PK, auto-increment | Identificador único |
| `tipo` | `ENUM` | NOT NULL | Tipo do teste |
| `resultado` | `ENUM` | NOT NULL | Resultado |
| `aeronave_id` | `INT` | FK → `aeronaves.id`, NULLABLE | Aeronave testada |
| `criado_em` | `DATETIME` | DEFAULT `now()` | Data de criação |
| `atualizado_em` | `DATETIME` | Auto-update | Data da última atualização |

**On Delete:** `SetNull` — se a aeronave for deletada, o `aeronave_id` é definido como `NULL`.

---

### `relatorios`

Relatórios de entrega gerados para cada aeronave.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `INT` | PK, auto-increment | Identificador único |
| `nome_arquivo` | `VARCHAR(200)` | NOT NULL | Nome do arquivo (ex: `relatorio_AC-737-MAX.txt`) |
| `aeronave_id` | `INT` | FK → `aeronaves.id`, NOT NULL | Aeronave do relatório |
| `conteudo` | `LONGTEXT` | NULLABLE | Conteúdo completo do relatório em texto |
| `data_geracao` | `DATETIME` | DEFAULT `now()` | Data em que foi gerado |

**On Delete:** `Cascade` — se a aeronave for deletada, todos os seus relatórios são removidos.

---

## Enumerações (Enums)

### `NivelPermissao`

Define os níveis de acesso do sistema (RBAC).

| Valor | Descrição |
|---|---|
| `ADMINISTRADOR` | Acesso total, incluindo gestão de funcionários |
| `ENGENHEIRO` | Gestão técnica e operacional |
| `OPERADOR` | Visualização e execução de tarefas |

### `TipoAeronave`

| Valor | Descrição |
|---|---|
| `COMERCIAL` | Aeronave de uso comercial/civil |
| `MILITAR` | Aeronave de uso militar |

### `TipoPeca`

| Valor | Descrição |
|---|---|
| `NACIONAL` | Peça de fabricação nacional |
| `IMPORTADA` | Peça importada |

### `StatusPeca`

| Valor | Descrição |
|---|---|
| `EM_PRODUCAO` | Peça em fase de fabricação |
| `EM_TRANSPORTE` | Peça sendo transportada |
| `PRONTA` | Peça pronta para uso |

### `StatusEtapa`

| Valor | Descrição |
|---|---|
| `PENDENTE` | Etapa ainda não iniciada |
| `EM_ANDAMENTO` | Etapa em execução |
| `CONCLUIDA` | Etapa finalizada |

### `TipoTeste`

| Valor | Descrição |
|---|---|
| `ELETRICO` | Teste de sistemas elétricos |
| `HIDRAULICO` | Teste de sistemas hidráulicos |
| `AERODINAMICO` | Teste aerodinâmico |

### `ResultadoTeste`

| Valor | Descrição |
|---|---|
| `APROVADO` | Teste aprovado |
| `REPROVADO` | Teste reprovado |

---

## Seed (Dados Iniciais)

O arquivo `prisma/seed.ts` popula o banco com dados de desenvolvimento. Execute com:

```bash
docker exec -it aerocode-api npx prisma db seed
```

### Dados criados pelo seed

| Entidade | Quantidade | Destaques |
|---|---|---|
| Funcionários | 4 | admin, engenheiro, operador, ana.souza |
| Aeronaves | 4 | Boeing 737 MAX, Airbus A320neo, Lockheed C-130J, Embraer E195-E2 |
| Peças | 4 | Turbina, Painel de Fuselagem, Trem de Pouso, Assento |
| Etapas | 4 | Usinagem, Inspeção, Soldagem, Calibração |
| Testes | 4 | Elétrico, Hidráulico, Aerodinâmico |
| Relatórios | 4 | Um por aeronave, gerados automaticamente |

O seed utiliza `upsert` para funcionários e aeronaves, garantindo idempotência (pode ser executado múltiplas vezes sem duplicar dados).
