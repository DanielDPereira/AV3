// ═══════════════════════════════════════════════════════════
// CRUD de Funcionários — /api/funcionarios
// Rota restrita a ADMINISTRADOR
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';

export const funcionariosRouter = Router();
funcionariosRouter.use(autenticar);
funcionariosRouter.use(autorizar('ADMINISTRADOR'));

/** GET /api/funcionarios */
funcionariosRouter.get('/', async (_req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        nome: true,
        usuario: true,
        telefone: true,
        endereco: true,
        nivelPermissao: true,
        foto: true,
        ativo: true,
        criadoEm: true,
      },
    });
    res.json(funcionarios);
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ error: 'Erro ao listar funcionários' });
  }
});

/** GET /api/funcionarios/:id */
funcionariosRouter.get('/:id', async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true,
        nome: true,
        usuario: true,
        telefone: true,
        endereco: true,
        nivelPermissao: true,
        foto: true,
        ativo: true,
        criadoEm: true,
        etapasAlocadas: {
          include: { etapa: { include: { aeronave: { select: { codigo: true } } } } },
        },
      },
    });
    if (!funcionario) { res.status(404).json({ error: 'Funcionário não encontrado' }); return; }
    res.json(funcionario);
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    res.status(500).json({ error: 'Erro ao buscar funcionário' });
  }
});

/** POST /api/funcionarios */
funcionariosRouter.post('/', async (req, res) => {
  try {
    const { nome, usuario, senha, telefone, endereco, nivelPermissao } = req.body;

    if (!nome || !usuario || !senha) {
      res.status(400).json({ error: 'Campos obrigatórios: nome, usuario, senha' });
      return;
    }

    const existente = await prisma.funcionario.findUnique({ where: { usuario } });
    if (existente) {
      res.status(409).json({ error: `Usuário '${usuario}' já está em uso` });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const funcionario = await prisma.funcionario.create({
      data: {
        nome,
        usuario,
        senhaHash,
        telefone: telefone || null,
        endereco: endereco || null,
        nivelPermissao: nivelPermissao?.toUpperCase() || 'OPERADOR',
      },
      select: {
        id: true,
        nome: true,
        usuario: true,
        telefone: true,
        endereco: true,
        nivelPermissao: true,
        ativo: true,
      },
    });

    res.status(201).json(funcionario);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ error: 'Erro ao criar funcionário' });
  }
});

/** PUT /api/funcionarios/:id */
funcionariosRouter.put('/:id', async (req, res) => {
  try {
    const { nome, usuario, senha, telefone, endereco, nivelPermissao, ativo } = req.body;

    const data: any = {};
    if (nome) data.nome = nome;
    if (usuario) data.usuario = usuario;
    if (telefone !== undefined) data.telefone = telefone || null;
    if (endereco !== undefined) data.endereco = endereco || null;
    if (nivelPermissao) data.nivelPermissao = nivelPermissao.toUpperCase();
    if (ativo !== undefined) data.ativo = ativo;
    if (senha) data.senhaHash = await bcrypt.hash(senha, 10);

    const funcionario = await prisma.funcionario.update({
      where: { id: Number(req.params.id) },
      data,
      select: {
        id: true,
        nome: true,
        usuario: true,
        telefone: true,
        endereco: true,
        nivelPermissao: true,
        ativo: true,
      },
    });

    res.json(funcionario);
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Funcionário não encontrado' }); return; }
    if (error.code === 'P2002') { res.status(409).json({ error: 'Nome de usuário já está em uso' }); return; }
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
});

/** DELETE /api/funcionarios/:id */
funcionariosRouter.delete('/:id', async (req, res) => {
  try {
    // Soft delete — desativa em vez de excluir
    await prisma.funcionario.update({
      where: { id: Number(req.params.id) },
      data: { ativo: false },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') { res.status(404).json({ error: 'Funcionário não encontrado' }); return; }
    console.error('Erro ao desativar funcionário:', error);
    res.status(500).json({ error: 'Erro ao desativar funcionário' });
  }
});
