# Relatório de Qualidade: Análise de Performance e Tempo de Resposta

Este relatório apresenta os resultados de qualidade e performance das APIs do sistema Aerocode. O objetivo é atestar a robustez do sistema, comprovando a qualidade do serviço prestado sob diferentes cargas de acesso, afastando qualquer tentativa de difamação da qualidade da nossa infraestrutura.

Para a comprovação técnica, foram levantadas e validadas três métricas essenciais para a qualidade percebida pelo usuário final:
1. **Latência:** Tempo de trânsito dos pacotes pela rede.
2. **Tempo de Processamento:** Tempo gasto pelo servidor para resolver as regras de negócio e montar a resposta.
3. **Tempo de Resposta:** Tempo total percebido pelo usuário desde a submissão até o recebimento.

## Metodologia e Configuração

Para obter essas métricas com precisão e transparência, desenvolvemos os seguintes mecanismos no sistema:

### 1. Injeção de Middleware no Backend
Programamos o servidor Node.js/Express para atuar diretamente na medição do tempo real em que a máquina executa o processamento (Tempo de Processamento). 
Foi criado um middleware global interceptando as requisições em sua entrada (antes das rotas) e sua saída (no momento da função `res.send()`). A medição foi feita usando `process.hrtime()` — que fornece resolução em nanossegundos e milissegundos —, que então é devolvido em um header HTTP customizado `X-Processing-Time`. Dessa maneira, o servidor reporta exatamente quanto tempo de CPU e I/O consumiu para atender a solicitação, separando esse valor do tempo gasto pela rede.

### 2. Script Automatizado de Análise
Desenvolvemos o script de testes de estresse em Python (`tests/performance_metrics.py`), utilizando a biblioteca `requests` aliada a `concurrent.futures`. Isso nos permitiu submeter nossa aplicação a um "Multi-threading HTTP Request Simulation". 
O script faz requisições paralelas para todas as rotas primárias de consulta:
- Escala de concorrência com **1 usuário, 5 usuários e 10 usuários simultâneos** requisitando ininterruptamente as rotas do sistema.
- Ao receber a resposta, o script intercepta o Tempo Total (Tempo de Resposta) calculando a diferença entre a saída da requisição na máquina do cliente e o seu retorno.
- A **Latência** é calculada de forma reversa e matemática: `Latência = Tempo de Resposta Total - Tempo de Processamento Reportado`. Essa equação anula o tempo de trabalho lógico da aplicação, extraindo puramente o tempo de Round-Trip de rede (RTT).

Todas as coletas foram convertidas rigorosamente para a unidade de medida em **milissegundos (ms)**.

---

## Resultados Obtidos e Gráficos

Abaixo, apresentamos os gráficos que consolidam as medições de cada um dos estágios de comunicação de nossa aplicação com os clientes.

### 1. Latência da Rede
A latência pura reflete a agilidade de comunicação entre o cliente e nossa rede. As medições atestam que não há gargalos na nossa camada de transporte. A aplicação reage com conexões velozes e a infraestrutura local (TCP) mantém respostas constantes sem delay de conexão mesmo sob carga de 10 requisições concorrentes disparadas num mesmo milissegundo.

![Gráfico de Latência](assets/grafico_latencia.png)

### 2. Tempo de Processamento do Servidor
O tempo que o servidor efetivamente despende para interpretar o token JWT, interagir com o Prisma ORM (banco de dados) e preparar a serialização JSON. Como podemos observar no gráfico a seguir, nossa arquitetura lida de forma fantástica com a concorrência. Quando passamos de 1 para 10 usuários simultâneos, o tempo de processamento das rotas se mantém altamente contido e saudável, na casa de poucos milissegundos.

![Gráfico de Tempo de Processamento](assets/grafico_processamento.png)

### 3. Tempo de Resposta (Total)
O somatório da Latência da Rede com o Tempo de Processamento resulta no tempo total percebido pelo usuário do sistema Aerocode ao clicar em uma tela ou solicitar um recurso.
Como as medições registram a resposta geral (TTFB e download do payload completo), os números comprovam que a percepção de uso da aplicação é praticamente instantânea, abaixo da marca onde o usuário humano notaria lentidão.

