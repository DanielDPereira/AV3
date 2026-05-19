import React, { useState } from 'react';

import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Tooltip from '../../components/Tooltip';
import { type Teste, mockTestes } from '../../types/testes';

const inputCls = "px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none w-full transition-all";
const btnPrimaryCls = "w-full md:w-auto bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]";
const btnFilterCls = "w-full md:w-auto flex items-center justify-center gap-xs px-md py-sm border rounded-lg font-label-sm text-label-sm transition-all";
const searchInputCls = "w-full pl-10 pr-sm py-2 border border-outline-variant rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all placeholder:text-outline-variant";
const tableHeaderCls = "px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-outline-variant";
const actionBtnBaseCls = "p-1.5 transition-colors rounded-full";
const actionBtnEditCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnDeleteCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-error hover:bg-error-container/30`;
const actionBtnViewCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnCheckCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;

const resultadoMap = (val: string): { resultado: Teste['resultado']; variant: string } =>
  val === 's'
    ? { resultado: 'Aprovado', variant: 'bg-green-100 text-green-800 border-green-200' }
    : { resultado: 'Reprovado', variant: 'bg-red-100 text-red-800 border-red-200' };

const tipoMap: Record<string, Teste['tipo']> = {
  '1': 'Elétrico',
  '2': 'Hidráulico',
  '3': 'Aerodinâmico',
};
const tipoToKey = (tipo: string) =>
  tipo === 'Hidráulico' ? '2' : tipo === 'Aerodinâmico' ? '3' : '1';

const Testes: React.FC = () => {
  const [testes, setTestes] = useState<Teste[]>(mockTestes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoTeste, setNovoTeste] = useState({ aeronave: '', tipo: '1', resultado: 's' });

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Teste | null>(null);
  const [editForm, setEditForm] = useState({ aeronave: '', tipo: '1', resultado: 's' });

  // Approve/reject state
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [resultTarget, setResultTarget] = useState<Teste | null>(null);
  const [resultVal, setResultVal] = useState<'s' | 'n'>('s');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ tipo: 'Todos', resultado: 'Todos', aeronave: 'Todas' });

  const uniqueAeronaves = Array.from(new Set(testes.filter(t => t.aeronave).map(t => t.aeronave!)));

  const filteredTestes = testes.filter(teste => {
    const matchesSearch = (teste.aeronave && teste.aeronave.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         teste.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filters.tipo === 'Todos' || teste.tipo === filters.tipo;
    const matchesResultado = filters.resultado === 'Todos' || teste.resultado === filters.resultado;
    const matchesAeronave = filters.aeronave === 'Todas' || teste.aeronave === filters.aeronave;
    return matchesSearch && matchesTipo && matchesResultado && matchesAeronave;
  });

  const handleCreateTeste = (e: React.FormEvent) => {
    e.preventDefault();
    const { resultado, variant } = resultadoMap(novoTeste.resultado);
    const teste: Teste = {
      id: Math.random().toString(),
      aeronave: novoTeste.aeronave,
      tipo: tipoMap[novoTeste.tipo],
      resultado,
      resultadoVariant: variant,
    };
    setTestes([teste, ...testes]);
    setIsModalOpen(false);
    setNovoTeste({ aeronave: '', tipo: '1', resultado: 's' });
  };

  const openEdit = (t: Teste) => {
    setEditTarget(t);
    setEditForm({ aeronave: t.aeronave || '', tipo: tipoToKey(t.tipo), resultado: t.resultado === 'Aprovado' ? 's' : 'n' });
    setIsEditOpen(true);
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const { resultado, variant } = resultadoMap(editForm.resultado);
    setTestes(testes.map(t =>
      t.id === editTarget.id
        ? { ...t, aeronave: editForm.aeronave, tipo: tipoMap[editForm.tipo], resultado, resultadoVariant: variant }
        : t
    ));
    setIsEditOpen(false);
  };

  const openResult = (t: Teste) => {
    setResultTarget(t);
    setResultVal(t.resultado === 'Aprovado' ? 's' : 'n');
    setIsResultOpen(true);
  };
  const handleResult = () => {
    if (!resultTarget) return;
    const { resultado, variant } = resultadoMap(resultVal);
    setTestes(testes.map(t =>
      t.id === resultTarget.id ? { ...t, resultado, resultadoVariant: variant } : t
    ));
    setIsResultOpen(false);
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
              <span className="text-primary-container font-bold">Testes</span>
            </nav>
            <h1 className="font-h2 text-h2 text-on-surface">Inspeções e Testes</h1>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-md w-full sm:w-auto">
            <div className="relative w-full md:w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                className={searchInputCls}
                placeholder="Buscar por aeronave..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`${btnFilterCls} ${ (filters.tipo !== 'Todos' || filters.resultado !== 'Todos' || filters.aeronave !== 'Todas') ? 'border-primary bg-primary-fixed text-primary shadow-sm' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros { (filters.tipo !== 'Todos' || filters.resultado !== 'Todos' || filters.aeronave !== 'Todas') && '•'}
            </button>
            <button onClick={() => setIsModalOpen(true)} className={btnPrimaryCls}>
              <span className="material-symbols-outlined text-[20px]">add</span>
              Novo Teste
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8 lg:p-xl flex-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className={tableHeaderCls}>Aeronave</th>
                    <th className={tableHeaderCls}>Tipo de Teste</th>
                    <th className={tableHeaderCls}>Resultado</th>
                    <th className={`${tableHeaderCls} text-right`}>Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredTestes.map((teste) => (
                    <tr key={teste.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-md px-lg font-body-md text-body-md text-on-surface">
                        <div className="flex items-center gap-sm">
                          <span className="material-symbols-outlined text-outline-variant text-[18px]">flight</span>
                          {teste.aeronave}
                        </div>
                      </td>
                      <td className="py-md px-lg font-body-sm text-body-sm text-on-surface-variant">
                        {teste.tipo}
                      </td>
                      <td className="py-md px-lg">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[12px] font-semibold border ${teste.resultadoVariant}`}>
                          {teste.resultado}
                        </span>
                      </td>
                      <td className="py-md px-lg text-right">
                        <div className="flex items-center justify-end gap-xs lg:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <Tooltip label="Editar">
                            <button
                              aria-label={`Editar teste de ${teste.aeronave}`}
                              className={actionBtnEditCls}
                              onClick={() => openEdit(teste)}
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          </Tooltip>
                          <Tooltip label="Alterar Resultado">
                            <button
                              aria-label={`Aprovar ou reprovar teste de ${teste.aeronave}`}
                              className={actionBtnCheckCls}
                              onClick={() => openResult(teste)}
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">fact_check</span>
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Footer */}
            <div className="p-4 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
              <span className="text-body-sm font-body-sm text-secondary text-center sm:text-left">Mostrando 1 a {filteredTestes.length} de {testes.length} testes</span>
              <div className="flex items-center gap-xs">
                <button className="p-1 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50 transition-colors" disabled>
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button className="p-1 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Novo Teste */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Teste de Qualidade">
        <form className="flex flex-col gap-md" onSubmit={handleCreateTeste}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código da Aeronave</label>
            <input type="text" value={novoTeste.aeronave} onChange={(e) => setNovoTeste({ ...novoTeste, aeronave: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Tipo</label>
            <select value={novoTeste.tipo} onChange={(e) => setNovoTeste({ ...novoTeste, tipo: e.target.value })} className={inputCls} required>
              <option value="1">1- Elétrico</option>
              <option value="2">2- Hidráulico</option>
              <option value="3">3- Aerodinâmico</option>
            </select>
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Aprovado?</label>
            <select value={novoTeste.resultado} onChange={(e) => setNovoTeste({ ...novoTeste, resultado: e.target.value })} className={inputCls} required>
              <option value="s">Sim</option>
              <option value="n">Não</option>
            </select>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Salvar Teste</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Editar Teste */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Editar Teste — ${editTarget?.aeronave || ''}`}>
        <form className="flex flex-col gap-md" onSubmit={handleEdit}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código da Aeronave</label>
            <input type="text" value={editForm.aeronave} onChange={(e) => setEditForm({ ...editForm, aeronave: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Tipo</label>
            <select value={editForm.tipo} onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })} className={inputCls} required>
              <option value="1">1- Elétrico</option>
              <option value="2">2- Hidráulico</option>
              <option value="3">3- Aerodinâmico</option>
            </select>
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Resultado</label>
            <select value={editForm.resultado} onChange={(e) => setEditForm({ ...editForm, resultado: e.target.value })} className={inputCls} required>
              <option value="s">Aprovado</option>
              <option value="n">Reprovado</option>
            </select>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Salvar Alterações</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Alterar Resultado */}
      <Modal isOpen={isResultOpen} onClose={() => setIsResultOpen(false)} title={`Resultado — ${resultTarget?.aeronave || ''}`}>
        <div className="flex flex-col gap-lg">
          <p className="font-body-md text-body-md text-on-surface">
            Defina o resultado do teste <strong>{resultTarget?.tipo}</strong> para a aeronave <strong>{resultTarget?.aeronave}</strong>:
          </p>
          <div className="flex gap-md">
            <button
              type="button"
              onClick={() => setResultVal('s')}
              className={`flex-1 flex flex-col items-center gap-xs p-md rounded-xl border-2 transition-all ${resultVal === 's' ? 'border-green-500 bg-green-50 text-green-800' : 'border-outline-variant text-on-surface-variant hover:border-green-300'}`}
            >
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
              <span className="font-label-md text-label-md">Aprovado</span>
            </button>
            <button
              type="button"
              onClick={() => setResultVal('n')}
              className={`flex-1 flex flex-col items-center gap-xs p-md rounded-xl border-2 transition-all ${resultVal === 'n' ? 'border-red-500 bg-red-50 text-red-800' : 'border-outline-variant text-on-surface-variant hover:border-red-300'}`}
            >
              <span className="material-symbols-outlined text-[28px]">cancel</span>
              <span className="font-label-md text-label-md">Reprovado</span>
            </button>
          </div>
          <div className="flex justify-end gap-sm">
            <button type="button" onClick={() => setIsResultOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="button" onClick={handleResult} className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Confirmar</button>
          </div>
        </div>
      </Modal>

      {/* Modal: Filtros */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtros de Testes">
        <div className="flex flex-col gap-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-md">
              <label className="font-label-md text-on-surface font-semibold">Tipo de Teste</label>
              <div className="flex flex-col gap-sm">
                {['Todos', 'Elétrico', 'Hidráulico', 'Aerodinâmico'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilters({ ...filters, tipo: t })}
                    className={`flex items-center justify-between px-md py-sm rounded-lg border-2 transition-all ${filters.tipo === t ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant hover:border-primary/30'}`}
                  >
                    <span className="font-body-md">{t}</span>
                    {filters.tipo === t && <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-md">
              <label className="font-label-md text-on-surface font-semibold">Resultado</label>
              <div className="flex flex-col gap-sm">
                {['Todos', 'Aprovado', 'Reprovado'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilters({ ...filters, resultado: r })}
                    className={`flex items-center justify-between px-md py-sm rounded-lg border-2 transition-all ${filters.resultado === r ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant hover:border-primary/30'}`}
                  >
                    <span className="font-body-md">{r}</span>
                    {filters.resultado === r && <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-md">
            <label className="font-label-md text-on-surface font-semibold">Aeronave</label>
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
              onClick={() => { setFilters({ tipo: 'Todos', resultado: 'Todos', aeronave: 'Todas' }); setIsFilterOpen(false); }}
              className="px-md py-sm rounded text-error hover:bg-error-container/20 transition-colors font-label-md"
            >
              Limpar Filtros
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

export default Testes;
