// ═══════════════════════════════════════════════════════════
// Rota de Autenticação — POST /api/auth/login
// ═══════════════════════════════════════════════════════════

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const authRouter = Router();

/**
 * Rate Limiting em Memória (Proteção Brute Force)
 * Bloqueia um IP se tentar logar mais de 5 vezes em 1 minuto.
 */
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();

const MAX_TENTATIVAS = 5;
const JANELA_TEMPO_MS = 60 * 1000; // 1 minuto

const loginRateLimiter = (req: any, res: any, next: any) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const userData = rateLimitCache.get(ip);

  if (userData) {
    if (now - userData.timestamp < JANELA_TEMPO_MS) {
      if (userData.count >= MAX_TENTATIVAS) {
        res.status(429).json({ error: 'Muitas tentativas de login. Tente novamente em 1 minuto.' });
        return;
      }
      userData.count++;
    } else {
      userData.count = 1;
      userData.timestamp = now;
    }
    rateLimitCache.set(ip, userData);
  } else {
    rateLimitCache.set(ip, { count: 1, timestamp: now });
  }
  next();
};

/**
 * POST /api/auth/login
 * Body: { usuario: string, senha: string }
 * Response: { funcionario, token }
 */
authRouter.post('/login', loginRateLimiter, async (req, res) => {
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

    // O MySQL busca sem diferenciar maiúsculas e minúsculas (case-insensitive).
    // Para forçar que o login seja case-sensitive, fazemos uma validação estrita no código:
    if (funcionario.usuario !== usuario) {
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
      { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any }
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
 * POST /api/auth/logout
 * Invalida a sessão do lado do cliente.
 * (JWT é stateless — o token é removido no frontend)
 */
authRouter.post('/logout', (_req, res) => {
  res.json({ mensagem: 'Logout realizado com sucesso.' });
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
