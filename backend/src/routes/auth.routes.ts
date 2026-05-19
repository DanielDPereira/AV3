// ═══════════════════════════════════════════════════════════
// Rota de Autenticação — POST /api/auth/login
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const authRouter = Router();

/**
 * POST /api/auth/login
 * Body: { usuario: string, senha: string }
 * Response: { funcionario, token }
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
      return;
    }

    // Busca funcionário pelo login
    const funcionario = await prisma.funcionario.findUnique({
      where: { usuario },
    });

    if (!funcionario || !funcionario.ativo) {
      res.status(401).json({ error: 'Credenciais inválidas. Usuário não encontrado.' });
      return;
    }

    // Verifica senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, funcionario.senhaHash);
    if (!senhaValida) {
      res.status(401).json({ error: 'Credenciais inválidas. Senha incorreta.' });
      return;
    }

    // Gera token JWT
    const token = jwt.sign(
      {
        id: funcionario.id,
        usuario: funcionario.usuario,
        nivelPermissao: funcionario.nivelPermissao,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Retorna dados do funcionário (sem a senha)
    res.json({
      funcionario: {
        id: funcionario.id,
        nome: funcionario.nome,
        usuario: funcionario.usuario,
        telefone: funcionario.telefone,
        endereco: funcionario.endereco,
        nivelPermissao: funcionario.nivelPermissao,
        foto: funcionario.foto,
      },
      token,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Response: { funcionario }
 */
authRouter.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { id: number };

    const funcionario = await prisma.funcionario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nome: true,
        usuario: true,
        telefone: true,
        endereco: true,
        nivelPermissao: true,
        foto: true,
      },
    });

    if (!funcionario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json({ funcionario });
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});
