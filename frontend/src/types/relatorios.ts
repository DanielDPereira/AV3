export interface Relatorio {
  id: string;
  nomeArquivo: string;
  aeronaveCodigo: string;
  dataGeracao: string;
}

export const mockRelatorios: Relatorio[] = [
  {
    id: '1',
    nomeArquivo: 'relatorio_AC-737-MAX.txt',
    aeronaveCodigo: 'AC-737-MAX',
    dataGeracao: '01/10/2026 08:30',
  },
  {
    id: '2',
    nomeArquivo: 'relatorio_AC-A320-NEO.txt',
    aeronaveCodigo: 'AC-A320-NEO',
    dataGeracao: '15/10/2026 14:15',
  },
  {
    id: '3',
    nomeArquivo: 'relatorio_AC-C130-J.txt',
    aeronaveCodigo: 'AC-C130-J',
    dataGeracao: '20/10/2026 09:00',
  },
  {
    id: '4',
    nomeArquivo: 'relatorio_AC-E195-E2.txt',
    aeronaveCodigo: 'AC-E195-E2',
    dataGeracao: '22/10/2026 11:45',
  }
];
