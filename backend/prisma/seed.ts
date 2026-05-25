// ═══════════════════════════════════════════════════════════
// Aerocode V3 — Database Seed
// Popula o banco com dados iniciais para desenvolvimento.
// Espelhando os dados mockados do frontend AV2.
// ═══════════════════════════════════════════════════════════

import { PrismaClient, NivelPermissao, TipoAeronave, TipoPeca, StatusPeca, StatusEtapa, TipoTeste, ResultadoTeste } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados Aerocode...\n');

  // ── 1. Funcionários ────────────────────────────────────
  console.log('👤 Criando funcionários...');
  const senhaHash = await bcrypt.hash('admin', 10);
  const senhaEngenheiro = await bcrypt.hash('engenheiro', 10);
  const senhaOperador = await bcrypt.hash('operador', 10);

  const admin = await prisma.funcionario.upsert({
    where: { usuario: 'admin' },
    update: {},
    create: {
      nome: 'Daniel Dias',
      usuario: 'admin',
      senhaHash: senhaHash,
      telefone: '+55 11 98765-4321',
      endereco: 'Av. Paulista, 1000, São Paulo - SP',
      nivelPermissao: NivelPermissao.ADMINISTRADOR,
    },
  });

  const engenheira = await prisma.funcionario.upsert({
    where: { usuario: 'engenheiro' },
    update: {},
    create: {
      nome: 'Mariana Lima',
      usuario: 'engenheiro',
      senhaHash: senhaEngenheiro,
      telefone: '+55 12 99123-4567',
      endereco: 'Rua das Bandeiras, 45, S.J. Campos - SP',
      nivelPermissao: NivelPermissao.ENGENHEIRO,
    },
  });

  const operador = await prisma.funcionario.upsert({
    where: { usuario: 'operador' },
    update: {},
    create: {
      nome: 'Rafael Pereira',
      usuario: 'operador',
      senhaHash: senhaOperador,
      telefone: '+55 11 97777-8888',
      endereco: 'Alameda Santos, 200, São Paulo - SP',
      nivelPermissao: NivelPermissao.OPERADOR,
    },
  });

  const engenheira2 = await prisma.funcionario.upsert({
    where: { usuario: 'ana.souza' },
    update: {},
    create: {
      nome: 'Ana Souza',
      usuario: 'ana.souza',
      senhaHash: await bcrypt.hash('ana123', 10),
      telefone: '+55 19 98888-1111',
      endereco: 'Rodovia Anhanguera Km 98, Campinas - SP',
      nivelPermissao: NivelPermissao.ENGENHEIRO,
    },
  });

  console.log(`  ✅ ${admin.nome} (Admin)`);
  console.log(`  ✅ ${engenheira.nome} (Engenheiro)`);
  console.log(`  ✅ ${operador.nome} (Operador)`);
  console.log(`  ✅ ${engenheira2.nome} (Engenheiro)\n`);

  // ── 2. Aeronaves ───────────────────────────────────────
  console.log('✈️  Criando aeronaves...');

  const aero1 = await prisma.aeronave.upsert({
    where: { codigo: 'AC-737-MAX' },
    update: {},
    create: {
      codigo: 'AC-737-MAX',
      modelo: 'Boeing 737 MAX 8',
      tipo: TipoAeronave.COMERCIAL,
      capacidade: 186,
      alcance: 6570,
    },
  });

  const aero2 = await prisma.aeronave.upsert({
    where: { codigo: 'AC-A320-NEO' },
    update: {},
    create: {
      codigo: 'AC-A320-NEO',
      modelo: 'Airbus A320neo',
      tipo: TipoAeronave.COMERCIAL,
      capacidade: 195,
      alcance: 6300,
    },
  });

  const aero3 = await prisma.aeronave.upsert({
    where: { codigo: 'AC-C130-J' },
    update: {},
    create: {
      codigo: 'AC-C130-J',
      modelo: 'Lockheed C-130J',
      tipo: TipoAeronave.MILITAR,
      capacidade: 128,
      alcance: 3334,
    },
  });

  const aero4 = await prisma.aeronave.upsert({
    where: { codigo: 'AC-E195-E2' },
    update: {},
    create: {
      codigo: 'AC-E195-E2',
      modelo: 'Embraer E195-E2',
      tipo: TipoAeronave.COMERCIAL,
      capacidade: 146,
      alcance: 4815,
    },
  });

  console.log(`  ✅ ${aero1.codigo} — ${aero1.modelo}`);
  console.log(`  ✅ ${aero2.codigo} — ${aero2.modelo}`);
  console.log(`  ✅ ${aero3.codigo} — ${aero3.modelo}`);
  console.log(`  ✅ ${aero4.codigo} — ${aero4.modelo}\n`);

  // ── 3. Peças ───────────────────────────────────────────
  console.log('🔩 Criando peças...');

  await prisma.peca.createMany({
    data: [
      { nome: 'Turbina Axial X-100', tipo: TipoPeca.IMPORTADA, fornecedor: 'AeroEngines Corp', status: StatusPeca.EM_TRANSPORTE, aeronaveId: aero1.id },
      { nome: 'Painel Fuselagem Lat-A', tipo: TipoPeca.NACIONAL, fornecedor: 'Metalúrgica Sul', status: StatusPeca.EM_PRODUCAO, aeronaveId: aero3.id },
      { nome: 'Trem de Pouso Dianteiro', tipo: TipoPeca.IMPORTADA, fornecedor: 'Global Gear', status: StatusPeca.PRONTA, aeronaveId: aero4.id },
      { nome: 'Assento Comando Piloto', tipo: TipoPeca.NACIONAL, fornecedor: 'AeroInteriores', status: StatusPeca.PRONTA, aeronaveId: aero2.id },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ 4 peças criadas\n');

  // ── 4. Etapas ──────────────────────────────────────────
  console.log('📋 Criando etapas...');

  const etapa1 = await prisma.etapa.create({
    data: {
      nome: 'Usinagem do Eixo Principal',
      prazo: new Date('2023-10-12'),
      status: StatusEtapa.EM_ANDAMENTO,
      aeronaveId: aero1.id,
    },
  });

  await prisma.etapa.create({
    data: {
      nome: 'Inspeção de Turbina',
      prazo: new Date('2023-10-15'),
      status: StatusEtapa.PENDENTE,
      aeronaveId: aero2.id,
    },
  });

  await prisma.etapa.create({
    data: {
      nome: 'Soldagem Estrutural Asa Esq.',
      prazo: new Date('2023-10-08'),
      status: StatusEtapa.CONCLUIDA,
      aeronaveId: aero3.id,
    },
  });

  await prisma.etapa.create({
    data: {
      nome: 'Calibração de Sensores Nav.',
      prazo: new Date('2023-10-10'),
      status: StatusEtapa.PENDENTE,
      aeronaveId: aero4.id,
    },
  });

  // Alocar funcionários na etapa 1
  await prisma.etapaFuncionario.createMany({
    data: [
      { etapaId: etapa1.id, funcionarioId: engenheira.id },
      { etapaId: etapa1.id, funcionarioId: engenheira2.id },
    ],
    skipDuplicates: true,
  });

  console.log('  ✅ 4 etapas criadas (2 funcionários alocados)\n');

  // ── 5. Testes ──────────────────────────────────────────
  console.log('🧪 Criando testes...');

  await prisma.teste.createMany({
    data: [
      { tipo: TipoTeste.ELETRICO, resultado: ResultadoTeste.APROVADO, aeronaveId: aero1.id },
      { tipo: TipoTeste.HIDRAULICO, resultado: ResultadoTeste.REPROVADO, aeronaveId: aero3.id },
      { tipo: TipoTeste.AERODINAMICO, resultado: ResultadoTeste.APROVADO, aeronaveId: aero4.id },
      { tipo: TipoTeste.ELETRICO, resultado: ResultadoTeste.APROVADO, aeronaveId: aero2.id },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ 4 testes criados\n');

  // ── 6. Relatórios ──────────────────────────────────────
  console.log('📊 Criando relatórios...');

  const aeronavesCriadas = await prisma.aeronave.findMany({
    include: {
      pecas: true,
      etapas: {
        include: { funcionarios: { include: { funcionario: { select: { nome: true } } } } }
      },
      testes: true,
    }
  });

  const dataISO = new Date().toISOString();

  const dataRelatorios = aeronavesCriadas.map(aeronave => {
    const linhas = [
      `══════════════════════════════════════`,
      `  RELATÓRIO DA AERONAVE: ${aeronave.codigo}`,
      `  Modelo: ${aeronave.modelo}`,
      `  Tipo: ${aeronave.tipo} | Capacidade: ${aeronave.capacidade} | Alcance: ${aeronave.alcance}km`,
      `══════════════════════════════════════`,
      ``,
      `── PEÇAS (${aeronave.pecas.length}) ──────────────`,
      ...aeronave.pecas.map(p => `  • ${p.nome} [${p.tipo}] — ${p.fornecedor} — Status: ${p.status}`),
      ``,
      `── ETAPAS (${aeronave.etapas.length}) ─────────────`,
      ...aeronave.etapas.map(e => {
        const funcionarios = e.funcionarios.map(f => f.funcionario.nome).join(', ') || 'Sem alocação';
        return `  • ${e.nome} — ${e.status} — Prazo: ${e.prazo.toISOString().split('T')[0]} — Responsáveis: ${funcionarios}`;
      }),
      ``,
      `── TESTES (${aeronave.testes.length}) ─────────────`,
      ...aeronave.testes.map(t => `  • ${t.tipo} — Resultado: ${t.resultado}`),
      ``,
      `── Gerado em: ${dataISO} ──`,
    ];

    return {
      nomeArquivo: `relatorio_${aeronave.codigo}.txt`,
      aeronaveId: aeronave.id,
      conteudo: linhas.join('\n'),
    };
  });

  await prisma.relatorio.createMany({
    data: dataRelatorios,
    skipDuplicates: true,
  });
  console.log('  ✅ 4 relatórios criados\n');

  console.log('═══════════════════════════════════════════');
  console.log('✨ Seed concluído com sucesso!');
  console.log('═══════════════════════════════════════════');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
