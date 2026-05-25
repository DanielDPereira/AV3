// ═══════════════════════════════════════════════════════════
// Dashboard — /api/dashboard
// Estatísticas agregadas do sistema
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { autenticar } from '../middlewares/auth.middleware.js';

export const dashboardRouter = Router();
dashboardRouter.use(autenticar);

/** GET /api/dashboard/stats — Contadores do sistema */
dashboardRouter.get('/stats', async (_req, res) => {
  try {
    const [aircrafts, parts, stages, tests] = await Promise.all([
      prisma.aeronave.count(),
      prisma.peca.count(),
      prisma.etapa.count(),
      prisma.teste.count(),
    ]);

    res.json({ aircrafts, parts, stages, tests });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

/** GET /api/dashboard/recent-aircrafts — Últimas aeronaves */
dashboardRouter.get('/recent-aircrafts', async (_req, res) => {
  try {
    const aeronaves = await prisma.aeronave.findMany({
      take: 5,
      orderBy: { criadoEm: 'desc' },
      include: {
        etapas: {
          take: 1,
          orderBy: { criadoEm: 'desc' },
          select: { nome: true, status: true },
        },
      },
    });

    // Transforma para o formato esperado pelo frontend
    const result = aeronaves.map((a: any) => ({
      id: String(a.id),
      identifier: a.codigo,
      model: a.modelo,
      currentPhase: a.etapas[0]?.nome || 'Sem etapa',
      status: a.etapas[0]?.status === 'CONCLUIDA'
        ? 'Concluído'
        : a.etapas[0]?.status === 'EM_ANDAMENTO'
          ? 'Em Produção'
          : 'Revisão',
    }));

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar aeronaves recentes:', error);
    res.status(500).json({ error: 'Erro ao buscar aeronaves recentes' });
  }
});