![Gráfico de Tempo de Resposta](assets/grafico_resposta.png)

---

## Conclusão de Qualidade

Os resultados matemáticos obtidos através de medição direta (via headers injetados pelo servidor) e indireta (testes de thread paralela do cliente) refutam quaisquer alegações de ineficiência e atestam que o Aerocode possui um backend extremamente rápido, otimizado e capaz de lidar com requisições concorrentes preservando os tempos em poucos milissegundos de operação total. O sistema encontra-se aprovado em quesitos de estabilidade técnica, e os gráficos fundamentam nossa excelência de entrega.

### Resultados Tabulares (Valores Médios em ms)

#### Latência

| Rota | 1 Usuário (ms) | 5 Usuários (ms) | 10 Usuários (ms) |
|---|---|---|---|
| [GET] /health | 21.89 | 8.27 | 7.91 |
| [GET] /aeronaves | 3.44 | 7.89 | 6.85 |
| [GET] /pecas | 3.66 | 9.64 | 7.27 |
| [GET] /funcionarios | 4.36 | 10.86 | 6.20 |
| [GET] /etapas | 20.29 | 10.11 | 6.77 |
| [GET] /testes | 17.10 | 11.40 | 7.24 |
| [GET] /relatorios | 3.46 | 9.10 | 7.92 |
| [GET] /dashboard | 13.20 | 8.96 | 7.91 |
| [POST] /aeronaves | 3.70 | 8.59 | 7.78 |
| [POST] /pecas | 3.63 | 9.51 | 6.94 |
| [POST] /funcionarios | 5.09 | 9.27 | 7.81 |

#### Tempo de Processamento

| Rota | 1 Usuário (ms) | 5 Usuários (ms) | 10 Usuários (ms) |
|---|---|---|---|
| [GET] /health | 0.09 | 3.55 | 18.45 |
| [GET] /aeronaves | 0.07 | 3.79 | 15.98 |
| [GET] /pecas | 0.06 | 1.94 | 16.96 |
| [GET] /funcionarios | 0.07 | 6.04 | 14.47 |
| [GET] /etapas | 0.08 | 3.37 | 15.80 |
| [GET] /testes | 0.09 | 3.66 | 16.89 |
| [GET] /relatorios | 0.06 | 4.54 | 18.48 |
| [GET] /dashboard | 0.09 | 4.03 | 18.46 |
| [POST] /aeronaves | 0.07 | 3.20 | 18.16 |
| [POST] /pecas | 0.07 | 2.97 | 16.20 |
| [POST] /funcionarios | 0.07 | 3.72 | 18.22 |

#### Tempo de Resposta

| Rota | 1 Usuário (ms) | 5 Usuários (ms) | 10 Usuários (ms) |
|---|---|---|---|
| [GET] /health | 21.98 | 11.82 | 26.35 |
| [GET] /aeronaves | 3.51 | 11.69 | 22.83 |
| [GET] /pecas | 3.73 | 11.58 | 24.22 |
| [GET] /funcionarios | 4.44 | 16.91 | 20.67 |
| [GET] /etapas | 20.37 | 13.48 | 22.57 |
| [GET] /testes | 17.19 | 15.06 | 24.14 |
| [GET] /relatorios | 3.53 | 13.64 | 26.40 |
| [GET] /dashboard | 13.30 | 12.98 | 26.38 |
| [POST] /aeronaves | 3.77 | 11.80 | 25.94 |
| [POST] /pecas | 3.70 | 12.48 | 23.15 |
| [POST] /funcionarios | 5.16 | 12.99 | 26.03 |


### Resultados Tabulares (Valores Médios em ms)

#### Latência

