// ═══════════════════════════════════════════════════════════
// CRUD de Peças — /api/pecas
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { autenticar } from '../middlewares/auth.middleware.js';

export const pecasRouter = Router();
pecasRouter.use(autenticar);

/** GET /api/pecas */
pecasRouter.get('/', async (_req, res) => {
  try {
    const pecas = await prisma.peca.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { aeronave: { select: { codigo: true, modelo: true } } },
    });
    res.json(pecas);
  } catch (error) {
    console.error('Erro ao listar peças:', error);
    res.status(500).json({ error: 'Erro ao listar peças' });
  }
});

/** GET /api/pecas/:id */
pecasRouter.get('/:id', async (req, res) => {
  try {
    const peca = await prisma.peca.findUnique({
      where: { id: Number(req.params.id) },
      include: { aeronave: true },
    });
    if (!peca) { res.status(404).json({ error: 'Peça não encontrada' }); return; }
    res.json(peca);
  } catch (error) {
    console.error('Erro ao buscar peça:', error);
    res.status(500).json({ error: 'Erro ao buscar peça' });
  }
});

/** POST /api/pecas */
pecasRouter.post('/', async (req, res) => {
  try {
    const { nome, tipo, fornecedor, status, aeronaveId } = req.body;

    if (!nome || !tipo || !fornecedor) {
      res.status(400).json({ error: 'Campos obrigatórios: nome, tipo, fornecedor' });
      return;
    }

    const peca = await prisma.peca.create({
      data: {
        nome,
        tipo: tipo.toUpperCase(),
        fornecedor,
        ...(status && { status: status.toUpperCase() }),
        ...(aeronaveId && { aeronaveId: Number(aeronaveId) }),
      },
      include: { aeronave: { select: { codigo: true } } },
    });

    res.status(201).json(peca);
  } catch (error) {
    console.error('Erro ao criar peça:', error);
    res.status(500).json({ error: 'Erro ao criar peça' });
  }
});

/** PUT /api/pecas/:id */
pecasRouter.put('/:id', async (req, res) => {
  try {
    const { nome, tipo, fornecedor, status, aeronaveId } = req.body;

    const peca = await prisma.peca.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(nome && { nome }),
        ...(tipo && { tipo: tipo.toUpperCase() }),
        ...(fornecedor && { fornecedor }),
        ...(status && { status: status.toUpperCase() }),
        ...(aeronaveId !== undefined && { aeronaveId: aeronaveId ? Number(aeronaveId) : null }),
      },
      include: { aeronave: { select: { codigo: true } } },
    });

    res.json(peca);
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Peça não encontrada' }); return; }
    console.error('Erro ao atualizar peça:', error);
    res.status(500).json({ error: 'Erro ao atualizar peça' });
  }
});

/** DELETE /api/pecas/:id */
pecasRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.peca.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Peça não encontrada' }); return; }
    console.error('Erro ao excluir peça:', error);
    res.status(500).json({ error: 'Erro ao excluir peça' });
  }
});
