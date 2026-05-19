import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { fazerLogin, isAutenticado } = useAuth();
  
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Se já está autenticado, redireciona direto para o dashboard
  React.useEffect(() => {
    if (isAutenticado) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAutenticado, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setIsLoading(true);

    const resultado = await fazerLogin(loginInput, senhaInput);

    if (resultado.sucesso) {
      navigate('/dashboard');
    } else {
      setErro(resultado.mensagem);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-md">
      <main className="w-full max-w-[400px] bg-surface rounded-xl border border-surface-variant p-xl">
        <div className="mb-xl flex flex-col items-center">
          <h1 className="font-h1 text-h1 text-primary tracking-tighter uppercase">Aerocode</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Sistema de Gestão Industrial</p>
        </div>
        
        {/* Mensagem de Erro */}
        {erro && (
          <div className="mb-lg p-sm bg-error-container border border-error rounded text-on-error-container font-body-sm text-body-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{erro}</span>
          </div>
        )}

        <form className="space-y-lg" onSubmit={handleLogin}>
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="username">
              Usuário
            </label>
            <input 
              className="w-full bg-surface border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface py-sm px-md outline-none transition-all" 
              id="username" 
              name="username" 
              placeholder="Usuário" 
              type="text" 
              value={loginInput}
              onChange={(e) => { setLoginInput(e.target.value); setErro(''); }}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="password">
              Senha
            </label>
            <input 
              className="w-full bg-surface border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface py-sm px-md outline-none transition-all" 
              id="password" 
              name="password" 
              placeholder="Senha" 
              type="password" 
              value={senhaInput}
              onChange={(e) => { setSenhaInput(e.target.value); setErro(''); }}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <div className="pt-sm">
            <button 
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-[12px] px-lg rounded hover:bg-primary-container transition-colors flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-sm">
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Autenticando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>

        {/* Credenciais de demonstração */}
        <div className="mt-xl pt-lg border-t border-outline-variant">
          <p className="font-label-sm text-label-sm text-on-surface-variant text-center mb-sm">Credenciais de demonstração</p>
          <div className="grid grid-cols-1 gap-xs">
            <button 
              type="button"
              onClick={() => { setLoginInput('admin'); setSenhaInput('admin'); setErro(''); }}
              className="flex items-center justify-between px-sm py-xs rounded bg-surface-container-low hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant group"
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">admin_panel_settings</span>
                <span className="font-body-sm text-body-sm text-on-surface">admin / admin</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-[11px] bg-primary-container text-on-primary-container border border-primary-container">
                Administrador
              </span>
            </button>
            <button 
              type="button"
              onClick={() => { setLoginInput('engenheiro'); setSenhaInput('engenheiro'); setErro(''); }}
              className="flex items-center justify-between px-sm py-xs rounded bg-surface-container-low hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant group"
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[16px] text-secondary">engineering</span>
                <span className="font-body-sm text-body-sm text-on-surface">engenheiro / engenheiro</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-[11px] bg-secondary-container text-on-secondary-container border border-secondary-container">
                Engenheiro
              </span>
            </button>
            <button 
              type="button"
              onClick={() => { setLoginInput('operador'); setSenhaInput('operador'); setErro(''); }}
              className="flex items-center justify-between px-sm py-xs rounded bg-surface-container-low hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant group"
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[16px] text-outline">person</span>
                <span className="font-body-sm text-body-sm text-on-surface">operador / operador</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-[11px] bg-surface-container-high text-on-surface-variant border border-outline-variant">
                Operador
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
