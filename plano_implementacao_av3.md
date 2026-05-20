# 🛩️ Aerocode AV3 — Plano de Implementação Fullstack

## Visão Geral

Evolução do Aerocode de frontend-only (AV2) para uma aplicação fullstack completa, mantendo o design visual existente e a lógica de negócios da AV1.

```mermaid
graph TB
    subgraph Docker["Docker Compose"]
        subgraph FE["Frontend - React + TS + Vite"]
            Pages["Pages: Login, Dashboard, Aeronaves, Etapas, Pecas, Testes, Funcionarios, Relatorios"]
            Contexts["AuthContext + API Service"]
        end
        subgraph BE["Backend - Node.js + Express + TS"]
            Routes["REST API Routes"]
            Controllers["Controllers"]
            Middleware["Auth Middleware (JWT)"]
            Prisma["Prisma ORM"]
        end
        subgraph DB["MySQL 8"]
            Tables["Tabelas: funcionario, aeronave, peca, etapa, teste, relatorio"]
        end
    end
    
    FE -->|HTTP/REST| BE
    BE -->|Prisma Client| DB
```

---

## Tecnologias

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | React 19 + TypeScript + Vite + Tailwind | Mantém base da AV2 |
| Backend | Node.js + Express + TypeScript | Mesmo ecossistema TS |
| ORM | Prisma | Type-safe, migrations automáticas |
| Banco de Dados | MySQL 8 | Requisito do projeto |
| Auth | JWT (jsonwebtoken) + bcrypt | Segurança de produção |
| Containerização | Docker + Docker Compose | Ambiente reproduzível |

---

## Modelo de Dados (Prisma Schema)

```mermaid
erDiagram
    Funcionario {
        Int id PK
        String nome
        String telefone
        String endereco
        String usuario UK
        String senha
        NivelPermissao nivelPermissao
        DateTime criadoEm
        DateTime atualizadoEm
    }
    
    Aeronave {
        Int id PK
        String codigo UK
        String modelo
        TipoAeronave tipo
        Int capacidade
        Int alcance
        DateTime criadoEm
        DateTime atualizadoEm
    }
    
    Peca {
        Int id PK
        String nome
        TipoPeca tipo
        String fornecedor
        StatusPeca status
        Int aeronaveId FK
        DateTime criadoEm
        DateTime atualizadoEm
    }
    
    Etapa {
        Int id PK
        String nome
        DateTime prazo
        StatusEtapa status
        Int aeronaveId FK
        DateTime criadoEm
        DateTime atualizadoEm
    }
    
    Teste {
        Int id PK
        TipoTeste tipo
        ResultadoTeste resultado
        Int aeronaveId FK
        DateTime criadoEm
        DateTime atualizadoEm
    }
    
    Relatorio {
        Int id PK
        String nomeArquivo
        String conteudo
        Int aeronaveId FK
        DateTime criadoEm
    }
    
    EtapaFuncionario {
        Int etapaId FK
        Int funcionarioId FK
    }

    Aeronave ||--o{ Peca : "possui"
    Aeronave ||--o{ Etapa : "possui"
    Aeronave ||--o{ Teste : "possui"
    Aeronave ||--o{ Relatorio : "gera"
    Etapa }o--o{ Funcionario : "alocados via EtapaFuncionario"
```

---

## Fases de Implementação

### Fase 1 — Infraestrutura Docker + Setup do Projeto
> [!IMPORTANT]
> Primeira fase: criar toda a estrutura de pastas e configuração Docker.

- [ ] Criar `docker-compose.yml` com 3 serviços (frontend, backend, mysql)
- [ ] Criar `frontend/Dockerfile` (Node 20 Alpine, Vite dev server)
- [ ] Criar `backend/Dockerfile` (Node 20 Alpine, ts-node dev)
- [ ] Configurar volumes, networks e variáveis de ambiente
- [ ] Criar `.env.example` na raiz com todas as variáveis
- [ ] Copiar e adaptar frontend da AV2 para `frontend/`
- [ ] Inicializar projeto Node.js+TS no `backend/`

