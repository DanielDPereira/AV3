// ═══════════════════════════════════════════════════════════
// CRUD de Testes — /api/testes
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { autenticar } from '../middlewares/auth.middleware.js';

export const testesRouter = Router();
testesRouter.use(autenticar);

/** GET /api/testes */
testesRouter.get('/', async (_req, res) => {
  try {
    const testes = await prisma.teste.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { aeronave: { select: { codigo: true, modelo: true } } },
    });
    res.json(testes);
  } catch (error) {
    console.error('Erro ao listar testes:', error);
    res.status(500).json({ error: 'Erro ao listar testes' });
  }
});

/** GET /api/testes/:id */
testesRouter.get('/:id', async (req, res) => {
  try {
    const teste = await prisma.teste.findUnique({
      where: { id: Number(req.params.id) },
      include: { aeronave: true },
    });
    if (!teste) { res.status(404).json({ error: 'Teste não encontrado' }); return; }
    res.json(teste);
  } catch (error) {
    console.error('Erro ao buscar teste:', error);
    res.status(500).json({ error: 'Erro ao buscar teste' });
  }
});

/** POST /api/testes */
testesRouter.post('/', async (req, res) => {
  try {
    const { tipo, resultado, aeronaveId } = req.body;

    if (!tipo || !resultado) {
      res.status(400).json({ error: 'Campos obrigatórios: tipo, resultado' });
      return;
    }

    const teste = await prisma.teste.create({
      data: {
        tipo: tipo.toUpperCase(),
        resultado: resultado.toUpperCase(),
        ...(aeronaveId && { aeronaveId: Number(aeronaveId) }),
      },
      include: { aeronave: { select: { codigo: true } } },
    });

    res.status(201).json(teste);
  } catch (error) {
    console.error('Erro ao criar teste:', error);
    res.status(500).json({ error: 'Erro ao criar teste' });
  }
});

/** PUT /api/testes/:id */
testesRouter.put('/:id', async (req, res) => {
  try {
    const { tipo, resultado, aeronaveId } = req.body;

    const teste = await prisma.teste.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(tipo && { tipo: tipo.toUpperCase() }),
        ...(resultado && { resultado: resultado.toUpperCase() }),
        ...(aeronaveId !== undefined && { aeronaveId: aeronaveId ? Number(aeronaveId) : null }),
      },
      include: { aeronave: { select: { codigo: true } } },
    });

    res.json(teste);
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Teste não encontrado' }); return; }
    console.error('Erro ao atualizar teste:', error);
    res.status(500).json({ error: 'Erro ao atualizar teste' });
  }
});

/** DELETE /api/testes/:id */
testesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.teste.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Teste não encontrado' }); return; }
    console.error('Erro ao excluir teste:', error);
    res.status(500).json({ error: 'Erro ao excluir teste' });
  }
});
