export interface FuncionarioAlocado {
  id: string;
  iniciais: string;
  nome: string;
  corVariant: string;
}

export interface Etapa {
  id: string;
  aeronaveCodigo: string;
  nome: string;
  prazo: string;
  status: 'Pendente' | 'Em andamento' | 'Concluída';
  statusBadgeVariant: string;
  icon: string;
  isExpanded?: boolean;
  funcionariosAlocados?: FuncionarioAlocado[];
}

export const mockEtapas: Etapa[] = [
  {
    id: '1',
    aeronaveCodigo: 'AC-737-MAX',
    nome: 'Usinagem do Eixo Principal',
    prazo: '2023-10-12',
    status: 'Em andamento',
    statusBadgeVariant: 'bg-secondary-container text-on-secondary-container',
    icon: 'expand_more',
    isExpanded: true,
    funcionariosAlocados: [
      { id: '1', iniciais: 'RM', nome: 'Ricardo Mendes', corVariant: 'bg-primary-fixed-dim' },
      { id: '2', iniciais: 'AS', nome: 'Ana Silva', corVariant: 'bg-secondary-fixed-dim' },
    ]
  },
  {
    id: '2',
    aeronaveCodigo: 'AC-A320-NEO',
    nome: 'Inspeção de Turbina',
    prazo: '2023-10-15',
    status: 'Pendente',
    statusBadgeVariant: 'bg-surface-variant text-on-surface-variant',
    icon: 'chevron_right',
  },
  {
    id: '3',
    aeronaveCodigo: 'AC-C130-J',
    nome: 'Soldagem Estrutural Asa Esq.',
    prazo: '2023-10-08',
    status: 'Concluída',
    statusBadgeVariant: 'bg-primary-fixed text-on-primary-fixed',
    icon: 'chevron_right',
  },
  {
    id: '4',
    aeronaveCodigo: 'AC-E195-E2',
    nome: 'Calibração de Sensores Nav.',
    prazo: '2023-10-10',
    status: 'Pendente',
    statusBadgeVariant: 'bg-error-container text-on-error-container',
    icon: 'chevron_right',
  },
];