### Fase 2 — Banco de Dados com Prisma
- [ ] Instalar Prisma no backend (`prisma`, `@prisma/client`)
- [ ] Criar `backend/prisma/schema.prisma` com todos os modelos
- [ ] Definir enums: `NivelPermissao`, `TipoAeronave`, `TipoPeca`, `StatusPeca`, `StatusEtapa`, `TipoTeste`, `ResultadoTeste`
- [ ] Criar seed com Admin padrão (admin/admin) com senha bcrypt
- [ ] Criar seed com dados de exemplo (aeronaves, peças, etc.)
- [ ] Testar migrations (`npx prisma migrate dev`)

### Fase 3 — Backend API REST
> [!NOTE]
> Endpoints seguem convenção REST. Todos retornam JSON.

#### Endpoints da API:

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/api/auth/login` | Login (retorna JWT) | ❌ |
| `POST` | `/api/auth/logout` | Invalidar token | ✅ |
| `GET` | `/api/auth/me` | Dados do usuário logado | ✅ |
| | | | |
| `GET` | `/api/aeronaves` | Listar aeronaves | ✅ |
| `GET` | `/api/aeronaves/:id` | Detalhes aeronave | ✅ |
| `POST` | `/api/aeronaves` | Criar aeronave | ✅ Admin/Eng |
| `PUT` | `/api/aeronaves/:id` | Atualizar aeronave | ✅ Admin/Eng |
| `DELETE` | `/api/aeronaves/:id` | Remover aeronave | ✅ Admin |
| | | | |
| `GET` | `/api/pecas` | Listar peças | ✅ |
| `POST` | `/api/pecas` | Criar peça | ✅ Admin/Eng |
| `PUT` | `/api/pecas/:id` | Atualizar peça | ✅ Admin/Eng |
| `DELETE` | `/api/pecas/:id` | Remover peça | ✅ Admin |
| | | | |
| `GET` | `/api/etapas` | Listar etapas | ✅ |
| `POST` | `/api/etapas` | Criar etapa | ✅ Admin/Eng |
| `PUT` | `/api/etapas/:id` | Atualizar etapa | ✅ Admin/Eng |
| `DELETE` | `/api/etapas/:id` | Remover etapa | ✅ Admin |
| `POST` | `/api/etapas/:id/funcionarios` | Alocar funcionário | ✅ Admin/Eng |
| `DELETE` | `/api/etapas/:id/funcionarios/:fid` | Desalocar func. | ✅ Admin/Eng |
| | | | |
| `GET` | `/api/testes` | Listar testes | ✅ |
| `POST` | `/api/testes` | Criar teste | ✅ Admin/Eng |
| `PUT` | `/api/testes/:id` | Atualizar teste | ✅ Admin/Eng |
| `DELETE` | `/api/testes/:id` | Remover teste | ✅ Admin |
| | | | |
| `GET` | `/api/funcionarios` | Listar funcionários | ✅ Admin |
| `POST` | `/api/funcionarios` | Criar funcionário | ✅ Admin |
| `PUT` | `/api/funcionarios/:id` | Atualizar func. | ✅ Admin |
| `DELETE` | `/api/funcionarios/:id` | Remover func. | ✅ Admin |
| | | | |
| `GET` | `/api/relatorios` | Listar relatórios | ✅ |
| `POST` | `/api/relatorios` | Gerar relatório | ✅ Admin/Eng |
| `GET` | `/api/relatorios/:id` | Ver relatório | ✅ |
| `GET` | `/api/relatorios/:id/download` | Download TXT | ✅ |
| | | | |
| `GET` | `/api/dashboard/stats` | Estatísticas gerais | ✅ |

- [ ] Estruturar `backend/src/` com padrão MVC:
  - `routes/` — definição das rotas Express
  - `controllers/` — lógica de request/response
  - `middlewares/` — auth, validação, error handling
  - `services/` — lógica de negócio
  - `utils/` — helpers (token, hash, etc.)
- [ ] Implementar todas as rotas acima
- [ ] Error handling global com middleware
- [ ] Validação de dados de entrada

### Fase 4 — Adaptação do Frontend (AV2 → AV3)
> [!WARNING]
> O frontend da AV2 usa dados mockados. Precisamos substituir por chamadas à API real.

- [ ] Criar serviço `api.ts` com Axios configurado (baseURL, interceptors JWT)
- [ ] Refatorar `AuthContext` para usar `/api/auth/login` real
- [ ] Substituir `mockAeronaves` por `GET /api/aeronaves`
- [ ] Substituir `mockPecas` por `GET /api/pecas`
- [ ] Substituir `mockEtapas` por `GET /api/etapas`
- [ ] Substituir `mockTestes` por `GET /api/testes`
- [ ] Substituir `mockFuncionarios` por `GET /api/funcionarios`
- [ ] Substituir `mockRelatorios` por `GET /api/relatorios`
- [ ] Implementar CRUD real em todas as telas (Create, Update, Delete via modais)
- [ ] Adicionar loading states e error handling nas páginas
- [ ] Configurar proxy do Vite para `/api` → backend

### Fase 5 — Segurança e Autenticação
- [ ] Implementar JWT com `jsonwebtoken`
- [ ] Hash de senhas com `bcrypt` (como na AV1 que usava scrypt)
- [ ] Middleware `authMiddleware` que valida token em toda request protegida
- [ ] Middleware `permissaoMiddleware(nivel[])` para controle de acesso
- [ ] Token armazenado em `httpOnly cookie` ou `localStorage` com interceptor
- [ ] Rate limiting no login (proteção brute force)
- [ ] CORS configurado corretamente

### Fase 6 — Relatórios e Funcionalidades Avançadas
- [ ] Gerar relatório completo de aeronave (como na AV1)
- [ ] Download de relatório em formato TXT
- [ ] Dashboard com estatísticas reais do banco
- [ ] Filtros e busca nas listagens

---

## Estrutura de Pastas Final

```
AV3/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── docs/
│   └── AV3.pdf
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── assets/
│       ├── components/
│       │   ├── Layout/
│       │   ├── Modal/
│       │   ├── RotaProtegida/
│       │   └── Tooltip/
│       ├── contexts/
│       │   └── AuthContext.tsx
│       ├── pages/
│       │   ├── Login/
│       │   ├── Dashboard/
│       │   ├── Aeronaves/
│       │   ├── Etapas/
│       │   ├── Pecas/
│       │   ├── Testes/
│       │   ├── Funcionarios/
│       │   ├── Relatorios/
│       │   └── Professor/
│       ├── routes/
│       ├── services/
│       │   └── api.ts
│       ├── shared/
│       └── types/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── aeronave.routes.ts
│       │   ├── peca.routes.ts
│       │   ├── etapa.routes.ts
│       │   ├── teste.routes.ts
│       │   ├── funcionario.routes.ts
│       │   ├── relatorio.routes.ts
│       │   └── dashboard.routes.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── aeronave.controller.ts
│       │   ├── peca.controller.ts
│       │   ├── etapa.controller.ts
│       │   ├── teste.controller.ts
│       │   ├── funcionario.controller.ts
│       │   ├── relatorio.controller.ts
│       │   └── dashboard.controller.ts
│       ├── middlewares/
│       │   ├── auth.middleware.ts
│       │   ├── permissao.middleware.ts
│       │   └── errorHandler.middleware.ts
│       ├── services/
│       │   └── relatorio.service.ts
│       └── utils/
│           ├── jwt.ts
│           └── hash.ts
├── database/
│   └── (volumes MySQL)
└── contexto av1 e av2/
    ├── av1/ (referência)
    └── av2/ (referência)
