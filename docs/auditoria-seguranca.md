# Relatório de Auditoria de Segurança: Aerocode V3 🛡️

Durante a avaliação de segurança do backend da aplicação **Aerocode V3**, atuei como Especialista de Segurança (Red Team) para tentar "quebrar" ou contornar as validações de login e segurança. 

O sistema possui boas defesas básicas (uso de Helmet, bcrypt para senhas e rotas protegidas), mas encontrei vulnerabilidades críticas que podem ser exploradas para causar Negação de Serviço (DoS), enumerar usuários e comprometer o ambiente se não for bem configurado.

Abaixo, os resultados detalhados dos ataques simulados e as brechas encontradas.

---

## 🛑 1. Enumeração de Usuários (Username Enumeration)
**Nível de Risco:** `Médio` | **CWE-203: Observable Discrepancy**

O endpoint de login (`POST /api/auth/login`) responde de forma diferente caso o usuário exista ou não.
- **Usuário inexistente:** `Credenciais inválidas. Usuário não encontrado.`
- **Usuário existente (senha errada):** `Credenciais inválidas. Senha incorreta.`

**Exploração:**
Um atacante pode usar listas de palavras (wordlists) para descobrir nomes de usuários reais do sistema observando a resposta da API. Uma vez com os nomes, pode focar ataques de força-bruta apenas nas contas que de fato existem.
**Correção Sugerida:** Retornar uma mensagem genérica de erro (ex: `"Credenciais inválidas"`) para ambos os casos, sem revelar qual das partes falhou.

## 🚨 2. Memory Leak (Vazamento de Memória) no Rate Limiter Customizado
**Nível de Risco:** `Alto` | **CWE-400: Uncontrolled Resource Consumption**

No arquivo `auth.routes.ts`, foi implementado um *Rate Limiter* customizado usando um `Map` do JavaScript (`rateLimitCache`). 
O problema é que os IPs que tentam fazer login são inseridos nesse `Map`, mas **nunca são deletados** (mesmo após o tempo expirar).

**Exploração (Ataque DoS):**
Um invasor pode criar um script que envia requisições falsificando cabeçalhos ou usando botnets para bater na rota de login com milhões de IPs diferentes. Isso fará o `Map` crescer infinitamente até esgotar a RAM do servidor (Out Of Memory), derrubando a API.
**Correção Sugerida:** Utilizar a biblioteca `express-rate-limit` já instalada no projeto também para a rota de login, ou implementar um cache que limpa automaticamente chaves expiradas (LRU Cache).

## 💥 3. Injeção de Objetos (Type Confusion) no Prisma
**Nível de Risco:** `Alto` | **CWE-20: Improper Input Validation**

O payload do express em `POST /api/auth/login` recebe `usuario` e o passa diretamente para a busca no banco:
`const funcionario = await prisma.funcionario.findUnique({ where: { usuario } });`

O express transforma payloads JSON complexos em objetos JavaScript nativos. Não há verificação se `usuario` é realmente uma `String`.

**Exploração:**
Se um atacante enviar o payload `{"usuario": {"in": ["admin"]}, "senha": "123"}`, o Prisma tentará usar o operador de NoSQL, mas pelo fato do campo não suportar o operador na query `findUnique`, causará uma exceção interna não tratada que quebra a requisição retornando um erro 500 genérico, expondo informações no log interno e gastando recursos da API inutilmente (DoS via exaustão de erros).
**Correção Sugerida:** Implementar uma validação estrita do payload (garantindo que `usuario` e `senha` são exclusivamente `strings`) antes de passar ao banco de dados.

## 🔓 4. Uso de Segredo Fraco no JWT (Fallback Secret)
**Nível de Risco:** `Crítico` (sob certas condições) | **CWE-798: Use of Hard-coded Credentials**

Tanto na geração quanto na validação do token JWT, o código possui um fallback estático:
`process.env.JWT_SECRET || 'fallback-secret'`

**Exploração:**
Se a aplicação for colocada em produção e por algum motivo a variável de ambiente não carregar corretamente, o sistema passará a assinar os tokens com `fallback-secret`. Qualquer atacante que descubra isso através do código aberto ou tentativa poderá criar seu próprio token com a permissão de `ADMINISTRADOR` e tomar controle total do sistema.
**Correção Sugerida:** Remover o fallback estático. Se a variável não existir, a aplicação deve falhar no boot (Fail-fast) para evitar inicialização insegura.

## ⚠️ 5. Validação Relaxada de Algoritmo JWT
**Nível de Risco:** `Baixo` | **CWE-327: Use of a Broken or Risky Cryptographic Algorithm**

Ao decodificar o token (`jwt.verify`), não está sendo especificado qual algoritmo o servidor aceita. 

**Exploração:**
Bibliotecas JWT já sofreram com falhas de *Algorithm Confusion*, onde um atacante força a biblioteca a usar chaves públicas como secretas alterando o cabeçalho do token de RSA para HMAC. Embora menos provável em nossa configuração atual, é uma falha na aderência de padrões de segurança.
**Correção Sugerida:** Configurar explicitamente: `jwt.verify(token, secret, { algorithms: ['HS256'] })`.

## 🛡️ Conclusão
A infraestrutura possui os alicerces corretos de segurança (Bcrypt, Helmet, JWT), contudo falha em **Validações de Input** estritas e na mitigação de negação de serviço a nível de aplicativo em código customizado. Recomendamos aplicar as correções sugeridas para blindar a aplicação.
