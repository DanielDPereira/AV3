export interface Aeronave {
  id: string;
  codigo: string;
  modelo: string;
  tipo: 'Comercial' | 'Militar';
  capacidade: number;
  alcance: number;
  tipoBadgeColor: string;
}

export const mockAeronaves: Aeronave[] = [
  {
    id: '1',
    codigo: 'AC-737-MAX',
    modelo: 'Boeing 737 MAX 8',
    tipo: 'Comercial',
    capacidade: 186,
    alcance: 6570,
    tipoBadgeColor: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  {
    id: '2',
    codigo: 'AC-A320-NEO',
    modelo: 'Airbus A320neo',
    tipo: 'Comercial',
    capacidade: 195,
    alcance: 6300,
    tipoBadgeColor: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  {
    id: '3',
    codigo: 'AC-C130-J',
    modelo: 'Lockheed C-130J',
    tipo: 'Militar',
    capacidade: 128,
    alcance: 3334,
    tipoBadgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  {
    id: '4',
    codigo: 'AC-E195-E2',
    modelo: 'Embraer E195-E2',
    tipo: 'Comercial',
    capacidade: 146,
    alcance: 4815,
    tipoBadgeColor: 'bg-secondary-fixed text-on-secondary-fixed',
  },
];
