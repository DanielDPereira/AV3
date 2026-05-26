# 🏗 Arquitetura — Aerocode V3

Documentação técnica da arquitetura do sistema Aerocode V3.

---

## Visão Geral

O Aerocode V3 segue uma arquitetura de três camadas (**Three-Tier Architecture**), onde cada camada é um serviço independente orquestrado pelo Docker Compose:

```
          ┌────────────────────────────────────────────────────┐
          │               Docker Compose Network               │
          │                 (aerocode-network)                 │
          │                                                    │
          │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
 Usuário ─▶│   Frontend   │─▶│   Backend   │─▶│  Database  │  │
          │  │ aerocode-web│  │ aerocode-api│  │ aerocode-db│  │
          │  │   :5173     │  │   :3001     │  │   :3306    │  │
          │  │ React+Vite  │  │ Express+TS  │  │  MySQL 8   │  │
          │  └─────────────┘  └──────┬──────┘  └───────────┘  │
          │                         │                          │
          │                    Prisma ORM                      │
          └────────────────────────────────────────────────────┘
```

### Camada de Apresentação (Frontend)

- **Tecnologia:** React 19 + TypeScript + Vite
- **Estilização:** Tailwind CSS 3 com design system baseado em Material Design 3
- **Responsabilidade:** Renderização da interface, gerenciamento de estado local e comunicação com a API via Axios.
- **Container:** `aerocode-web` (porta 5173)

### Camada de Aplicação (Backend)

- **Tecnologia:** Node.js 20 + Express 4 + TypeScript
- **ORM:** Prisma 6
- **Responsabilidade:** Processamento de regras de negócio, autenticação/autorização, validação de dados e acesso ao banco.
- **Container:** `aerocode-api` (porta 3001)

### Camada de Dados (Database)

- **Tecnologia:** MySQL 8.0
- **Responsabilidade:** Persistência e integridade dos dados.
- **Container:** `aerocode-db` (porta 3306)
- **Volume:** `mysql_data` para persistência entre reinicializações.

---

## Padrões de Projeto

### Router Pattern (Backend)

Cada domínio da aplicação possui seu próprio arquivo de rotas (`*.routes.ts`), registrado no `server.ts`. Isso mantém a separação de responsabilidades e facilita a manutenção:

```
server.ts
 ├── /api/auth        → auth.routes.ts
 ├── /api/aeronaves   → aeronaves.routes.ts
 ├── /api/pecas       → pecas.routes.ts
 ├── /api/etapas      → etapas.routes.ts
 ├── /api/testes      → testes.routes.ts
 ├── /api/funcionarios → funcionarios.routes.ts
 ├── /api/relatorios  → relatorios.routes.ts
 └── /api/dashboard   → dashboard.routes.ts
```

### Singleton Pattern (Prisma Client)

O Prisma Client é instanciado uma única vez em `lib/prisma.ts` e reutilizado em todas as rotas, evitando múltiplas conexões ao banco.

### Context API (Frontend)

O `AuthContext` centraliza todo o estado de autenticação, expondo:

- `usuario` — dados do usuário logado
- `isAutenticado` — booleano de estado
- `fazerLogin()` / `fazerLogout()` — métodos de autenticação
- `temPermissao()` — verificação de nível de acesso

### Protected Route Pattern

O componente `RotaProtegida` encapsula rotas que exigem autenticação e, opcionalmente, níveis de permissão específicos. Redireciona para `/login` se o usuário não estiver autenticado.

---

## Fluxo de Autenticação

```
┌──────────┐       POST /api/auth/login        ┌──────────┐
│          │──────── {usuario, senha} ─────────▶│          │
│ Frontend │                                    │ Backend  │
│          │◀──── {token, funcionario} ─────────│          │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │ sessionStorage.setItem('aerocode_token')      │ bcrypt.compare(senha, hash)
     │ sessionStorage.setItem('aerocode_usuario')    │ jwt.sign({id, usuario, nivel})
     │                                               │
     │ ── Requisições subsequentes ──                │
     │ Authorization: Bearer <token>                 │ jwt.verify(token, secret)
     │                                               │ → req.user = decoded
```

