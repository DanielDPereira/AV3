// ═══════════════════════════════════════════════════════════
// CRUD de Etapas — /api/etapas
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { autenticar } from '../middlewares/auth.middleware.js';

export const etapasRouter = Router();
etapasRouter.use(autenticar);

/** GET /api/etapas */
etapasRouter.get('/', async (_req, res) => {
  try {
    const etapas = await prisma.etapa.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        aeronave: { select: { codigo: true, modelo: true } },
        funcionarios: {
          include: { funcionario: { select: { id: true, nome: true, usuario: true } } },
        },
      },
    });
    res.json(etapas);
  } catch (error) {
    console.error('Erro ao listar etapas:', error);
    res.status(500).json({ error: 'Erro ao listar etapas' });
  }
});

/** GET /api/etapas/:id */
etapasRouter.get('/:id', async (req, res) => {
  try {
    const etapa = await prisma.etapa.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        aeronave: true,
        funcionarios: { include: { funcionario: true } },
      },
    });
    if (!etapa) { res.status(404).json({ error: 'Etapa não encontrada' }); return; }
    res.json(etapa);
  } catch (error) {
    console.error('Erro ao buscar etapa:', error);
    res.status(500).json({ error: 'Erro ao buscar etapa' });
  }
});

/** POST /api/etapas */
etapasRouter.post('/', async (req, res) => {
  try {
    const { nome, prazo, status, aeronaveId, funcionarioIds } = req.body;

    if (!nome || !prazo || !aeronaveId) {
      res.status(400).json({ error: 'Campos obrigatórios: nome, prazo, aeronaveId' });
      return;
    }

    const etapa = await prisma.etapa.create({
      data: {
        nome,
        prazo: new Date(prazo),
        ...(status && { status: status.toUpperCase() }),
        aeronaveId: Number(aeronaveId),
        ...(funcionarioIds?.length && {
          funcionarios: {
            create: funcionarioIds.map((fId: number) => ({
              funcionarioId: fId,
            })),
          },
        }),
      },
      include: {
        aeronave: { select: { codigo: true } },
        funcionarios: { include: { funcionario: { select: { id: true, nome: true } } } },
      },
    });

    res.status(201).json(etapa);
  } catch (error) {
    console.error('Erro ao criar etapa:', error);
    res.status(500).json({ error: 'Erro ao criar etapa' });
  }
});

/** PUT /api/etapas/:id */
etapasRouter.put('/:id', async (req, res) => {
  try {
    const { nome, prazo, status, aeronaveId } = req.body;

    const etapa = await prisma.etapa.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(nome && { nome }),
        ...(prazo && { prazo: new Date(prazo) }),
        ...(status && { status: status.toUpperCase() }),
        ...(aeronaveId && { aeronaveId: Number(aeronaveId) }),
      },
      include: {
        aeronave: { select: { codigo: true } },
        funcionarios: { include: { funcionario: { select: { id: true, nome: true } } } },
      },
    });

    res.json(etapa);
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Etapa não encontrada' }); return; }
    console.error('Erro ao atualizar etapa:', error);
    res.status(500).json({ error: 'Erro ao atualizar etapa' });
  }
});

/** PUT /api/etapas/:id/funcionarios — Sincronizar alocação (substitui todos) */
etapasRouter.put('/:id/funcionarios', async (req, res) => {
  try {
    const etapaId = Number(req.params.id);
    const { funcionarioIds } = req.body;
    if (!Array.isArray(funcionarioIds)) {
      res.status(400).json({ error: 'funcionarioIds deve ser um array' });
      return;
    }

    // Remove todos e re-cria
    await prisma.etapaFuncionario.deleteMany({ where: { etapaId } });
    if (funcionarioIds.length > 0) {
      await prisma.etapaFuncionario.createMany({
        data: funcionarioIds.map((fId: number) => ({ etapaId, funcionarioId: fId })),
        skipDuplicates: true,
      });
    }

    const etapa = await prisma.etapa.findUnique({
      where: { id: etapaId },
      include: {
        funcionarios: { include: { funcionario: { select: { id: true, nome: true } } } },
      },
    });

    res.json(etapa);
  } catch (error) {
    console.error('Erro ao sincronizar funcionários:', error);
    res.status(500).json({ error: 'Erro ao sincronizar funcionários' });
  }
});

/** POST /api/etapas/:id/funcionarios — Alocar funcionário */
etapasRouter.post('/:id/funcionarios', async (req, res) => {
  try {
    const { funcionarioId } = req.body;
    if (!funcionarioId) {
      res.status(400).json({ error: 'funcionarioId é obrigatório' });
      return;
    }

    await prisma.etapaFuncionario.create({
      data: {
        etapaId: Number(req.params.id),
        funcionarioId: Number(funcionarioId),
      },
    });

    const etapa = await prisma.etapa.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        funcionarios: { include: { funcionario: { select: { id: true, nome: true } } } },
      },
    });

    res.status(201).json(etapa);
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(409).json({ error: 'Funcionário já alocado nesta etapa' }); return; }
    console.error('Erro ao alocar funcionário:', error);
    res.status(500).json({ error: 'Erro ao alocar funcionário' });
  }
});

/** DELETE /api/etapas/:id/funcionarios/:funcId — Desalocar funcionário */
etapasRouter.delete('/:id/funcionarios/:funcId', async (req, res) => {
  try {
    await prisma.etapaFuncionario.delete({
      where: {
        etapaId_funcionarioId: {
          etapaId: Number(req.params.id),
          funcionarioId: Number(req.params.funcId),
        },
      },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Alocação não encontrada' }); return; }
    console.error('Erro ao desalocar funcionário:', error);
    res.status(500).json({ error: 'Erro ao desalocar funcionário' });
  }
});

/** DELETE /api/etapas/:id */
etapasRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.etapa.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Etapa não encontrada' }); return; }
    console.error('Erro ao excluir etapa:', error);
    res.status(500).json({ error: 'Erro ao excluir etapa' });
  }
});
