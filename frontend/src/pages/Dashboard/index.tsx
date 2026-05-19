import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { type DashboardAircraft, type DashboardStats } from '../../types/dashboard';

const inputCls = "px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none w-full transition-all";
const btnPrimaryCls = "flex-1 sm:flex-none bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]";
const btnSecondaryCls = "flex-1 sm:flex-none bg-surface-container-lowest border border-outline text-on-surface font-label-md text-label-md px-lg py-sm rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-xs active:scale-[0.98]";

const mockStats: DashboardStats = {
  aircrafts: 142,
  parts: 8934,
  stages: 56,
  tests: 1204
};

const mockAircrafts: DashboardAircraft[] = [
  { id: '1', identifier: 'AC-X901', model: 'Interceptor V2', currentPhase: 'Montagem Estrutural', status: 'Em Produção' },
  { id: '2', identifier: 'AC-X902', model: 'Cargo Heavy 500', currentPhase: 'Testes de Aviônicos', status: 'Revisão' },
  { id: '3', identifier: 'AC-X885', model: 'Interceptor V1', currentPhase: 'Inspeção Final', status: 'Alerta de Qualidade' },
  { id: '4', identifier: 'AC-X884', model: 'Interceptor V1', currentPhase: 'Entrega', status: 'Concluído' }
];

const getStatusClasses = (status: DashboardAircraft['status']) => {
  switch (status) {
    case 'Em Produção': return 'bg-secondary-fixed text-on-secondary-fixed';
    case 'Revisão': return 'bg-surface-variant text-on-surface-variant';
    case 'Alerta de Qualidade': return 'bg-tertiary-fixed text-on-tertiary-fixed';
    case 'Concluído': return 'bg-green-100 text-green-800';
    default: return 'bg-surface-variant text-on-surface-variant';
  }
};