```

---

## Variáveis de Ambiente (.env.example)

```env
# MySQL
MYSQL_ROOT_PASSWORD=aerocode_root_2026
MYSQL_DATABASE=aerocode
MYSQL_USER=aerocode_user
MYSQL_PASSWORD=aerocode_pass_2026

# Backend
DATABASE_URL=mysql://aerocode_user:aerocode_pass_2026@mysql:3306/aerocode
JWT_SECRET=aerocode-jwt-secret-av3-2026-fatec-sjc
JWT_EXPIRES_IN=8h
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001/api
```

---

## Ordem de Execução

```mermaid
flowchart LR
    F1["Fase 1\nInfra Docker"] --> F2["Fase 2\nBanco + Prisma"]
    F2 --> F3["Fase 3\nBackend API"]
    F3 --> F4["Fase 4\nFrontend Adaptação"]
    F3 --> F5["Fase 5\nSegurança JWT"]
    F4 --> F6["Fase 6\nRelatórios + Polish"]
    F5 --> F6
```

> [!TIP]
> Vamos executar as fases sequencialmente. A cada fase concluída, testamos antes de avançar.

---

## Próximo Passo

**Aguardando sua aprovação para iniciar a Fase 1** — criação da infraestrutura Docker, setup do backend, e cópia/adaptação do frontend da AV2.