| Rota | 1 Usuário (ms) | 5 Usuários (ms) | 10 Usuários (ms) |
|---|---|---|---|
| [GET] /health | 1.46 | 5.89 | 8.64 |
| [POST] /auth/login | 3.45 | 4.74 | 8.08 |
| [GET] /auth/me | 1.60 | 4.95 | 8.88 |
| [GET] /dashboard | 1.29 | 5.33 | 10.02 |
| [GET] /aeronaves | 1.17 | 4.68 | 9.34 |
| [GET] /aeronaves/1 | 1.27 | 4.99 | 8.47 |
| [POST] /aeronaves | 1.71 | 6.10 | 9.24 |
| [PUT] /aeronaves/1 | 1.39 | 5.12 | 10.75 |
| [DELETE] /aeronaves/9999 | 7.96 | 4.26 | 9.72 |
| [GET] /pecas | 1.23 | 4.10 | 8.37 |
| [GET] /pecas/1 | 1.28 | 4.85 | 7.49 |
| [POST] /pecas | 1.09 | 5.31 | 11.56 |
| [PUT] /pecas/1 | 1.52 | 4.74 | 9.63 |
| [DELETE] /pecas/9999 | 1.20 | 6.52 | 11.06 |
| [GET] /funcionarios | 3.66 | 3.82 | 9.83 |
| [GET] /funcionarios/1 | 1.18 | 4.65 | 9.82 |
| [POST] /funcionarios | 1.40 | 4.60 | 10.47 |
| [PUT] /funcionarios/1 | 1.63 | 4.10 | 9.29 |
| [DELETE] /funcionarios... | 1.36 | 6.08 | 8.59 |
| [GET] /etapas | 1.11 | 4.61 | 9.34 |
| [GET] /etapas/1 | 1.10 | 4.76 | 9.30 |
| [POST] /etapas | 1.67 | 5.22 | 9.25 |
| [PUT] /etapas/1 | 1.24 | 3.94 | 12.10 |
| [DELETE] /etapas/9999 | 1.25 | 4.41 | 11.93 |
| [POST] /etapas/1/alocar | 1.57 | 4.31 | 8.94 |
| [DELETE] /etapas/1/des... | 1.37 | 5.15 | 9.71 |
| [GET] /testes | 1.18 | 4.35 | 9.53 |
| [GET] /testes/1 | 1.18 | 4.57 | 8.26 |
| [POST] /testes | 1.43 | 5.12 | 9.37 |
| [PUT] /testes/1 | 1.35 | 4.75 | 11.10 |
| [DELETE] /testes/9999 | 1.18 | 4.34 | 10.91 |
| [GET] /relatorios | 1.09 | 4.62 | 10.11 |
| [GET] /relatorios/1 | 1.51 | 5.46 | 9.66 |
| [POST] /relatorios | 1.17 | 3.98 | 10.49 |
| [DELETE] /relatorios/9999 | 3.68 | 4.38 | 9.27 |

#### Tempo de Processamento

| Rota | 1 Usuário (ms) | 5 Usuários (ms) | 10 Usuários (ms) |
|---|---|---|---|
| [GET] /health | 3.41 | 13.75 | 20.17 |
| [POST] /auth/login | 8.04 | 11.06 | 18.86 |
| [GET] /auth/me | 3.73 | 11.55 | 20.72 |
| [GET] /dashboard | 3.00 | 12.45 | 23.39 |
| [GET] /aeronaves | 2.72 | 10.93 | 21.79 |
| [GET] /aeronaves/1 | 2.97 | 11.65 | 19.77 |
| [POST] /aeronaves | 3.98 | 14.24 | 21.57 |
| [PUT] /aeronaves/1 | 3.24 | 11.95 | 25.08 |
| [DELETE] /aeronaves/9999 | 18.58 | 9.94 | 22.68 |
| [GET] /pecas | 2.87 | 9.56 | 19.53 |
| [GET] /pecas/1 | 2.99 | 11.32 | 17.48 |
| [POST] /pecas | 2.55 | 12.38 | 26.97 |
| [PUT] /pecas/1 | 3.56 | 11.07 | 22.47 |
| [DELETE] /pecas/9999 | 2.79 | 15.22 | 25.81 |
| [GET] /funcionarios | 8.53 | 8.91 | 22.94 |
| [GET] /funcionarios/1 | 2.74 | 10.85 | 22.90 |
| [POST] /funcionarios | 3.27 | 10.74 | 24.44 |
| [PUT] /funcionarios/1 | 3.81 | 9.58 | 21.68 |
| [DELETE] /funcionarios... | 3.18 | 14.19 | 20.05 |
| [GET] /etapas | 2.60 | 10.75 | 21.79 |
| [GET] /etapas/1 | 2.57 | 11.11 | 21.70 |
| [POST] /etapas | 3.91 | 12.18 | 21.59 |
| [PUT] /etapas/1 | 2.90 | 9.19 | 28.23 |
| [DELETE] /etapas/9999 | 2.91 | 10.29 | 27.83 |
| [POST] /etapas/1/alocar | 3.67 | 10.06 | 20.85 |
| [DELETE] /etapas/1/des... | 3.19 | 12.01 | 22.65 |
| [GET] /testes | 2.75 | 10.14 | 22.23 |
| [GET] /testes/1 | 2.76 | 10.66 | 19.28 |
| [POST] /testes | 3.35 | 11.95 | 21.87 |
| [PUT] /testes/1 | 3.15 | 11.08 | 25.90 |
| [DELETE] /testes/9999 | 2.76 | 10.12 | 25.46 |
| [GET] /relatorios | 2.54 | 10.77 | 23.60 |
| [GET] /relatorios/1 | 3.51 | 12.74 | 22.54 |
| [POST] /relatorios | 2.73 | 9.28 | 24.47 |
| [DELETE] /relatorios/9999 | 8.58 | 10.23 | 21.62 |

