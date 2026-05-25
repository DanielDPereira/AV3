import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import api from '../services/api';

// ── Enums de Permissão (espelhando o Prisma/Backend) ─────────────────────────
export enum NivelPermissao {
  ADMINISTRADOR = 'ADMINISTRADOR',
  ENGENHEIRO = 'ENGENHEIRO',
  OPERADOR = 'OPERADOR',
}

// ── Labels amigáveis para exibição ───────────────────────────────────────────
export const NivelPermissaoLabel: Record<NivelPermissao, string> = {
  [NivelPermissao.ADMINISTRADOR]: 'Administrador',
  [NivelPermissao.ENGENHEIRO]: 'Engenheiro',
  [NivelPermissao.OPERADOR]: 'Operador',
};

// ── Interface do Funcionário autenticado ──────────────────────────────────────
export interface UsuarioAutenticado {
  id: string;
  nome: string;
  usuario: string;
  telefone: string;
  endereco: string;
  nivelPermissao: NivelPermissao;
  foto?: string;
  token?: string;
}

// ── Banco de dados local (fallback enquanto API não está pronta) ─────────────
interface FuncionarioDB {
  id: string;
  nome: string;
  usuario: string;
  senha: string;
  telefone: string;
  endereco: string;
  nivelPermissao: NivelPermissao;
  foto?: string;
}

const funcionariosDB: FuncionarioDB[] = [
  {
    id: '1',
    nome: 'Daniel Dias',
    usuario: 'admin',
    senha: 'admin',
    telefone: '+55 11 98765-4321',
    endereco: 'Av. Paulista, 1000, São Paulo - SP',
    nivelPermissao: NivelPermissao.ADMINISTRADOR,
  },
  {
    id: '2',
    nome: 'Mariana Lima',
    usuario: 'engenheiro',
    senha: 'engenheiro',
    telefone: '+55 12 99123-4567',
    endereco: 'Rua das Bandeiras, 45, S.J. Campos - SP',
    nivelPermissao: NivelPermissao.ENGENHEIRO,
  },
  {
    id: '3',
    nome: 'Rafael Pereira',
    usuario: 'operador',
    senha: 'operador',
    telefone: '+55 11 97777-8888',
    endereco: 'Alameda Santos, 200, São Paulo - SP',
    nivelPermissao: NivelPermissao.OPERADOR,
  },
];

// ── Contexto de Autenticação ─────────────────────────────────────────────────
interface AuthContextType {
  usuario: UsuarioAutenticado | null;
  isAutenticado: boolean;
  fazerLogin: (login: string, senha: string) => Promise<{ sucesso: boolean; mensagem: string }>;
  fazerLogout: () => void;
  temPermissao: (niveisRequeridos: NivelPermissao[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => {
    const stored = sessionStorage.getItem('aerocode_usuario');
    if (stored) {
      try {
        return JSON.parse(stored) as UsuarioAutenticado;
      } catch {
        return null;
      }
    }
    return null;
  });

  const isAutenticado = usuario !== null;

  const fazerLogin = useCallback(async (login: string, senha: string): Promise<{ sucesso: boolean; mensagem: string }> => {
    // Tenta autenticação via API primeiro
    try {
      const response = await api.post('/api/auth/login', {
        usuario: login,
        senha: senha,
      });

      const { funcionario, token } = response.data;

      const usuarioAutenticado: UsuarioAutenticado = {
        id: funcionario.id.toString(),
        nome: funcionario.nome,
        usuario: funcionario.usuario,
        telefone: funcionario.telefone || '',
        endereco: funcionario.endereco || '',
        nivelPermissao: funcionario.nivelPermissao as NivelPermissao,
        foto: funcionario.foto,
        token,
      };

      setUsuario(usuarioAutenticado);
      sessionStorage.setItem('aerocode_token', token);
      sessionStorage.setItem('aerocode_usuario', JSON.stringify(usuarioAutenticado));

      return { sucesso: true, mensagem: `Bem-vindo, ${funcionario.nome}!` };
    } catch (apiError: any) {
      // Se a API retornou um erro (ex: 401 Credenciais, 429 Rate Limit)
      if (apiError.response && apiError.response.data && apiError.response.data.error) {
        return { sucesso: false, mensagem: apiError.response.data.error };
      }

      // Fallback para autenticação local APENAS se a API estiver fora do ar (Network Error)
      console.warn('API indisponível (offline), usando autenticação local:', apiError);

      const func = funcionariosDB.find(f => f.usuario === login);
      if (!func) {
        return { sucesso: false, mensagem: 'Credenciais inválidas. Usuário não encontrado.' };
      }
      if (func.senha !== senha) {
        return { sucesso: false, mensagem: 'Credenciais inválidas. Senha incorreta.' };
      }

      const usuarioAutenticado: UsuarioAutenticado = {
        id: func.id,
        nome: func.nome,
        usuario: func.usuario,
        telefone: func.telefone,
        endereco: func.endereco,
        nivelPermissao: func.nivelPermissao,
        foto: func.foto,
      };

      setUsuario(usuarioAutenticado);
      sessionStorage.setItem('aerocode_usuario', JSON.stringify(usuarioAutenticado));

      return { sucesso: true, mensagem: `Bem-vindo, ${func.nome}! (Modo Offline)` };
    }
  }, []);

  const fazerLogout = useCallback(() => {
    setUsuario(null);
    sessionStorage.removeItem('aerocode_token');
    sessionStorage.removeItem('aerocode_usuario');
  }, []);

  const temPermissao = useCallback((niveisRequeridos: NivelPermissao[]): boolean => {
    if (!usuario) return false;
    return niveisRequeridos.includes(usuario.nivelPermissao);
  }, [usuario]);

  return (
    <AuthContext.Provider value={{ usuario, isAutenticado, fazerLogin, fazerLogout, temPermissao }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook de acesso ao contexto ───────────────────────────────────────────────
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
