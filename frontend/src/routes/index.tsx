import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, NivelPermissao } from '../contexts/AuthContext';
import RotaProtegida from '../components/RotaProtegida';
import Login from '../pages/Login';
import Professor from '../pages/Professor';
import Dashboard from '../pages/Dashboard';
import Aeronaves from '../pages/Aeronaves';
import Etapas from '../pages/Etapas';
import Pecas from '../pages/Pecas';
import Funcionarios from '../pages/Funcionarios';
import Relatorios from '../pages/Relatorios';
import Testes from '../pages/Testes';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/professor" element={<Professor />} />

          {/* Rotas protegidas — qualquer funcionário autenticado */}
          <Route path="/dashboard" element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          } />
          <Route path="/aeronaves" element={
            <RotaProtegida>
              <Aeronaves />
            </RotaProtegida>
          } />
          <Route path="/pecas" element={
            <RotaProtegida>
              <Pecas />
            </RotaProtegida>
          } />
          <Route path="/etapas" element={
            <RotaProtegida>
              <Etapas />
            </RotaProtegida>
          } />
          <Route path="/testes" element={
            <RotaProtegida>
              <Testes />
            </RotaProtegida>
          } />
          <Route path="/relatorios" element={
            <RotaProtegida>
              <Relatorios />
            </RotaProtegida>
          } />

          {/* Rota exclusiva do ADMINISTRADOR — Controle de Colaboradores */}
          <Route path="/funcionarios" element={
            <RotaProtegida niveisPermitidos={[NivelPermissao.ADMINISTRADOR]}>
              <Funcionarios />
            </RotaProtegida>
          } />

          {/* Qualquer outra rota → redireciona para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
