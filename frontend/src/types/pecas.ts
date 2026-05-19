export interface Peca {
  id: string;
  nome: string;
  tipo: 'Nacional' | 'Importada';
  tipoBadgeVariant: string;
  fornecedor: string;
  status: 'Em produção' | 'Em transporte' | 'Pronta';
  statusIcon: string;
  statusBadgeVariant: string;
  aeronave?: string;
}

export const mockPecas: Peca[] = [
  {
    id: '1',
    nome: 'Turbina Axial X-100',
    tipo: 'Importada',
    tipoBadgeVariant: 'bg-tertiary-fixed text-on-tertiary-fixed',
    fornecedor: 'AeroEngines Corp',
    status: 'Em transporte',
    statusIcon: 'local_shipping',
    statusBadgeVariant: 'bg-secondary-container text-on-secondary-container',
    aeronave: 'AC-737-MAX'
  },
  {
    id: '2',
    nome: 'Painel Fuselagem Lat-A',
    tipo: 'Nacional',
    tipoBadgeVariant: 'bg-secondary-fixed text-on-secondary-fixed',
    fornecedor: 'Metalúrgica Sul',
    status: 'Em produção',
    statusIcon: 'precision_manufacturing',
    statusBadgeVariant: 'bg-primary-fixed text-on-primary-fixed',
    aeronave: 'AC-C130-J'
  },
  {
    id: '3',
    nome: 'Trem de Pouso Dianteiro',
    tipo: 'Importada',
    tipoBadgeVariant: 'bg-tertiary-fixed text-on-tertiary-fixed',
    fornecedor: 'Global Gear',
    status: 'Pronta',
    statusIcon: 'check_circle',
    statusBadgeVariant: 'bg-surface-tint text-on-primary',
    aeronave: 'AC-E195-E2'
  },
  {
    id: '4',
    nome: 'Assento Comando Piloto',
    tipo: 'Nacional',
    tipoBadgeVariant: 'bg-secondary-fixed text-on-secondary-fixed',
    fornecedor: 'AeroInteriores',
    status: 'Pronta',
    statusIcon: 'check_circle',
    statusBadgeVariant: 'bg-surface-tint text-on-primary',
    aeronave: 'AC-A320-NEO'
  },
];
