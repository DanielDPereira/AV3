export interface Teste {
  id: string;
  aeronave?: string;
  tipo: 'Elétrico' | 'Hidráulico' | 'Aerodinâmico';
  resultado: 'Aprovado' | 'Reprovado';
  resultadoVariant: string;
}

export const mockTestes: Teste[] = [
  {
    id: '1',
    aeronave: 'AC-737-MAX',
    tipo: 'Elétrico',
    resultado: 'Aprovado',
    resultadoVariant: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    id: '2',
    aeronave: 'AC-C130-J',
    tipo: 'Hidráulico',
    resultado: 'Reprovado',
    resultadoVariant: 'bg-red-100 text-red-800 border-red-200',
  },
  {
    id: '3',
    aeronave: 'AC-E195-E2',
    tipo: 'Aerodinâmico',
    resultado: 'Aprovado',
    resultadoVariant: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    id: '4',
    aeronave: 'AC-A320-NEO',
    tipo: 'Elétrico',
    resultado: 'Aprovado',
    resultadoVariant: 'bg-green-100 text-green-800 border-green-200',
  },
];
