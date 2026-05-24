export interface Funcionario {
  id: string;
  iniciais: string;
  iniciaisVariant: string;
  nome: string;
  usuario: string;
  telefone: string;
  endereco: string;
  nivel: 'Administrador' | 'Engenheiro' | 'Operador';
  nivelVariant: string;
  foto?: string;
}

export const mockFuncionarios: Funcionario[] = [
  {
    id: '1',
    iniciais: 'DD',
    iniciaisVariant: 'bg-primary-fixed text-on-primary-fixed',
    nome: 'Daniel Dias',
    usuario: 'admin',
    telefone: '+55 11 98765-4321',
    endereco: 'Av. Paulista, 1000, São Paulo - SP',
    nivel: 'Administrador',
    nivelVariant: 'bg-primary-container text-on-primary-container border-primary-container',
  },
  {
    id: '2',
    iniciais: 'ML',
    iniciaisVariant: 'bg-secondary-fixed text-on-secondary-fixed',
    nome: 'Mariana Lima',
    usuario: 'mariana.lima',
    telefone: '+55 12 99123-4567',
    endereco: 'Rua das Bandeiras, 45, S.J. Campos - SP',
    nivel: 'Engenheiro',
    nivelVariant: 'bg-secondary-container text-on-secondary-container border-secondary-container',
  },
  {
    id: '3',
    iniciais: 'RP',
    iniciaisVariant: 'bg-surface-variant text-on-surface-variant border border-outline-variant',
    nome: 'Rafael Pereira',
    usuario: 'rafael.p',
    telefone: '+55 11 97777-8888',
    endereco: 'Alameda Santos, 200, São Paulo - SP',
    nivel: 'Operador',
    nivelVariant: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
  },
  {
    id: '4',
    iniciais: 'AS',
    iniciaisVariant: 'bg-secondary-fixed text-on-secondary-fixed',
    nome: 'Ana Souza',
    usuario: 'ana.souza',
    telefone: '+55 19 98888-1111',
    endereco: 'Rodovia Anhanguera Km 98, Campinas - SP',
    nivel: 'Engenheiro',
    nivelVariant: 'bg-secondary-container text-on-secondary-container border-secondary-container',
  },
];
