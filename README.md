# ✈️ Aerocode V3 — Sistema de Gestão Industrial Aeronáutica

Sistema fullstack para gestão industrial de aeronaves, desenvolvido como AV3 da disciplina de Programação Web na FATEC São José dos Campos.

> Evolução do Aerocode AV2 (frontend-only) para uma aplicação completa com backend, banco de dados relacional e autenticação JWT.

---

## 📋 Sumário

- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
- [Credenciais de Acesso](#-credenciais-de-acesso)
- [API Endpoints](#-api-endpoints)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Testes QA](#-testes-qa)
- [Licença](#-licença)

---

## 🛠 Tecnologias

| Camada         | Tecnologia                          |
|----------------|-------------------------------------|
| Frontend       | React 19 + TypeScript + Vite        |
| Estilização    | Tailwind CSS 3 (Material Design 3)  |
| Backend        | Node.js + Express + TypeScript      |
| ORM            | Prisma 6                            |
| Banco de Dados | MySQL 8                             |
| Autenticação   | JWT (jsonwebtoken) + bcryptjs       |
| Containerização| Docker + Docker Compose             |
| Testes QA      | Python (pytest + requests)          |

---

## 🏗 Arquitetura

```
┌──────────────────────────────────────────────────────┐
│                  Docker Compose                       │
│                                                       │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │   Frontend   │───▶│   Backend    │───▶│  MySQL   │ │
│  │  React+Vite  │    │ Express+TS   │    │    8     │ │
│  │  :5173       │    │ :3001        │    │  :3306   │ │
│  └─────────────┘    └──────────────┘    └──────────┘ │
│                           │                           │
│                      Prisma ORM                       │
└──────────────────────────────────────────────────────┘
```

**Fluxo de autenticação:**
1. Usuário envia credenciais → `POST /api/auth/login`
2. Backend valida com bcrypt → retorna JWT
3. Frontend armazena token em `sessionStorage`
4. Axios interceptor injeta `Authorization: Bearer <token>` em toda requisição
5. Middleware `autenticar` valida o token no backend
6. Middleware `autorizar` verifica o nível de permissão

---

## ✨ Funcionalidades

- **Login seguro** com JWT, bcrypt e rate limiting (5 tentativas/min)
- **Dashboard** com estatísticas em tempo real do banco de dados
- **CRUD completo** para: Aeronaves, Peças, Etapas, Testes, Funcionários, Relatórios
- **Controle de acesso** por nível: Administrador, Engenheiro, Operador
- **Geração de relatórios** completos por aeronave (download TXT)
- **Alocação de funcionários** em etapas de produção (relação N:M)
- **Interface responsiva** (mobile + desktop) com Material Design 3
- **Busca e filtros** nas listagens
- **Página especial** de homenagem ao professor 😄

---

## 📦 Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados
- (Opcional) [Node.js 20+](https://nodejs.org/) para desenvolvimento local
- (Opcional) [Python 3.10+](https://www.python.org/) para rodar os testes QA

---

## 🚀 Como Executar

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/aerocode-v3.git
cd aerocode-v3
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env conforme necessário (os valores padrão funcionam para dev)
```

### 3. Subir os containers

```bash
docker compose up --build
```

### 4. Executar migrations e seed (primeira vez)

```bash
# Em outro terminal:
docker exec -it aerocode-api npx prisma migrate dev --name init
docker exec -it aerocode-api npx prisma db seed
```

### 5. Acessar a aplicação

| Serviço   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173        |
| Backend   | http://localhost:3001        |
| Health    | http://localhost:3001/api/health |

---

## 🔑 Credenciais de Acesso

| Usuário      | Senha        | Nível           |
|--------------|--------------|-----------------|
| `admin`      | `admin`      | Administrador   |
| `engenheiro` | `engenheiro` | Engenheiro      |
| `operador`   | `operador`   | Operador        |
| `ana.souza`  | `ana123`     | Engenheiro      |

---

## 📡 API Endpoints

### Autenticação
| Método | Rota                | Descrição              | Auth |
|--------|---------------------|------------------------|------|
| POST   | `/api/auth/login`   | Login (retorna JWT)    | ❌   |
| POST   | `/api/auth/logout`  | Logout                 | ❌   |
| GET    | `/api/auth/me`      | Dados do usuário logado| ✅   |

### Aeronaves
| Método | Rota                  | Descrição          | Auth        |
|--------|-----------------------|--------------------|-------------|
| GET    | `/api/aeronaves`      | Listar todas       | ✅          |
| GET    | `/api/aeronaves/:id`  | Buscar por ID      | ✅          |
| POST   | `/api/aeronaves`      | Criar nova         | ✅ Admin/Eng|
| PUT    | `/api/aeronaves/:id`  | Atualizar          | ✅ Admin/Eng|
| DELETE | `/api/aeronaves/:id`  | Excluir            | ✅ Admin    |

### Peças
| Método | Rota              | Descrição          | Auth        |
|--------|-------------------|--------------------|-------------|
| GET    | `/api/pecas`      | Listar todas       | ✅          |
| GET    | `/api/pecas/:id`  | Buscar por ID      | ✅          |
| POST   | `/api/pecas`      | Criar nova         | ✅ Admin/Eng|
| PUT    | `/api/pecas/:id`  | Atualizar          | ✅ Admin/Eng|
| DELETE | `/api/pecas/:id`  | Excluir            | ✅ Admin    |

### Etapas
| Método | Rota                               | Descrição              | Auth        |
|--------|-------------------------------------|------------------------|-------------|
| GET    | `/api/etapas`                       | Listar todas           | ✅          |
| GET    | `/api/etapas/:id`                   | Buscar por ID          | ✅          |
| POST   | `/api/etapas`                       | Criar nova             | ✅ Admin/Eng|
| PUT    | `/api/etapas/:id`                   | Atualizar              | ✅ Admin/Eng|
| DELETE | `/api/etapas/:id`                   | Excluir                | ✅ Admin    |
| POST   | `/api/etapas/:id/funcionarios`      | Alocar funcionário     | ✅          |
| PUT    | `/api/etapas/:id/funcionarios`      | Sincronizar alocação   | ✅ Admin/Eng|
| DELETE | `/api/etapas/:id/funcionarios/:fid` | Desalocar funcionário  | ✅          |

### Testes
| Método | Rota               | Descrição          | Auth        |
|--------|--------------------|--------------------|-------------|
| GET    | `/api/testes`      | Listar todos       | ✅          |
| GET    | `/api/testes/:id`  | Buscar por ID      | ✅          |
| POST   | `/api/testes`      | Criar novo         | ✅ Admin/Eng|
| PUT    | `/api/testes/:id`  | Atualizar          | ✅ Admin/Eng|
| DELETE | `/api/testes/:id`  | Excluir            | ✅ Admin    |

### Funcionários (Admin only)
| Método | Rota                      | Descrição          | Auth     |
|--------|---------------------------|--------------------|----------|
| GET    | `/api/funcionarios`       | Listar todos       | ✅ Admin |
| GET    | `/api/funcionarios/:id`   | Buscar por ID      | ✅ Admin |
| POST   | `/api/funcionarios`       | Criar novo         | ✅ Admin |
| PUT    | `/api/funcionarios/:id`   | Atualizar          | ✅ Admin |
| DELETE | `/api/funcionarios/:id`   | Desativar (soft)   | ✅ Admin |

### Relatórios
| Método | Rota                           | Descrição          | Auth        |
|--------|--------------------------------|--------------------|-------------|
| GET    | `/api/relatorios`              | Listar todos       | ✅          |
| GET    | `/api/relatorios/:id`          | Buscar por ID      | ✅          |
| POST   | `/api/relatorios`              | Gerar relatório    | ✅ Admin/Eng|
| GET    | `/api/relatorios/:id/download` | Download TXT       | ✅          |
| DELETE | `/api/relatorios/:id`          | Excluir            | ✅ Admin    |

### Dashboard
| Método | Rota                            | Descrição            | Auth |
|--------|---------------------------------|----------------------|------|
| GET    | `/api/dashboard/stats`          | Estatísticas gerais  | ✅   |
| GET    | `/api/dashboard/recent-aircrafts`| Aeronaves recentes  | ✅   |

---

## 📁 Estrutura de Pastas

```
AV3/
├── docker-compose.yml          # Orquestração dos 3 serviços
├── .env / .env.example         # Variáveis de ambiente
├── .gitignore
├── LICENSE                     # MIT
├── README.md                   # Este arquivo
├── plano_implementacao_av3.md  # Plano de implementação original
│
├── frontend/                   # React + Vite + TypeScript
│   ├── Dockerfile
│   ├── public/favicon.svg
│   ├── index.html
│   ├── tailwind.config.js      # Design system Material Design 3
│   └── src/
│       ├── main.tsx / App.tsx
│       ├── index.css           # Tailwind base + componentes
│       ├── components/         # Layout, Modal, RotaProtegida, Tooltip
│       ├── contexts/           # AuthContext (JWT)
│       ├── pages/              # Login, Dashboard, Aeronaves, Etapas,
│       │                       # Pecas, Testes, Funcionarios, Relatorios
│       ├── routes/             # React Router v7
│       ├── services/           # Axios API client
│       └── types/              # TypeScript interfaces
│
├── backend/                    # Node.js + Express + TypeScript
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts           # Entry point
│       ├── lib/prisma.ts       # Prisma Client singleton
│       ├── middlewares/        # autenticar, autorizar
│       └── routes/             # auth, aeronaves, pecas, etapas,
│                               # testes, funcionarios, relatorios, dashboard
│
├── database/
│   └── init/01-setup.sql       # Charset UTF-8 + permissões
│
├── tests/                      # Testes QA Python
│   ├── requirements.txt
│   ├── conftest.py
│   ├── test_01_health.py
│   ├── test_02_auth.py
│   ├── test_03_aeronaves.py
│   ├── test_04_pecas.py
│   ├── test_05_etapas.py
│   ├── test_06_testes.py
│   ├── test_07_funcionarios.py
│   ├── test_08_relatorios.py
│   └── test_09_dashboard.py
│
└── docs/
    └── AV3.pdf                 # Documento de requisitos
```

---

## 🧪 Testes QA

Os testes automatizados estão na pasta `tests/` e usam **pytest** + **requests**.

### Instalar dependências

```bash
cd tests
pip install -r requirements.txt
```

### Executar todos os testes

```bash
# Com os containers rodando (docker compose up)
pytest -v
```

### Executar um módulo específico

```bash
pytest test_02_auth.py -v
```

### Cobertura dos testes

| Módulo        | Testes                                                  |
|---------------|---------------------------------------------------------|
| Health        | Health check do servidor                                |
| Auth          | Login válido, inválido, rate limiting, logout, /me      |
| Aeronaves     | CRUD completo + validações + permissões                 |
| Peças         | CRUD completo + validações + relação com aeronave       |
| Etapas        | CRUD + alocação/desalocação de funcionários             |
| Testes        | CRUD + validações de tipo e resultado                   |
| Funcionários  | CRUD + soft delete + controle Admin-only                |
| Relatórios    | Geração + visualização + download TXT                   |
| Dashboard     | Estatísticas + aeronaves recentes                       |

---

## 👨‍💻 Autor

**Daniel Dias Pereira** — FATEC São José dos Campos

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
