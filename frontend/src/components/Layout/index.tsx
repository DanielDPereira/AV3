import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, NivelPermissao } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, fazerLogout, temPermissao } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    fazerLogout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Definição de todos os itens de menu com seus níveis de permissão
  const allMenuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', niveis: [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR] },
    { path: '/aeronaves', icon: 'flight', label: 'Aeronaves', niveis: [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR] },
    { path: '/pecas', icon: 'settings_input_component', label: 'Peças', niveis: [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR] },
    { path: '/etapas', icon: 'account_tree', label: 'Etapas', niveis: [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR] },
    { path: '/funcionarios', icon: 'badge', label: 'Funcionários', niveis: [NivelPermissao.ADMINISTRADOR] },
    { path: '/testes', icon: 'biotech', label: 'Testes', niveis: [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR] },
    { path: '/relatorios', icon: 'analytics', label: 'Relatórios', niveis: [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR] },
  ];

  // Filtra os itens de menu conforme o nível de permissão do usuário logado
  const menuItems = allMenuItems.filter(item => temPermissao(item.niveis));

  // Função para obter as iniciais do nome
  const getIniciais = (nome: string): string => {
    const partes = nome.split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  // Cor do badge de nível baseada no nível de permissão
  const getNivelBadge = () => {
    if (!usuario) return { classes: '', label: '' };
    switch (usuario.nivelPermissao) {
      case NivelPermissao.ADMINISTRADOR:
        return { classes: 'bg-primary-container text-on-primary-container', label: 'Admin' };
      case NivelPermissao.ENGENHEIRO:
        return { classes: 'bg-secondary-container text-on-secondary-container', label: 'Engenheiro' };
      case NivelPermissao.OPERADOR:
        return { classes: 'bg-surface-container-high text-on-surface-variant', label: 'Operador' };
      default:
        return { classes: 'bg-surface-variant text-on-surface-variant', label: '' };
    }
  };

  const nivelBadge = getNivelBadge();

  return (
    <div className="bg-surface-container-low text-on-surface font-body-md text-body-md antialiased h-screen overflow-hidden flex flex-col">
      {/* Header Fixo */}
      <nav className="fixed top-0 w-full z-50 h-16 bg-white border-b border-outline-variant flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-sm md:gap-xl">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-on-surface-variant lg:hidden"
          >
            <span className="material-symbols-outlined">{isSidebarOpen ? 'close' : 'menu'}</span>
          </button>
          
          <span className="text-xl font-bold tracking-tighter text-primary">Aerocode</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest hidden lg:block">Sistema de Gestão Industrial</span>
        </div>
        
        <div className="flex items-center gap-md md:gap-lg">
          <div className="flex items-center gap-xs md:gap-sm">
            {/* Badge de nível de permissão - Hidden on very small screens */}
            <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-[11px] ${nivelBadge.classes}`}>
              {nivelBadge.label}
            </span>
            <span className="font-label-md text-label-md text-on-surface-variant hidden md:block">
              {usuario?.nome || 'Usuário'}
            </span>
            {/* Avatar com foto ou iniciais */}
            <div className="w-8 h-8 rounded-full border border-outline-variant bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold overflow-hidden">
              {usuario?.foto ? (
                <img src={usuario.foto} alt={usuario.nome} className="w-full h-full object-cover" />
              ) : (
                usuario ? getIniciais(usuario.nome) : '??'
              )}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="font-label-sm text-label-sm text-primary font-semibold hover:opacity-80 transition-opacity flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 pt-16 h-full relative">
        {/* Overlay para mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 h-full bg-surface-container border-r border-outline-variant flex flex-col py-6
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="flex-1 flex flex-col space-y-1">
            {menuItems.map(item => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-md px-md py-sm transition-colors ${isActive
                      ? 'bg-white text-primary border-l-4 border-primary font-bold'
                      : 'text-on-surface-variant border-l-4 border-transparent hover:bg-surface-variant hover:text-on-surface'
                    }`}
                >
                  <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Info do usuário na sidebar */}
          <div className="px-md pt-4 border-t border-outline-variant mt-2">
            <div className="flex items-center gap-sm px-sm py-xs">
              <span className="material-symbols-outlined text-[16px] text-outline">shield_person</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Nível: <strong className="text-on-surface">{usuario?.nivelPermissao}</strong>
              </span>
            </div>
          </div>
        </aside>

        {/* Área Principal */}
        <main className="flex-1 overflow-y-auto bg-surface-container-low relative w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
