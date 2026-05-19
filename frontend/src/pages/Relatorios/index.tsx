import React, { useState } from 'react';

import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { type Relatorio, mockRelatorios } from '../../types/relatorios';

const inputCls = "px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none w-full transition-all";
const btnPrimaryCls = "w-full md:w-auto bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]";
const btnFilterCls = "w-full md:w-auto flex items-center justify-center gap-xs px-md py-sm border rounded-lg font-label-sm text-label-sm transition-all";
const searchInputCls = "w-full pl-10 pr-sm py-2 border border-outline-variant rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all placeholder:text-outline-variant";
const tableHeaderCls = "px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-outline-variant";
const actionBtnBaseCls = "p-1.5 transition-colors rounded-full";
const actionBtnEditCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnDeleteCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-error hover:bg-error-container/30`;
const actionBtnViewCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnDownloadCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const Relatorios: React.FC = () => {
  const [relatorios] = useState<Relatorio[]>(mockRelatorios);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [novoRelatorio, setNovoRelatorio] = useState({ aeronave: '', gerarDisco: 's' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ aeronave: 'Todas' });

  const uniqueAeronaves = Array.from(new Set(relatorios.map(r => r.aeronaveCodigo)));

  const filteredRelatorios = relatorios.filter(rel => {
    const matchesSearch = rel.nomeArquivo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAeronave = filters.aeronave === 'Todas' || rel.aeronaveCodigo === filters.aeronave;
    return matchesSearch && matchesAeronave;
  });

  const handleGerarRelatorio = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setNovoRelatorio({ aeronave: '', gerarDisco: 's' });
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        {/* Action Bar */}
        <div className="sticky top-0 z-40 bg-surface-container-low/95 backdrop-blur-sm border-b border-outline-variant/30 px-4 md:px-8 lg:px-xl py-4 md:py-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <nav className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
              <span className="hover:text-primary cursor-pointer transition-colors">Sistema</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary-container font-bold">Relatórios</span>
            </nav>
            <h1 className="font-h2 text-h2 text-on-surface">Central de Relatórios</h1>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-md w-full sm:w-auto">
            <div className="relative w-full md:w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                className={searchInputCls}
                placeholder="Pesquisar arquivo..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`${btnFilterCls} ${filters.aeronave !== 'Todas' ? 'border-primary bg-primary-fixed text-primary shadow-sm' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros {filters.aeronave !== 'Todas' && '•'}
            </button>
            <button onClick={() => setIsModalOpen(true)} className={btnPrimaryCls}>
              <span className="material-symbols-outlined text-[20px]">add_chart</span>
              Gerar Relatório
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8 lg:p-xl flex-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-lg border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
              <h2 className="text-h3 font-h3 text-on-surface">Histórico Recente</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className={tableHeaderCls}>Arquivo</th>
                    <th className={tableHeaderCls}>Aeronave</th>
                    <th className={`${tableHeaderCls} hidden sm:table-cell`}>Data</th>
                    <th className={`${tableHeaderCls} text-right`}>Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredRelatorios.map((relatorio) => (
                    <tr key={relatorio.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-md px-lg">
                        <div className="flex items-center gap-md">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 bg-blue-100 shrink-0`}>
                            <span className="material-symbols-outlined">description</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{relatorio.nomeArquivo}</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">TXT</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-md px-lg font-body-sm text-body-sm text-on-surface">
                        {relatorio.aeronaveCodigo}
                      </td>
                      <td className="py-md px-lg font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">
                        {relatorio.dataGeracao}
                      </td>
                      <td className="py-md px-lg text-right">
                        <div className="flex items-center justify-end gap-xs lg:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <button
                            aria-label={`Visualizar relatório ${relatorio.nomeArquivo}`}
                            className={actionBtnViewCls}
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <button
                            aria-label={`Baixar relatório ${relatorio.nomeArquivo}`}
                            className={actionBtnDownloadCls}
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Gerar Relatório de Entrega">
        <form className="flex flex-col gap-md" onSubmit={handleGerarRelatorio}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código da Aeronave</label>
            <input type="text" value={novoRelatorio.aeronave} onChange={(e) => setNovoRelatorio({ ...novoRelatorio, aeronave: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Deseja gerar o .txt em disco?</label>
            <select value={novoRelatorio.gerarDisco} onChange={(e) => setNovoRelatorio({ ...novoRelatorio, gerarDisco: e.target.value })} className={inputCls} required>
              <option value="s">Sim</option>
              <option value="n">Não</option>
            </select>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed-dim/20">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90 shadow-sm">Gerar Relatório</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Filtros */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtros de Relatórios">
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-md">
            <label className="font-label-md text-on-surface font-semibold">Filtrar por Aeronave</label>
            <div className="relative">
              <select 
                value={filters.aeronave} 
                onChange={(e) => setFilters({ ...filters, aeronave: e.target.value })}
                className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary outline-none appearance-none"
              >
                <option value="Todas">Todas as Aeronaves</option>
                {uniqueAeronaves.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
            </div>
          </div>

          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
            <button 
              onClick={() => { setFilters({ aeronave: 'Todas' }); setIsFilterOpen(false); }}
              className="px-md py-sm rounded text-error hover:bg-error-container/20 transition-colors font-label-md"
            >
              Limpar
            </button>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90 transition-opacity font-label-md"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Relatorios;
