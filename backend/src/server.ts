// ═══════════════════════════════════════════════════════════
// Aerocode V3 — Express Server Entry Point
// ═══════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth.routes.js';
import { aeronavesRouter } from './routes/aeronaves.routes.js';
import { pecasRouter } from './routes/pecas.routes.js';
import { etapasRouter } from './routes/etapas.routes.js';
import { funcionariosRouter } from './routes/funcionarios.routes.js';
import { testesRouter } from './routes/testes.routes.js';
import { relatoriosRouter } from './routes/relatorios.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globais ──────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Aerocode API',
    version: '3.0.0',
    timestamp: new Date().toISOString() 
  });
});

// ── Rotas da API ─────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/aeronaves', aeronavesRouter);
app.use('/api/pecas', pecasRouter);
app.use('/api/etapas', etapasRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/testes', testesRouter);
app.use('/api/relatorios', relatoriosRouter);
app.use('/api/dashboard', dashboardRouter);

// ── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ── Error Handler global ─────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Erro não tratado:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ── Iniciar servidor ─────────────────────────────────────
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log(`✈️  Aerocode API v3.0.0`);
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════');
});

export default app;
