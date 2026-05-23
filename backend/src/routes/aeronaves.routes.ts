// ═══════════════════════════════════════════════════════════
// CRUD de Aeronaves — /api/aeronaves
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';

export const aeronavesRouter = Router();

// Todas as rotas requerem autenticação
aeronavesRouter.use(autenticar);

/** GET /api/aeronaves — Listar todas */
aeronavesRouter.get('/', async (_req, res) => {
  try {
    const aeronaves = await prisma.aeronave.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        _count: { select: { pecas: true, etapas: true, testes: true } },
      },
    });
    res.json(aeronaves);
  } catch (error) {
    console.error('Erro ao listar aeronaves:', error);
    res.status(500).json({ error: 'Erro ao listar aeronaves' });
  }
});

/** GET /api/aeronaves/:id — Buscar por ID */
aeronavesRouter.get('/:id', async (req, res) => {
  try {
    const aeronave = await prisma.aeronave.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        pecas: true,
        etapas: { include: { funcionarios: { include: { funcionario: true } } } },
        testes: true,
        relatorios: true,
      },
    });

    if (!aeronave) {
      res.status(404).json({ error: 'Aeronave não encontrada' });
      return;
    }

    res.json(aeronave);
  } catch (error) {
    console.error('Erro ao buscar aeronave:', error);
    res.status(500).json({ error: 'Erro ao buscar aeronave' });
  }
});

/** POST /api/aeronaves — Criar nova */
aeronavesRouter.post('/', autorizar('ADMINISTRADOR', 'ENGENHEIRO'), async (req, res) => {
  try {
    const { codigo, modelo, tipo, capacidade, alcance } = req.body;

    if (!codigo || !modelo || !tipo || capacidade == null || alcance == null) {
      res.status(400).json({ error: 'Todos os campos são obrigatórios: codigo, modelo, tipo, capacidade, alcance' });
      return;
    }

    const existente = await prisma.aeronave.findUnique({ where: { codigo } });
    if (existente) {
      res.status(409).json({ error: `Aeronave com código '${codigo}' já existe` });
      return;
    }

    const aeronave = await prisma.aeronave.create({
      data: {
        codigo,
        modelo,
        tipo: tipo.toUpperCase(),
        capacidade: Number(capacidade),
        alcance: Number(alcance),
      },
    });

    res.status(201).json(aeronave);
  } catch (error) {
    console.error('Erro ao criar aeronave:', error);
    res.status(500).json({ error: 'Erro ao criar aeronave' });
  }
});

/** PUT /api/aeronaves/:id — Atualizar */
aeronavesRouter.put('/:id', autorizar('ADMINISTRADOR', 'ENGENHEIRO'), async (req, res) => {
  try {
    const { codigo, modelo, tipo, capacidade, alcance } = req.body;

    const aeronave = await prisma.aeronave.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(codigo && { codigo }),
        ...(modelo && { modelo }),
        ...(tipo && { tipo: tipo.toUpperCase() }),
        ...(capacidade != null && { capacidade: Number(capacidade) }),
        ...(alcance != null && { alcance: Number(alcance) }),
      },
    });

    res.json(aeronave);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Aeronave não encontrada' });
      return;
    }
    console.error('Erro ao atualizar aeronave:', error);
    res.status(500).json({ error: 'Erro ao atualizar aeronave' });
  }
});

/** DELETE /api/aeronaves/:id — Excluir */
aeronavesRouter.delete('/:id', autorizar('ADMINISTRADOR'), async (req, res) => {
  try {
    await prisma.aeronave.delete({
      where: { id: Number(req.params.id) },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Aeronave não encontrada' });
      return;
    }
    console.error('Erro ao excluir aeronave:', error);
    res.status(500).json({ error: 'Erro ao excluir aeronave' });
  }
});
