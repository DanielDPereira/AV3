<p align="center">
  <img src="https://img.shields.io/badge/Aerocode-V3-0050d0?style=for-the-badge&logo=airplane&logoColor=white" alt="Aerocode V3" />
  <img src="https://img.shields.io/badge/status-concluído-brightgreen?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/licença-MIT-blue?style=for-the-badge" alt="Licença" />
</p>

<h1 align="center">✈️ Aerocode — Sistema de Gestão Industrial Aeronáutica</h1>

<p align="center">
  Plataforma fullstack para gestão de produção, controle de qualidade e rastreabilidade de aeronaves.
</p>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Contexto Acadêmico](#-contexto-acadêmico)
- [Evolução do Projeto](#-evolução-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
- [Credenciais de Acesso](#-credenciais-de-acesso)
- [Testes QA](#-testes-qa)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação Técnica](#-documentação-técnica)
- [Licença](#-licença)

---

## 📖 Sobre o Projeto

O **Aerocode** é um sistema de gestão industrial voltado para a cadeia de produção aeronáutica. O software permite o controle completo do ciclo de vida de uma aeronave — do cadastro inicial, passando pelo gerenciamento de peças e etapas de produção, até a execução de protocolos de testes de qualidade e geração de relatórios de entrega.

Esta terceira versão (V3) representa o amadurecimento completo do projeto, consolidando a aplicação em uma arquitetura fullstack com backend RESTful, banco de dados relacional, autenticação JWT e containerização via Docker.

---

## 🎓 Contexto Acadêmico

Este software foi desenvolvido como a **Atividade de Avaliação Individual 3 (AV3)** para a disciplina de **Programação Orientada a Objetos (POO)**.

| | |
|---|---|
| **Instituição** | FATEC São José dos Campos — Prof. Jessen Vidal |
| **Curso** | Análise e Desenvolvimento de Sistemas (ADS) |
| **Disciplina** | Programação Orientada a Objetos (POO) |
| **Professor** | Eng. Dr. Gerson Penha |
| **Desenvolvedor** | [Daniel Dias Pereira](https://github.com/DanielDPereira) |

---

## 🔄 Evolução do Projeto

O Aerocode foi desenvolvido de forma incremental ao longo de três entregas, cada uma elevando o nível de complexidade técnica e maturidade arquitetural:

| Versão | Entrega | Descrição | Repositório |
|--------|---------|-----------|-------------|
| **V1 — CLI** | AV1 | Aplicação de linha de comando em TypeScript com persistência em arquivos JSON e criptografia de senhas. | [AV1](https://github.com/DanielDPereira/AV1) |
| **V2 — GUI** | AV2 | Interface gráfica web com React, Vite e Tailwind CSS. Dados mockados localmente via Context API. | [AV2](https://github.com/DanielDPereira/AV2) |
| **V3 — Fullstack** | AV3 | Arquitetura completa com backend (Express + Prisma), banco relacional (MySQL) e infraestrutura Docker. | Este repositório |

### O que mudou da V2 para a V3

- **Backend completo:** API REST com Express e TypeScript, substituindo os dados mockados do frontend.
- **Banco de dados relacional:** MySQL 8 gerenciado pelo Prisma ORM, com migrations e seed automático.
- **Autenticação real:** JWT + bcrypt substituindo a autenticação local simulada.
- **Segurança e Auditoria Avançada:** Helmet, CORS, Express Rate Limit com gestão de IP blindada contra memory leak, validação rigorosa com Zod e defesa ativa atestada no [Relatório de Auditoria de Segurança](./docs/auditoria-seguranca.md).
- **Documentação da API:** Swagger UI integrado em `/api/docs`.
- **Infraestrutura:** Docker Compose orquestrando três containers (frontend, backend, database).
- **Testes e Alta Performance:** Suíte de QA e testes automatizados em Python (10 módulos), complementada por testes de estresse em multi-thread registrados no extenso [Laudo de Performance da API](./docs/relatorio-performance.md).

---

## ✨ Funcionalidades

### Gestão e CRUD

- **Aeronaves** — Cadastro de aeronaves comerciais e militares com código único, modelo, capacidade e alcance.
- **Peças** — Controle de componentes (nacionais/importadas) com fornecedor e acompanhamento de status: em produção, em transporte ou pronta.
- **Etapas de Produção** — Fluxo lógico de fases de montagem com status (pendente, em andamento, concluída) e alocação de funcionários (relação N:M).
- **Testes de Qualidade** — Registro de protocolos elétricos, hidráulicos e aerodinâmicos, com resultado de aprovado ou reprovado.
- **Funcionários** — Cadastro de colaboradores com diferentes níveis de permissão.
- **Relatórios** — Geração automática de relatórios de entrega por aeronave com download em formato TXT.

### Segurança e Acesso

- **Login seguro** com JWT e senhas criptografadas com bcrypt.
- **Controle de acesso (RBAC)** com três níveis: Administrador, Engenheiro e Operador.
- **Rate limiting** para proteção contra brute force (5 tentativas/minuto no login).
- **Helmet** para proteção de headers HTTP.

### Interface

- **Dashboard** com estatísticas do sistema em tempo real.
- **Design system** baseado em Material Design 3 com Tailwind CSS.
- **Interface responsiva** para desktop e mobile.
- **Tipografia moderna** com a fonte Inter via Google Fonts.
- **Modo offline** com fallback de autenticação local quando a API está indisponível.

---

## 🛠 Tecnologias

### Frontend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 19 | Biblioteca para construção da interface reativa |
| TypeScript | ~5.6 | Tipagem estática para segurança em tempo de compilação |
| Vite | 6 | Bundler e dev server de alta performance |
| Tailwind CSS | 3 | Estilização utilitária seguindo Material Design 3 |
| React Router | 7 | Navegação entre módulos com rotas protegidas |
| Axios | 1.7 | Cliente HTTP com interceptors para JWT |

### Backend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | 20 (Alpine) | Runtime JavaScript no servidor |
| Express | 4 | Framework HTTP para construção da API REST |
| TypeScript | ~5.6 | Tipagem estática no backend |
| Prisma | 6 | ORM para modelagem e acesso ao banco de dados |
| JWT (jsonwebtoken) | 9 | Geração e validação de tokens de autenticação |
| bcryptjs | 2.4 | Hashing seguro de senhas |
| Zod | 3 | Validação e parsing de dados de entrada |
| Helmet | 8 | Hardening de headers HTTP |
| express-rate-limit | 8 | Proteção contra abuso de requisições |
| Swagger UI Express | 5 | Documentação interativa da API |

### Infraestrutura

| Tecnologia | Versão | Finalidade |
|---|---|---|
| MySQL | 8.0 | Banco de dados relacional |
| Docker | — | Containerização dos serviços |
| Docker Compose | — | Orquestração dos containers |

### Testes

| Tecnologia | Finalidade |
|---|---|
| Python 3 | Linguagem para os scripts de teste |
| pytest | Framework de execução dos testes |
| requests | Cliente HTTP para chamadas à API |

---

## 🏗 Arquitetura

O sistema segue uma arquitetura de três camadas, onde cada serviço roda em seu próprio container Docker:

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose                          │
│                                                             │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐  │
│  │   Frontend   │───▶│    Backend    │───▶│   Database   │  │
│  │  React+Vite  │    │  Express+TS   │    │   MySQL 8    │  │
│  │  :5173       │    │  :3001        │    │   :3306      │  │
│  └──────────────┘    └───────────────┘    └──────────────┘  │
│                            │                                │
│                       Prisma ORM                            │
└─────────────────────────────────────────────────────────────┘
```

**Fluxo de autenticação:**

1. O usuário envia credenciais via `POST /api/auth/login`.
2. O backend valida a senha com bcrypt e retorna um token JWT.
3. O frontend armazena o token em `sessionStorage`.
4. Um interceptor do Axios injeta o header `Authorization: Bearer <token>` em todas as requisições.
5. O middleware `autenticar` valida o token no backend.
6. O middleware `autorizar` verifica o nível de permissão do usuário.

---

## 📦 Pré-requisitos

Para executar o projeto, você precisará ter instalado:

- [**Docker**](https://www.docker.com/) e [**Docker Compose**](https://docs.docker.com/compose/)

Opcionalmente, para desenvolvimento local sem Docker:

- [Node.js 20+](https://nodejs.org/)
- [Python 3.10+](https://www.python.org/) (para rodar os testes)

---

## 🚀 Como Executar

### 1. Clonar o repositório

```bash
git clone https://github.com/DanielDPereira/AV3.git
cd AV3
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

> Os valores padrão do `.env.example` são suficientes para rodar o ambiente de desenvolvimento.

### 3. Subir os containers

```bash
docker compose up --build
```

### 4. Executar migrations e seed (apenas na primeira vez)

Em um segundo terminal:

```bash
docker exec -it aerocode-api npx prisma migrate dev --name init
docker exec -it aerocode-api npx prisma db seed
```

### 5. Acessar a aplicação

| Serviço | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **API (Backend)** | http://localhost:3001 |
| **Health Check** | http://localhost:3001/api/health |
| **Swagger (Docs API)** | http://localhost:3001/api/docs |

### Comandos úteis

| Comando | Descrição |
|---|---|
| `docker compose up --build` | Build e start de todos os containers |
| `docker compose down` | Parar e remover containers |
| `docker compose down -v` | Parar, remover containers **e volumes** (limpa o banco) |
| `docker exec -it aerocode-api npx prisma studio` | Interface visual do banco de dados |

### Limpeza e Reset do Banco de Dados

Caso precise resetar o banco de dados para o estado de fábrica (limpar registros antigos, corrigir falhas de estado ou limpar execuções de testes pesados), disponibilizamos scripts automatizados de limpeza para diferentes sistemas operacionais.

Eles irão parar a aplicação, deletar os volumes persistentes, recriar a infraestrutura limpa e rodar novamente as migrações e o *seed* oficial.

- **No Windows (PowerShell/CMD):**
  ```cmd
  .\limpar_banco.bat
  ```

- **No Linux ou macOS (Bash):**
  ```bash
  chmod +x limpar_banco.sh
  ./limpar_banco.sh
  ```

---

## 🔑 Credenciais de Acesso

O seed do banco de dados cria os seguintes usuários para teste:

| Usuário | Senha | Nível | Acesso |
|---|---|---|---|
| `admin` | `admin` | Administrador | Acesso total (incluindo gestão de funcionários) |
| `engenheiro` | `engenheiro` | Engenheiro | Gestão técnica e operacional |
| `operador` | `operador` | Operador | Visualização e execução de tarefas |
| `ana.souza` | `ana123` | Engenheiro | Gestão técnica e operacional |

---

## 🧪 Testes QA

Os testes automatizados ficam na pasta `tests/` e cobrem toda a API com **pytest** e **requests**.

### Instalar dependências

```bash
cd tests
pip install -r requirements.txt
```

### Executar os testes

```bash
# Certifique-se de que os containers estão rodando (docker compose up)
pytest -v
```

### Executar um módulo específico

```bash
pytest test_02_auth.py -v
```

### Cobertura dos testes

| Módulo | O que é testado |
|---|---|
| `test_01_health` | Health check do servidor |
| `test_02_auth` | Login válido/inválido, rate limiting, logout, rota `/me` |
| `test_03_aeronaves` | CRUD completo + validações + controle de permissões |
| `test_04_pecas` | CRUD completo + validações + relação com aeronave |
| `test_05_etapas` | CRUD + alocação e desalocação de funcionários |
| `test_06_testes` | CRUD + validações de tipo e resultado |
| `test_07_funcionarios` | CRUD + soft delete + restrição Admin-only |
| `test_08_relatorios` | Geração + visualização + download TXT |
| `test_09_dashboard` | Estatísticas gerais + aeronaves recentes |
| `test_10_security` | Auditoria contra Object Injection no Prisma, Rate Limiting Bypass e Memory Leaks |
| `performance_metrics.py`| Script Python de análise de estresse concorrente para geração dos gráficos de performance |

---

## 📁 Estrutura do Projeto

```
AV3/
├── docker-compose.yml              # Orquestração dos 3 serviços
├── .env.example                    # Template de variáveis de ambiente
├── .gitignore
├── LICENSE                         # Licença MIT
├── README.md
├── limpar_banco.bat                # Script de Hard Reset do banco de dados (Windows)
├── limpar_banco.sh                 # Script de Hard Reset do banco de dados (Linux/macOS)
│
├── backend/                        # API REST — Node.js + Express + TypeScript
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma           # Modelo relacional (7 tabelas + enums)
│   │   └── seed.ts                 # Dados iniciais para desenvolvimento
│   └── src/
│       ├── server.ts               # Entry point do Express
│       ├── swagger.json            # Especificação OpenAPI
│       ├── lib/
│       │   └── prisma.ts           # Singleton do Prisma Client
│       ├── middlewares/
│       │   └── auth.middleware.ts   # autenticar (JWT) + autorizar (RBAC)
│       └── routes/
│           ├── auth.routes.ts      # Login, logout, /me
│           ├── aeronaves.routes.ts
│           ├── pecas.routes.ts
│           ├── etapas.routes.ts
│           ├── testes.routes.ts
│           ├── funcionarios.routes.ts
│           ├── relatorios.routes.ts
│           └── dashboard.routes.ts
│
├── frontend/                       # SPA — React + Vite + TypeScript
│   ├── Dockerfile
│   ├── package.json
│   ├── index.html
│   ├── tailwind.config.js          # Design system (Material Design 3)
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx                # Ponto de entrada React
│       ├── App.tsx
│       ├── index.css               # Tailwind base + componentes
│       ├── components/             # Layout, Modal, RotaProtegida, Tooltip
│       ├── contexts/
│       │   └── AuthContext.tsx      # Autenticação JWT + fallback offline
│       ├── pages/                  # Login, Dashboard, Aeronaves, Etapas,
│       │                           # Pecas, Testes, Funcionarios, Relatorios,
│       │                           # Professor
│       ├── routes/
│       │   └── index.tsx           # React Router v7 com rotas protegidas
│       ├── services/
│       │   └── api.ts              # Axios client com interceptors
│       └── types/                  # Interfaces TypeScript compartilhadas
│
├── database/
│   └── init/
│       └── 01-setup.sql            # Charset UTF-8 + permissões MySQL
│
├── tests/                          # Testes QA automatizados e Medição de Performance
│   ├── requirements.txt            # pytest, requests, matplotlib, numpy
│   ├── conftest.py                 # Fixtures (tokens, headers, base_url)
│   ├── test_01_health.py
│   ├── test_02_auth.py
│   ├── test_03_aeronaves.py
│   ├── test_04_pecas.py
│   ├── test_05_etapas.py
│   ├── test_06_testes.py
│   ├── test_07_funcionarios.py
│   ├── test_08_relatorios.py
│   ├── test_09_dashboard.py
│   ├── test_10_security.py         # Teste de exploração de falhas e bypass de segurança
│   └── performance_metrics.py      # Multi-threading HTTP simulador e gerador de gráficos (1 a 10 usuários)
│
└── docs/
    ├── AV3.pdf                     # Documento de requisitos da atividade
    ├── arquitetura.md              # Documentação técnica da arquitetura
    ├── api.md                      # Referência completa da API REST
    ├── banco-de-dados.md           # Modelo de dados e relacionamentos
    ├── auditoria-seguranca.md      # Relatório formal de detecção e patches de segurança aplicados
    ├── relatorio-performance.md    # Laudo comprobatório (tabelas e gráficos horizontais) da capacidade da infra
    ├── resultados_texto.md         # Tabelas geradas programaticamente pelas baterias de testes 
    └── assets/                     # Repositório das imagens em alta definição dos gráficos de performance
```

---

## 📚 Documentação Técnica

Para detalhes técnicos aprofundados, consulte os documentos na pasta [`docs/`](./docs):

| Documento | Conteúdo |
|---|---|
| [**arquitetura.md**](./docs/arquitetura.md) | Visão geral da arquitetura, fluxo de autenticação, middlewares e padrões de projeto adotados. |
| [**api.md**](./docs/api.md) | Referência completa de todos os endpoints da API REST, com métodos, rotas, parâmetros e permissões. |
| [**banco-de-dados.md**](./docs/banco-de-dados.md) | Modelo relacional, diagrama entidade-relacionamento, enums e descrição das tabelas. |
| [**auditoria-seguranca.md**](./docs/auditoria-seguranca.md) | Relatório de blindagem contra ataques de object injection, enumeração, brute-force e memory leaks nas políticas de segurança. |
| [**relatorio-performance.md**](./docs/relatorio-performance.md) | Laudo de viabilidade corporativa e escalabilidade atestando latência sub-milissegundo para os 35 endpoints simultâneos da API. |

---

## 👨‍💻 Autor

**Daniel Dias Pereira**
Estudante de Análise e Desenvolvimento de Sistemas — FATEC São José dos Campos

[![GitHub](https://img.shields.io/badge/GitHub-DanielDPereira-181717?style=flat-square&logo=github)](https://github.com/DanielDPereira)

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

<p align="center">
  Desenvolvido com dedicação para a disciplina de POO — FATEC São José dos Campos ✈️
</p>