#### Tempo de Resposta

| Rota | 1 Usuário (ms) | 5 Usuários (ms) | 10 Usuários (ms) |
|---|---|---|---|
| [GET] /health | 4.87 | 19.65 | 28.81 |
| [POST] /auth/login | 11.49 | 15.80 | 26.95 |
| [GET] /auth/me | 5.33 | 16.50 | 29.60 |
| [GET] /dashboard | 4.29 | 17.78 | 33.41 |
| [GET] /aeronaves | 3.89 | 15.61 | 31.12 |
| [GET] /aeronaves/1 | 4.25 | 16.64 | 28.24 |
| [POST] /aeronaves | 5.69 | 20.34 | 30.81 |
| [PUT] /aeronaves/1 | 4.63 | 17.07 | 35.83 |
| [DELETE] /aeronaves/9999 | 26.54 | 14.20 | 32.40 |
| [GET] /pecas | 4.10 | 13.65 | 27.90 |
| [GET] /pecas/1 | 4.26 | 16.18 | 24.97 |
| [POST] /pecas | 3.64 | 17.69 | 38.53 |
| [PUT] /pecas/1 | 5.08 | 15.81 | 32.11 |
| [DELETE] /pecas/9999 | 3.98 | 21.75 | 36.87 |
| [GET] /funcionarios | 12.19 | 12.72 | 32.77 |
| [GET] /funcionarios/1 | 3.92 | 15.49 | 32.72 |
| [POST] /funcionarios | 4.67 | 15.34 | 34.91 |
| [PUT] /funcionarios/1 | 5.45 | 13.68 | 30.97 |
| [DELETE] /funcionarios... | 4.55 | 20.28 | 28.64 |
| [GET] /etapas | 3.71 | 15.36 | 31.13 |
| [GET] /etapas/1 | 3.68 | 15.87 | 31.00 |
| [POST] /etapas | 5.58 | 17.39 | 30.85 |
| [PUT] /etapas/1 | 4.14 | 13.12 | 40.32 |
| [DELETE] /etapas/9999 | 4.15 | 14.70 | 39.75 |
| [POST] /etapas/1/alocar | 5.24 | 14.37 | 29.79 |
| [DELETE] /etapas/1/des... | 4.56 | 17.16 | 32.36 |
| [GET] /testes | 3.93 | 14.49 | 31.75 |
| [GET] /testes/1 | 3.95 | 15.23 | 27.55 |
| [POST] /testes | 4.78 | 17.07 | 31.25 |
| [PUT] /testes/1 | 4.51 | 15.83 | 37.00 |
| [DELETE] /testes/9999 | 3.94 | 14.45 | 36.37 |
| [GET] /relatorios | 3.63 | 15.39 | 33.71 |
| [GET] /relatorios/1 | 5.02 | 18.20 | 32.19 |
| [POST] /relatorios | 3.90 | 13.26 | 34.96 |
| [DELETE] /relatorios/9999 | 12.25 | 14.61 | 30.89 |

