import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type NivelPermissao } from '../../contexts/AuthContext';

interface RotaProtegidaProps {
  children: React.ReactNode;
  niveisPermitidos?: NivelPermissao[];
}

/**
 * Componente de proteção de rotas.
 * 
 * - Se o usuário NÃO está autenticado → redireciona para /login
 * - Se niveisPermitidos é fornecido e o usuário NÃO tem o nível → redireciona para /dashboard
 * - Se está autenticado e tem permissão → renderiza o children
 */
const RotaProtegida: React.FC<RotaProtegidaProps> = ({ children, niveisPermitidos }) => {
  const { isAutenticado, temPermissao } = useAuth();
  const location = useLocation();

  // Se não está autenticado, redireciona para login preservando a rota de origem
  if (!isAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se há restrição de nível e o usuário não tem permissão
  if (niveisPermitidos && !temPermissao(niveisPermitidos)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RotaProtegida;
