export interface DashboardAircraft {
  id: string;
  identifier: string;
  model: string;
  currentPhase: string;
  status: 'Em Produção' | 'Revisão' | 'Alerta de Qualidade' | 'Concluído';
}

export interface DashboardStats {
  aircrafts: number;
  parts: number;
  stages: number;
  tests: number;
}
