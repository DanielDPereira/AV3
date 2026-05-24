// ═══════════════════════════════════════════════════════════
// CRUD de Relatórios — /api/relatorios
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';

export const relatoriosRouter = Router();
relatoriosRouter.use(autenticar);

/** GET /api/relatorios */
relatoriosRouter.get('/', async (_req, res) => {
  try {
    const relatorios = await prisma.relatorio.findMany({
      orderBy: { dataGeracao: 'desc' },
      include: { aeronave: { select: { codigo: true, modelo: true } } },
    });
    res.json(relatorios);
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({ error: 'Erro ao listar relatórios' });
  }
});

/** GET /api/relatorios/:id */
relatoriosRouter.get('/:id', async (req, res) => {
  try {
    const relatorio = await prisma.relatorio.findUnique({
      where: { id: Number(req.params.id) },
      include: { aeronave: true },
    });
    if (!relatorio) { res.status(404).json({ error: 'Relatório não encontrado' }); return; }
    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    res.status(500).json({ error: 'Erro ao buscar relatório' });
  }
});

/** POST /api/relatorios — Gera relatório para uma aeronave */
relatoriosRouter.post('/', autorizar('ADMINISTRADOR', 'ENGENHEIRO'), async (req, res) => {
  try {
    const { aeronaveId } = req.body;

    if (!aeronaveId) {
      res.status(400).json({ error: 'aeronaveId é obrigatório' });
      return;
    }

    // Busca a aeronave com todas as relações para gerar o conteúdo
    const aeronave = await prisma.aeronave.findUnique({
      where: { id: Number(aeronaveId) },
      include: {
        pecas: true,
        etapas: {
          include: {
            funcionarios: { include: { funcionario: { select: { nome: true } } } },
          },
        },
        testes: true,
      },
    });

    if (!aeronave) {
      res.status(404).json({ error: 'Aeronave não encontrada' });
      return;
    }

    // Monta conteúdo do relatório em formato texto
    const linhas: string[] = [
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
      `── Gerado em: ${new Date().toISOString()} ──`,
    ];

    const relatorio = await prisma.relatorio.create({
      data: {
        nomeArquivo: `relatorio_${aeronave.codigo}_${Date.now()}.txt`,
        aeronaveId: aeronave.id,
        conteudo: linhas.join('\n'),
      },
      include: { aeronave: { select: { codigo: true } } },
    });

    res.status(201).json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

/** GET /api/relatorios/:id/download — Download do relatório em TXT */
relatoriosRouter.get('/:id/download', async (req, res) => {
  try {
    const relatorio = await prisma.relatorio.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!relatorio) {
      res.status(404).json({ error: 'Relatório não encontrado' });
      return;
    }

    const conteudo = relatorio.conteudo || 'Relatório sem conteúdo.';
    const nomeArquivo = relatorio.nomeArquivo || `relatorio_${relatorio.id}.txt`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
    res.send(conteudo);
  } catch (error) {
    console.error('Erro ao baixar relatório:', error);
    res.status(500).json({ error: 'Erro ao baixar relatório' });
  }
});

/** DELETE /api/relatorios/:id */
relatoriosRouter.delete('/:id', autorizar('ADMINISTRADOR'), async (req, res) => {
  try {
    await prisma.relatorio.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Relatório não encontrado' }); return; }
    console.error('Erro ao excluir relatório:', error);
    res.status(500).json({ error: 'Erro ao excluir relatório' });
  }
});
