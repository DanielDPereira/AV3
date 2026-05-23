import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Tooltip from '../../components/Tooltip';
import api from '../../services/api';

interface FuncAlocado {
  id: number;
  nome: string;
  usuario: string;
}
interface EtapaAPI {
  id: number;
  nome: string;
  prazo: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  aeronaveId: number;
  aeronave?: { codigo: string };
  funcionarios?: { funcionario: FuncAlocado }[];
}
interface FuncAPI { id: number; nome: string; usuario: string; nivelPermissao: string; }

const inputCls = "px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none w-full transition-all";
const btnPrimaryCls = "w-full md:w-auto bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]";
const btnFilterCls = "w-full md:w-auto flex items-center justify-center gap-xs px-md py-sm border rounded-lg font-label-sm text-label-sm transition-all";
const searchInputCls = "w-full pl-10 pr-sm py-2 border border-outline-variant rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all placeholder:text-outline-variant";
const tableHeaderCls = "px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-outline-variant";
const actionBtnBaseCls = "p-1.5 transition-colors rounded-full";
const actionBtnEditCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnDeleteCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-error hover:bg-error-container/30`;
const actionBtnViewCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnAddCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;

const statusMeta: Record<string, { variant: string; icon: string; label: string }> = {
  'PENDENTE': { variant: 'bg-surface-variant text-on-surface-variant', icon: 'chevron_right', label: 'Pendente' },
  'EM_ANDAMENTO': { variant: 'bg-secondary-container text-on-secondary-container', icon: 'expand_more', label: 'Em andamento' },
  'CONCLUIDA': { variant: 'bg-primary-fixed text-on-primary-fixed', icon: 'chevron_right', label: 'Concluída' },
};

const corVariants = [
  'bg-primary-fixed-dim', 'bg-secondary-fixed-dim', 'bg-tertiary-fixed',
  'bg-primary-container', 'bg-secondary-container', 'bg-error-container',
];

const formatDate = (isoDate: string) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const Etapas: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [etapas, setEtapas] = useState<EtapaAPI[]>([]);
  const [allFuncs, setAllFuncs] = useState<FuncAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaEtapa, setNovaEtapa] = useState({ aeronaveId: '', nome: '', prazo: '' });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EtapaAPI | null>(null);
  const [editForm, setEditForm] = useState({ aeronaveId: '', nome: '', prazo: '', status: 'PENDENTE' });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EtapaAPI | null>(null);

  const [isAlocarOpen, setIsAlocarOpen] = useState(false);
  const [alocarTarget, setAlocarTarget] = useState<EtapaAPI | null>(null);
  const [selectedFuncIds, setSelectedFuncIds] = useState<Set<number>>(new Set());
  const [alocarSearch, setAlocarSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: 'Todos', aeronave: 'Todas' });
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const fetchEtapas = useCallback(async () => {
    setIsLoading(true);
    try { const res = await api.get('/api/etapas'); setEtapas(res.data); } catch (err) { console.error('Erro:', err); } finally { setIsLoading(false); }
  }, []);
  const fetchFuncs = useCallback(async () => {
    try { const res = await api.get('/api/funcionarios'); setAllFuncs(res.data); } catch (err) { console.error(err); }
  }, []);
  useEffect(() => { fetchEtapas(); fetchFuncs(); }, [fetchEtapas, fetchFuncs]);

  const uniqueAeronaves = Array.from(new Set(etapas.filter(e => e.aeronave).map(e => e.aeronave!.codigo)));

  const filteredEtapas = etapas.filter(etapa => {
    const aeroCode = etapa.aeronave?.codigo || '';
    const matchesSearch = etapa.nome.toLowerCase().includes(searchTerm.toLowerCase()) || aeroCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'Todos' || statusMeta[etapa.status]?.label === filters.status;
    const matchesAeronave = filters.aeronave === 'Todas' || aeroCode === filters.aeronave;
    return matchesSearch && matchesStatus && matchesAeronave;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitLoading(true);
    try {
      await api.post('/api/etapas', { nome: novaEtapa.nome, prazo: novaEtapa.prazo, aeronaveId: Number(novaEtapa.aeronaveId) });
      setIsModalOpen(false); setNovaEtapa({ aeronaveId: '', nome: '', prazo: '' }); fetchEtapas();
    } catch (err) { console.error(err); } finally { setSubmitLoading(false); }
  };

  const handleIniciar = async (id: number) => {
    try { await api.put(`/api/etapas/${id}`, { status: 'EM_ANDAMENTO' }); setExpandedIds(prev => new Set(prev).add(id)); fetchEtapas(); } catch (err) { console.error(err); }
  };
  const handleFinalizar = async (id: number) => {
    try { await api.put(`/api/etapas/${id}`, { status: 'CONCLUIDA' }); setExpandedIds(prev => { const n = new Set(prev); n.delete(id); return n; }); fetchEtapas(); } catch (err) { console.error(err); }
  };

  const openEdit = (et: EtapaAPI) => { setEditTarget(et); setEditForm({ aeronaveId: String(et.aeronaveId), nome: et.nome, prazo: et.prazo.split('T')[0], status: et.status }); setIsEditOpen(true); };
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editTarget) return; setSubmitLoading(true);
    try {
      await api.put(`/api/etapas/${editTarget.id}`, { nome: editForm.nome, prazo: editForm.prazo, status: editForm.status, aeronaveId: Number(editForm.aeronaveId) });
      setIsEditOpen(false); fetchEtapas();
    } catch (err) { console.error(err); } finally { setSubmitLoading(false); }
  };

  const openDelete = (et: EtapaAPI) => { setDeleteTarget(et); setIsDeleteOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return; setSubmitLoading(true);
    try { await api.delete(`/api/etapas/${deleteTarget.id}`); setIsDeleteOpen(false); fetchEtapas(); } catch (err) { console.error(err); } finally { setSubmitLoading(false); }
  };

  const openAlocar = (et: EtapaAPI) => {
    setAlocarTarget(et);
    const already = new Set((et.funcionarios || []).map(f => f.funcionario.id));
    setSelectedFuncIds(already);
    setAlocarSearch('');
    setIsAlocarOpen(true);
  };
  const toggleFunc = (id: number) => {
    setSelectedFuncIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const handleAlocar = async () => {
    if (!alocarTarget) return; setSubmitLoading(true);
    try {
      await api.put(`/api/etapas/${alocarTarget.id}/funcionarios`, { funcionarioIds: Array.from(selectedFuncIds) });
      setIsAlocarOpen(false); fetchEtapas();
    } catch (err) { console.error(err); } finally { setSubmitLoading(false); }
  };
  const handleDesalocar = async (etapaId: number, funcId: number) => {
    try { await api.delete(`/api/etapas/${etapaId}/funcionarios/${funcId}`); fetchEtapas(); } catch (err) { console.error(err); }
  };

  const filteredFuncForModal = allFuncs.filter(f =>
    f.nome.toLowerCase().includes(alocarSearch.toLowerCase()) ||
    f.usuario.toLowerCase().includes(alocarSearch.toLowerCase())
  );

  const getIniciais = (nome: string) => nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'NO';

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        {/* Action Bar */}
        <div className="sticky top-0 z-40 bg-surface-container-low/95 backdrop-blur-sm border-b border-outline-variant/30 px-4 md:px-8 lg:px-xl py-4 md:py-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <nav className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
              <span className="hover:text-primary cursor-pointer transition-colors">Sistema</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary-container font-bold">Etapas</span>
            </nav>
            <h1 className="font-h2 text-h2 text-on-surface">Etapas de Produção</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs hidden md:block">Controle operacional das fases de montagem.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-md w-full sm:w-auto">
            <div className="relative w-full md:w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                className={searchInputCls}
                placeholder="Buscar etapa ou aeronave..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`${btnFilterCls} ${ (filters.status !== 'Todos' || filters.aeronave !== 'Todas') ? 'border-primary bg-primary-fixed text-primary shadow-sm' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros {(filters.status !== 'Todos' || filters.aeronave !== 'Todas') && '•'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={btnPrimaryCls}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nova Etapa
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8 lg:p-xl flex-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className={tableHeaderCls}>Aeronave</th>
                      <th className={`${tableHeaderCls} w-1/3`}>Nome da Etapa</th>
                      <th className={`${tableHeaderCls} hidden sm:table-cell`}>Prazo (Data)</th>
                      <th className={tableHeaderCls}>Status</th>
                      <th className={`${tableHeaderCls} text-right`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    {filteredEtapas.map((etapa) => (
                      <Fragment key={etapa.id}>
                        <tr className="border-b border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors group">
                          <td className="px-md md:px-lg py-md align-top font-code text-primary font-medium">{etapa.aeronave?.codigo || '-'}</td>
                          <td className="px-md md:px-lg py-md align-top">
                            <div className="flex items-center gap-sm">
                              <span className={`material-symbols-outlined ${expandedIds.has(etapa.id) || etapa.status === 'EM_ANDAMENTO' ? 'text-primary' : 'text-outline'} text-[20px]`}>{statusMeta[etapa.status]?.icon || 'chevron_right'}</span>
                              <div className="font-medium text-on-surface">{etapa.nome}</div>
                            </div>
                          </td>
                          <td className="px-md md:px-lg py-md align-top text-on-surface-variant hidden sm:table-cell">{formatDate(etapa.prazo.split('T')[0])}</td>
                          <td className="px-md md:px-lg py-md align-top"><span className={`inline-flex items-center px-2 py-0.5 rounded ${statusMeta[etapa.status]?.variant || ''} font-label-sm text-[11px] uppercase`}>{statusMeta[etapa.status]?.label || etapa.status}</span></td>
                          <td className="px-md md:px-lg py-md text-right align-top">
                            <div className="flex items-center justify-end gap-xs">
                              {etapa.status === 'PENDENTE' && (
                                <button onClick={() => handleIniciar(etapa.id)} className="bg-primary text-on-primary hover:bg-primary-container text-label-sm px-sm py-1 rounded transition-colors flex items-center gap-xs shadow-sm">
                                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                  <span className="hidden lg:inline">Iniciar</span>
                                </button>
                              )}
                              {etapa.status === 'EM_ANDAMENTO' && (
                                <button onClick={() => handleFinalizar(etapa.id)} className="bg-error-container text-on-error-container hover:bg-error text-label-sm px-sm py-1 rounded transition-colors flex items-center gap-xs shadow-sm">
                                  <span className="material-symbols-outlined text-[16px]">stop</span>
                                  <span className="hidden lg:inline">Finalizar</span>
                                </button>
                              )}
                              <div className="flex items-center gap-xs lg:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                <Tooltip label="Alocar Funcionários">
                                  <button aria-label={`Alocar funcionários em ${etapa.nome}`} className={actionBtnAddCls} onClick={() => openAlocar(etapa)}>
                                    <span aria-hidden="true" className="material-symbols-outlined text-[20px]">person_add</span>
                                  </button>
                                </Tooltip>
                                <Tooltip label="Editar">
                                  <button aria-label={`Editar ${etapa.nome}`} className={actionBtnEditCls} onClick={() => openEdit(etapa)}>
                                    <span aria-hidden="true" className="material-symbols-outlined text-[20px]">edit</span>
                                  </button>
                                </Tooltip>
                                <Tooltip label="Excluir">
                                  <button aria-label={`Excluir ${etapa.nome}`} className={actionBtnDeleteCls} onClick={() => openDelete(etapa)}>
                                    <span aria-hidden="true" className="material-symbols-outlined text-[20px]">delete</span>
                                  </button>
                                </Tooltip>
                              </div>
                            </div>
                          </td>
                        </tr>
                        {(expandedIds.has(etapa.id) || etapa.status === 'EM_ANDAMENTO') && etapa.funcionarios && etapa.funcionarios.length > 0 && (
                          <tr className="bg-surface-container-lowest border-b border-outline-variant">
                            <td className="px-md md:px-lg pb-md" colSpan={5}>
                              <div className="sm:ml-[28px] p-4 border-l-2 border-primary bg-surface-container-low rounded-r-lg flex flex-col gap-md">
                                <div className="flex flex-col md:flex-row justify-between gap-md">
                                  <div className="flex-1">
                                    <h4 className="font-label-sm text-on-surface-variant uppercase mb-sm">Funcionários Alocados</h4>
                                    <div className="flex flex-wrap gap-sm">
                                      {etapa.funcionarios.map((ef, i) => (
                                        <div key={ef.funcionario.id} className="flex items-center gap-xs bg-white px-sm py-1 rounded border border-outline-variant group/chip">
                                          <div className={`w-6 h-6 rounded-full ${corVariants[i % corVariants.length]} flex items-center justify-center text-[10px] font-bold text-white`}>{getIniciais(ef.funcionario.nome)}</div>
                                          <span className="text-body-sm">{ef.funcionario.nome}</span>
                                          <button
                                            onClick={() => handleDesalocar(etapa.id, ef.funcionario.id)}
                                            className="ml-xs text-outline hover:text-error transition-colors opacity-100 lg:opacity-0 group-hover/chip:opacity-100"
                                            aria-label={`Remover ${ef.funcionario.nome}`}
                                          >
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                          </button>
                                        </div>
                                      ))}
                                      <button onClick={() => openAlocar(etapa)} className="flex items-center gap-xs text-primary hover:underline text-body-sm">
                                        <span className="material-symbols-outlined text-[18px]">person_add</span> Alocar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-md md:px-lg py-md border-t border-outline-variant bg-surface-bright flex flex-col sm:flex-row items-center justify-between gap-md mt-auto">
                <span className="font-body-sm text-body-sm text-on-surface-variant text-center sm:text-left">Mostrando 1 a {filteredEtapas.length} de {etapas.length} etapas</span>
                <div className="flex gap-xs">
                  <button className="p-1 rounded-lg border border-outline-variant text-outline hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button className="p-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Modal: Cadastrar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Etapa">
        <form className="flex flex-col gap-md" onSubmit={handleCreate}>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">ID da Aeronave</label><input type="number" value={novaEtapa.aeronaveId} onChange={(e) => setNovaEtapa({...novaEtapa, aeronaveId: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Nome da etapa</label><input type="text" value={novaEtapa.nome} onChange={(e) => setNovaEtapa({...novaEtapa, nome: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Prazo</label><input type="date" value={novaEtapa.prazo} onChange={(e) => setNovaEtapa({...novaEtapa, prazo: e.target.value})} className={inputCls} required /></div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Criar</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Editar */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Editar Etapa — ${editTarget?.nome || ''}`}>
        <form className="flex flex-col gap-md" onSubmit={handleEdit}>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">ID da Aeronave</label><input type="number" value={editForm.aeronaveId} onChange={(e) => setEditForm({...editForm, aeronaveId: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Nome da Etapa</label><input type="text" value={editForm.nome} onChange={(e) => setEditForm({...editForm, nome: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Prazo</label><input type="date" value={editForm.prazo} onChange={(e) => setEditForm({...editForm, prazo: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Status</label><select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})} className={inputCls} required><option value="PENDENTE">Pendente</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDA">Concluída</option></select></div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Salvar Alterações</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmar Exclusão */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirmar Exclusão">
        <div className="flex flex-col gap-lg">
          <div className="flex items-start gap-md">
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-error text-[20px]">warning</span></div>
            <div>
              <p className="font-body-md text-body-md text-on-surface">Tem certeza que deseja excluir a etapa <strong>{deleteTarget?.nome}</strong> da aeronave <strong>{deleteTarget?.aeronave?.codigo || '-'}</strong>?</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Esta ação não poderá ser desfeita.</p>
            </div>
          </div>
          <div className="flex justify-end gap-sm">
            <button type="button" onClick={() => setIsDeleteOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="button" onClick={handleDelete} className="px-md py-sm rounded bg-error text-on-error hover:opacity-90">Excluir</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAlocarOpen} onClose={() => setIsAlocarOpen(false)} title={`Alocar Funcionários — ${alocarTarget?.nome || ''}`}>
        <div className="flex flex-col gap-md">
          {/* Etapa info */}
          <div className="flex items-center gap-sm p-sm bg-surface-container-low rounded border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-[20px]">engineering</span>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface">{alocarTarget?.nome}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Aeronave: {alocarTarget?.aeronave?.codigo || '-'}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              className="w-full pl-[32px] pr-sm py-xs border border-outline-variant rounded bg-surface-container-lowest font-body-sm text-body-sm focus:border-primary focus:outline-none transition-all"
              placeholder="Buscar funcionário..."
              type="text"
              value={alocarSearch}
              onChange={(e) => setAlocarSearch(e.target.value)}
            />
          </div>

          {/* Selected count */}
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {selectedFuncIds.size} funcionário{selectedFuncIds.size !== 1 ? 's' : ''} selecionado{selectedFuncIds.size !== 1 ? 's' : ''}
          </p>

          {/* Employees list */}
          <div className="flex flex-col gap-xs max-h-[280px] overflow-y-auto pr-xs -mr-xs">
            {filteredFuncForModal.map((func) => {
              const isSelected = selectedFuncIds.has(func.id);
              return (
                <label
                  key={func.id}
                  className={`flex items-center gap-md p-sm rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-fixed/30 shadow-sm'
                      : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleFunc(func.id)}
                    className="sr-only"
                  />
                  <div className={`w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center font-label-sm text-label-sm text-on-primary-fixed shrink-0`}>
                    {getIniciais(func.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-label-md text-on-surface truncate">{func.nome}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">@{func.usuario}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'bg-primary border-primary' : 'border-outline-variant'
                  }`}>
                    {isSelected && <span className="material-symbols-outlined text-on-primary text-[16px]">check</span>}
                  </div>
                </label>
              );
            })}
            {filteredFuncForModal.length === 0 && (
              <p className="text-center text-on-surface-variant font-body-sm py-lg">Nenhum funcionário encontrado.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-sm mt-sm border-t border-outline-variant pt-md">
            <button type="button" onClick={() => setIsAlocarOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="button" onClick={handleAlocar} className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90 flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              Confirmar Alocação
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Filtros */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtros de Etapas">
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-md">
            <label className="font-label-md text-on-surface">Status da Etapa</label>
            <div className="flex flex-wrap gap-sm">
              {['Todos', 'Pendente', 'Em andamento', 'Concluída'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilters({ ...filters, status: s })}
                  className={`px-md py-xs rounded-full border transition-all font-label-sm ${filters.status === s ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary/50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-md">
            <label className="font-label-md text-on-surface">Aeronave</label>
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
              onClick={() => { setFilters({ status: 'Todos', aeronave: 'Todas' }); setIsFilterOpen(false); }}
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

export default Etapas;
