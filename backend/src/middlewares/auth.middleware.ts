// ═══════════════════════════════════════════════════════════
// Middleware de Autenticação JWT
// ═══════════════════════════════════════════════════════════

import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  usuario: string;
  nivelPermissao: string;
}

// Estende o Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware que valida o token JWT no header Authorization.
 * Popula req.user com os dados decodificados do token.
 */
export const autenticar = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

/**
 * Middleware de autorização por nível de permissão.
 * Deve ser usado APÓS o middleware `autenticar`.
 */
export const autorizar = (...niveisPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!niveisPermitidos.includes(req.user.nivelPermissao)) {
      res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      return;
    }

    next();
  };
};
