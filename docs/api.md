# 📡 API REST — Referência Completa

Documentação de todos os endpoints da API Aerocode V3.

**Base URL:** `http://localhost:3001`
**Documentação interativa (Swagger):** `http://localhost:3001/api/docs`

---

## Convenções

- Todos os endpoints são prefixados com `/api`.
- O body das requisições e respostas utiliza **JSON** (`Content-Type: application/json`).
- Endpoints protegidos exigem o header `Authorization: Bearer <token>`.
- As colunas de **Auth** indicam:
  - ❌ — Rota pública (sem autenticação).
  - ✅ — Qualquer usuário autenticado.
  - ✅ Admin — Apenas Administrador.
  - ✅ Admin/Eng — Administrador ou Engenheiro.

---

## Health Check

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Status do servidor | ❌ |

**Resposta de exemplo:**

```json
{
  "status": "ok",
  "service": "Aerocode API",
  "version": "3.0.0",
  "timestamp": "2026-05-25T20:00:00.000Z"
}
```

---

## Autenticação

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Realiza login e retorna JWT | ❌ |
| `POST` | `/api/auth/logout` | Logout (invalidação client-side) | ❌ |
| `GET` | `/api/auth/me` | Retorna dados do usuário logado | ✅ |

### `POST /api/auth/login`

**Rate Limit:** 5 tentativas por minuto por IP.

**Body:**

```json
{
  "usuario": "admin",
  "senha": "admin"
}
```

**Resposta (200):**

```json
{
  "funcionario": {
    "id": 1,
    "nome": "Daniel Dias",
    "usuario": "admin",
    "nivelPermissao": "ADMINISTRADOR",
    "telefone": "+55 11 98765-4321",
    "endereco": "Av. Paulista, 1000, São Paulo - SP",
    "foto": null
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Erros possíveis:**

| Status | Motivo |
|---|---|
| `401` | Usuário ou senha inválidos |
| `429` | Rate limit excedido |

---

## Aeronaves

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/aeronaves` | Listar todas as aeronaves | ✅ |
| `GET` | `/api/aeronaves/:id` | Buscar aeronave por ID | ✅ |
| `POST` | `/api/aeronaves` | Criar nova aeronave | ✅ Admin/Eng |
| `PUT` | `/api/aeronaves/:id` | Atualizar aeronave | ✅ Admin/Eng |
| `DELETE` | `/api/aeronaves/:id` | Excluir aeronave | ✅ Admin |

### `POST /api/aeronaves` — Criar

**Body:**

```json
{
  "codigo": "AC-787-DL",
  "modelo": "Boeing 787 Dreamliner",
  "tipo": "COMERCIAL",
  "capacidade": 296,
  "alcance": 14140
}
```

**Campos obrigatórios:** `codigo`, `modelo`, `tipo`, `capacidade`, `alcance`

**Valores válidos para `tipo`:** `COMERCIAL`, `MILITAR`

---

## Peças

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/pecas` | Listar todas as peças | ✅ |
| `GET` | `/api/pecas/:id` | Buscar peça por ID | ✅ |
| `POST` | `/api/pecas` | Criar nova peça | ✅ Admin/Eng |
| `PUT` | `/api/pecas/:id` | Atualizar peça | ✅ Admin/Eng |
| `DELETE` | `/api/pecas/:id` | Excluir peça | ✅ Admin |

### `POST /api/pecas` — Criar

**Body:**

```json
{
  "nome": "Motor Turbofan CFM56",
  "tipo": "IMPORTADA",
  "fornecedor": "CFM International",
  "status": "EM_PRODUCAO",
  "aeronaveId": 1
}
```

**Valores válidos para `tipo`:** `NACIONAL`, `IMPORTADA`

**Valores válidos para `status`:** `EM_PRODUCAO`, `EM_TRANSPORTE`, `PRONTA`

---

## Etapas

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/etapas` | Listar todas as etapas | ✅ |
| `GET` | `/api/etapas/:id` | Buscar etapa por ID | ✅ |
| `POST` | `/api/etapas` | Criar nova etapa | ✅ Admin/Eng |
| `PUT` | `/api/etapas/:id` | Atualizar etapa | ✅ Admin/Eng |
| `DELETE` | `/api/etapas/:id` | Excluir etapa | ✅ Admin |
| `POST` | `/api/etapas/:id/funcionarios` | Alocar funcionário | ✅ |
| `PUT` | `/api/etapas/:id/funcionarios` | Sincronizar alocações | ✅ Admin/Eng |
| `DELETE` | `/api/etapas/:id/funcionarios/:fid` | Desalocar funcionário | ✅ |