### Detalhamento

1. **Login:** O frontend envia `usuario` e `senha` para `POST /api/auth/login`.
2. **Validação:** O backend busca o funcionário pelo `usuario`, compara a senha com `bcrypt.compare()` e, se válida, gera um JWT contendo `id`, `usuario` e `nivelPermissao`.
3. **Armazenamento:** O frontend salva o token em `sessionStorage` (não persiste entre abas/sessões por segurança).
4. **Interceptor:** O Axios interceptor injeta automaticamente o header `Authorization: Bearer <token>` em todas as requisições subsequentes.
5. **Middleware `autenticar`:** Em cada rota protegida, decodifica o token JWT e popula `req.user`.
6. **Middleware `autorizar`:** Verifica se `req.user.nivelPermissao` está na lista de níveis permitidos.
7. **Fallback offline:** Se a API estiver indisponível (Network Error), o frontend usa autenticação local com dados mockados.

---

## Middlewares

### Globais (aplicados a todas as rotas)

| Middleware | Descrição |
|---|---|
| `cors` | Libera requisições do frontend (`CORS_ORIGIN`) |
| `helmet` | Proteção de headers HTTP (XSS, clickjacking, etc.) |
| `rateLimit` | Limite de 100 requisições por IP a cada 15 minutos |
| `express.json()` | Parser de body JSON |

### Rate Limiting específico

O endpoint de login (`POST /api/auth/login`) possui um rate limiter adicional de **5 tentativas por minuto por IP**, para proteção contra brute force.

### Por rota

| Middleware | Função |
|---|---|
| `autenticar` | Valida o token JWT e popula `req.user` |
| `autorizar(...niveis)` | Verifica se o usuário tem um dos níveis de permissão requeridos |

---

## Containerização (Docker)

### docker-compose.yml

O arquivo define três serviços interconectados via rede bridge (`aerocode-network`):

| Serviço | Container | Imagem | Porta |
|---|---|---|---|
| `database` | `aerocode-db` | `mysql:8.0` | 3306 (interna) → 3307 (host) |
| `backend` | `aerocode-api` | Build local (`./backend/Dockerfile`) | 3001 |
| `frontend` | `aerocode-web` | Build local (`./frontend/Dockerfile`) | 5173 |

### Dependências entre serviços

```
frontend ──depends_on──▶ backend ──depends_on──▶ database (healthcheck)
```

O backend só inicia após o healthcheck do MySQL confirmar que o banco está pronto (`mysqladmin ping`).

### Volumes

- **`mysql_data`** — Volume persistente para os dados do MySQL.
- **Bind mounts** — `./backend:/app` e `./frontend:/app` para hot-reload em desenvolvimento.
- **`/app/node_modules`** — Volume anônimo para isolar `node_modules` do container.

---

## Variáveis de Ambiente

Todas as configurações sensíveis são gerenciadas via `.env` (não versionado). O arquivo `.env.example` serve como template:

| Variável | Descrição | Padrão |
|---|---|---|
| `DB_ROOT_PASSWORD` | Senha root do MySQL | — |
| `DB_NAME` | Nome do banco | `aerocode` |
| `DB_USER` | Usuário da aplicação | `aerocode_user` |
| `DB_PASSWORD` | Senha do usuário | — |
| `DB_PORT` | Porta do MySQL no host | `3306` |
| `NODE_ENV` | Ambiente do Node.js | `development` |
| `API_PORT` | Porta da API | `3001` |
| `JWT_SECRET` | Chave secreta para assinatura do JWT | — |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `24h` |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:5173` |
| `FRONTEND_PORT` | Porta do frontend no host | `5173` |
| `VITE_API_URL` | URL da API para o frontend | `http://localhost:3001` |