const Dashboard: React.FC = () => {
  const [stats] = useState<DashboardStats>(mockStats);
  const [aircrafts] = useState<DashboardAircraft[]>(mockAircrafts);

  // States for Modals
  const [isModalAeronaveOpen, setIsModalAeronaveOpen] = useState(false);
  const [isModalPecaOpen, setIsModalPecaOpen] = useState(false);
  const [isModalEtapaOpen, setIsModalEtapaOpen] = useState(false);

  const [novaAeronave, setNovaAeronave] = useState({ codigo: '', modelo: '', capacidade: '', alcance: '', tipo: 'Comercial' });
  const [novaPeca, setNovaPeca] = useState({ aeronave: '', nome: '', fornecedor: '', tipo: 'Nacional' });
  const [novaEtapa, setNovaEtapa] = useState({ aeronave: '', nome: '', prazo: '' });

  const handleCreateAeronave = (e: React.FormEvent) => { e.preventDefault(); setIsModalAeronaveOpen(false); setNovaAeronave({ codigo: '', modelo: '', capacidade: '', alcance: '', tipo: 'Comercial' }); };
  const handleCreatePeca = (e: React.FormEvent) => { e.preventDefault(); setIsModalPecaOpen(false); setNovaPeca({ aeronave: '', nome: '', fornecedor: '', tipo: 'Nacional' }); };
  const handleCreateEtapa = (e: React.FormEvent) => { e.preventDefault(); setIsModalEtapaOpen(false); setNovaEtapa({ aeronave: '', nome: '', prazo: '' }); };

  return (
    <Layout>
      <div className="p-4 md:p-8 lg:p-xl">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-xl">
            {/* Header & Botões Rápidos */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
              <div>
                <nav className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
                  <span className="hover:text-primary cursor-pointer transition-colors">Sistema</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-primary-container font-bold">Dashboard</span>
                </nav>
                <h1 className="font-h2 text-h2 text-on-surface">Visão Geral</h1>
              </div>
              <div className="flex flex-wrap gap-xs md:gap-sm">
                <button onClick={() => setIsModalPecaOpen(true)} className={btnSecondaryCls}>
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Peça
                </button>
                <button onClick={() => setIsModalEtapaOpen(true)} className={btnSecondaryCls}>
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Etapa
                </button>
                <button onClick={() => setIsModalAeronaveOpen(true)} className={btnPrimaryCls}>
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Aeronave
                </button>
              </div>
            </div>

            {/* 4 Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-gutter">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-sm flex flex-col justify-between h-32 md:h-40">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Aeronaves</span>
                  <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <span className="material-symbols-outlined">flight</span>
                  </div>
                </div>
                <div className="font-h1 text-h2 md:text-h1 text-on-surface">{stats.aircrafts}</div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-sm flex flex-col justify-between h-32 md:h-40">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Peças</span>
                  <div className="w-8 h-8 rounded bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                    <span className="material-symbols-outlined">settings_input_component</span>
                  </div>
                </div>
                <div className="font-h1 text-h2 md:text-h1 text-on-surface">{stats.parts.toLocaleString('pt-BR')}</div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-sm flex flex-col justify-between h-32 md:h-40">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Etapas</span>
                  <div className="w-8 h-8 rounded bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                    <span className="material-symbols-outlined">account_tree</span>
                  </div>
                </div>
                <div className="font-h1 text-h2 md:text-h1 text-on-surface">{stats.stages}</div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-sm flex flex-col justify-between h-32 md:h-40">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Testes</span>
                  <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">biotech</span>
                  </div>
                </div>
                <div className="font-h1 text-h2 md:text-h1 text-on-surface">{stats.tests.toLocaleString('pt-BR')}</div>
              </div>
            </div>

            {/* Lista de Últimas Aeronaves */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="px-md md:px-lg py-md border-b border-outline-variant flex justify-between items-center">
                <h2 className="font-h3 text-h3 text-on-surface">Últimas aeronaves</h2>
                <Link to="/aeronaves" className="font-label-sm text-label-sm text-primary hover:underline">Ver todas</Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant font-label-sm text-label-sm text-on-surface-variant">
                      <th className="px-md md:px-lg py-sm font-semibold">Identificador</th>
                      <th className="px-md md:px-lg py-sm font-semibold">Modelo</th>
                      <th className="px-md md:px-lg py-sm font-semibold hidden sm:table-cell">Fase Atual</th>
                      <th className="px-md md:px-lg py-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    {aircrafts.map(aircraft => (
                      <tr key={aircraft.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                        <td className="px-md md:px-lg py-md font-code">{aircraft.identifier}</td>
                        <td className="px-md md:px-lg py-md">{aircraft.model}</td>
                        <td className="px-md md:px-lg py-md hidden sm:table-cell">{aircraft.currentPhase}</td>
                        <td className="px-md md:px-lg py-md">
                          <span className={`inline-flex items-center px-2 py-1 rounded font-label-sm text-label-sm ${getStatusClasses(aircraft.status)}`}>
                            {aircraft.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>

      <Modal isOpen={isModalAeronaveOpen} onClose={() => setIsModalAeronaveOpen(false)} title="Cadastrar nova Aeronave">
        <form className="flex flex-col gap-md" onSubmit={handleCreateAeronave}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código único</label>
            <input type="text" value={novaAeronave.codigo} onChange={(e) => setNovaAeronave({...novaAeronave, codigo: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Modelo</label>
            <input type="text" value={novaAeronave.modelo} onChange={(e) => setNovaAeronave({...novaAeronave, modelo: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Capacidade de Passageiros</label>
            <input type="number" value={novaAeronave.capacidade} onChange={(e) => setNovaAeronave({...novaAeronave, capacidade: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Alcance em Km</label>
            <input type="number" value={novaAeronave.alcance} onChange={(e) => setNovaAeronave({...novaAeronave, alcance: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Tipo</label>
            <select value={novaAeronave.tipo} onChange={(e) => setNovaAeronave({...novaAeronave, tipo: e.target.value})} className={inputCls} required>
              <option value="Comercial">1- Comercial</option>
              <option value="Militar">2- Militar</option>
            </select>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsModalAeronaveOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed-dim/20">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Cadastrar</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isModalPecaOpen} onClose={() => setIsModalPecaOpen(false)} title="Adicionar Peça a uma Aeronave">
        <form className="flex flex-col gap-md" onSubmit={handleCreatePeca}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código da Aeronave alvo</label>
            <input type="text" value={novaPeca.aeronave} onChange={(e) => setNovaPeca({...novaPeca, aeronave: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Nome do componente</label>
            <input type="text" value={novaPeca.nome} onChange={(e) => setNovaPeca({...novaPeca, nome: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Empresa fornecedora</label>
            <input type="text" value={novaPeca.fornecedor} onChange={(e) => setNovaPeca({...novaPeca, fornecedor: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Origem</label>
            <select value={novaPeca.tipo} onChange={(e) => setNovaPeca({...novaPeca, tipo: e.target.value})} className={inputCls} required>
              <option value="Nacional">1- Nacional</option>
              <option value="Importada">2- Importada</option>
            </select>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsModalPecaOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed-dim/20">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Cadastrar</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isModalEtapaOpen} onClose={() => setIsModalEtapaOpen(false)} title="Nova Etapa">
        <form className="flex flex-col gap-md" onSubmit={handleCreateEtapa}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código Aeronave</label>
            <input type="text" value={novaEtapa.aeronave} onChange={(e) => setNovaEtapa({...novaEtapa, aeronave: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Nome da etapa</label>
            <input type="text" value={novaEtapa.nome} onChange={(e) => setNovaEtapa({...novaEtapa, nome: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Prazo</label>
            <input type="date" value={novaEtapa.prazo} onChange={(e) => setNovaEtapa({...novaEtapa, prazo: e.target.value})} className={inputCls} required />
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsModalEtapaOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed-dim/20">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Criar</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