### `POST /api/etapas` — Criar

**Body:**

```json
{
  "nome": "Montagem da Fuselagem",
  "prazo": "2026-06-15",
  "status": "PENDENTE",
  "aeronaveId": 1
}
```

**Valores válidos para `status`:** `PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`

### `POST /api/etapas/:id/funcionarios` — Alocar

**Body:**

```json
{
  "funcionarioId": 2
}
```

### `PUT /api/etapas/:id/funcionarios` — Sincronizar

Substitui todas as alocações de funcionários da etapa.

**Body:**

```json
{
  "funcionarioIds": [2, 4]
}
```

---

## Testes de Qualidade

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/testes` | Listar todos os testes | ✅ |
| `GET` | `/api/testes/:id` | Buscar teste por ID | ✅ |
| `POST` | `/api/testes` | Criar novo teste | ✅ Admin/Eng |
| `PUT` | `/api/testes/:id` | Atualizar teste | ✅ Admin/Eng |
| `DELETE` | `/api/testes/:id` | Excluir teste | ✅ Admin |

### `POST /api/testes` — Criar

**Body:**

```json
{
  "tipo": "ELETRICO",
  "resultado": "APROVADO",
  "aeronaveId": 1
}
```

**Valores válidos para `tipo`:** `ELETRICO`, `HIDRAULICO`, `AERODINAMICO`

**Valores válidos para `resultado`:** `APROVADO`, `REPROVADO`

---

## Funcionários

> **Acesso restrito:** Todas as rotas de funcionários exigem nível **Administrador**.

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/funcionarios` | Listar todos os funcionários | ✅ Admin |
| `GET` | `/api/funcionarios/:id` | Buscar funcionário por ID | ✅ Admin |
| `POST` | `/api/funcionarios` | Criar novo funcionário | ✅ Admin |
| `PUT` | `/api/funcionarios/:id` | Atualizar funcionário | ✅ Admin |
| `DELETE` | `/api/funcionarios/:id` | Desativar funcionário (soft delete) | ✅ Admin |

### `POST /api/funcionarios` — Criar

**Body:**

```json
{
  "nome": "Carlos Mendes",
  "usuario": "carlos.mendes",
  "senha": "senha123",
  "telefone": "+55 12 99876-5432",
  "endereco": "Rua das Flores, 100, SJC - SP",
  "nivelPermissao": "ENGENHEIRO"
}
```

**Valores válidos para `nivelPermissao`:** `ADMINISTRADOR`, `ENGENHEIRO`, `OPERADOR`

> **Nota:** O `DELETE` realiza um **soft delete**, marcando o campo `ativo` como `false` em vez de remover o registro do banco.

---

## Relatórios

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/relatorios` | Listar todos os relatórios | ✅ |
| `GET` | `/api/relatorios/:id` | Buscar relatório por ID | ✅ |
| `POST` | `/api/relatorios` | Gerar relatório para uma aeronave | ✅ Admin/Eng |
| `GET` | `/api/relatorios/:id/download` | Download do relatório em TXT | ✅ |
| `DELETE` | `/api/relatorios/:id` | Excluir relatório | ✅ Admin |

### `POST /api/relatorios` — Gerar

**Body:**

```json
{
  "aeronaveId": 1
}
```

O sistema gera automaticamente o conteúdo do relatório com base nos dados atuais da aeronave (peças, etapas, testes, funcionários alocados).

### `GET /api/relatorios/:id/download`

Retorna o conteúdo do relatório como `text/plain`, pronto para download.

---

## Dashboard

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Estatísticas gerais do sistema | ✅ |
| `GET` | `/api/dashboard/recent-aircrafts` | Últimas aeronaves cadastradas | ✅ |

### `GET /api/dashboard/stats` — Resposta

```json
{
  "totalAeronaves": 4,
  "totalPecas": 4,
  "totalEtapas": 4,
  "totalTestes": 4,
  "totalFuncionarios": 4,
  "totalRelatorios": 4,
  "etapasPendentes": 2,
  "etapasAndamento": 1,
  "etapasConcluidas": 1,
  "testesAprovados": 3,
  "testesReprovados": 1
}
```

---

## Códigos de Erro

| Status | Significado |
|---|---|
| `400` | Dados inválidos (validação Zod) |
| `401` | Não autenticado ou token inválido/expirado |
| `403` | Permissão insuficiente |
| `404` | Recurso não encontrado |
| `429` | Rate limit excedido |
| `500` | Erro interno do servidor |

**Formato padrão de erro:**

```json
{
  "error": "Mensagem descritiva do erro"
}
```
