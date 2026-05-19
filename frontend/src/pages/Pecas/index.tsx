import React, { useState } from 'react';

import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Tooltip from '../../components/Tooltip';
import { type Peca, mockPecas } from '../../types/pecas';

const inputCls = "px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none w-full transition-all";
const btnPrimaryCls = "w-full md:w-auto bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]";
const btnFilterCls = "w-full md:w-auto flex items-center justify-center gap-xs px-md py-sm border rounded-lg font-label-sm text-label-sm transition-all";
const searchInputCls = "w-full pl-10 pr-sm py-2 border border-outline-variant rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all placeholder:text-outline-variant";
const tableHeaderCls = "px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-outline-variant";
const actionBtnBaseCls = "p-1.5 transition-colors rounded-full";
const actionBtnEditCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnDeleteCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-error hover:bg-error-container/30`;
const actionBtnViewCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnStatusCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;

type StatusKey = 'producao' | 'transporte' | 'pronta';

const statusOptions: Record<StatusKey, { label: Peca['status']; icon: string; variant: string }> = {
  producao: { label: 'Em produção', icon: 'precision_manufacturing', variant: 'bg-primary-fixed text-on-primary-fixed' },
  transporte: { label: 'Em transporte', icon: 'local_shipping', variant: 'bg-secondary-container text-on-secondary-container' },
  pronta: { label: 'Pronta', icon: 'check_circle', variant: 'bg-surface-tint text-on-primary' },
};

const statusToKey = (status: Peca['status']): StatusKey =>
  status === 'Em produção' ? 'producao' : status === 'Em transporte' ? 'transporte' : 'pronta';

const Pecas: React.FC = () => {
  const [pecas, setPecas] = useState<Peca[]>(mockPecas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaPeca, setNovaPeca] = useState({ aeronave: '', nome: '', fornecedor: '', tipo: 'Nacional' });

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Peca | null>(null);
  const [editForm, setEditForm] = useState({ aeronave: '', nome: '', fornecedor: '', tipo: 'Nacional' });

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Peca | null>(null);

  // Status state
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Peca | null>(null);
  const [statusVal, setStatusVal] = useState<StatusKey>('producao');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ tipo: 'Todos', status: 'Todos', aeronave: 'Todas' });

  const uniqueAeronaves = Array.from(new Set(pecas.filter(p => p.aeronave).map(p => p.aeronave!)));

  const filteredPecas = pecas.filter(peca => {
    const matchesSearch = peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (peca.aeronave && peca.aeronave.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTipo = filters.tipo === 'Todos' || peca.tipo === filters.tipo;
    const matchesStatus = filters.status === 'Todos' || peca.status === filters.status;
    const matchesAeronave = filters.aeronave === 'Todas' || peca.aeronave === filters.aeronave;
    return matchesSearch && matchesTipo && matchesStatus && matchesAeronave;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const peca: Peca = {
      id: Math.random().toString(),
      aeronave: novaPeca.aeronave,
      nome: novaPeca.nome,
      fornecedor: novaPeca.fornecedor,
      tipo: novaPeca.tipo as 'Nacional' | 'Importada',
      status: 'Em produção',
      statusBadgeVariant: statusOptions.producao.variant,
      statusIcon: statusOptions.producao.icon,
      tipoBadgeVariant: novaPeca.tipo === 'Nacional' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed',
    };
    setPecas([peca, ...pecas]);
    setIsModalOpen(false);
    setNovaPeca({ aeronave: '', nome: '', fornecedor: '', tipo: 'Nacional' });
  };

  const openEdit = (p: Peca) => {
    setEditTarget(p);
    setEditForm({ aeronave: p.aeronave || '', nome: p.nome, fornecedor: p.fornecedor, tipo: p.tipo });
    setIsEditOpen(true);
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setPecas(pecas.map(p =>
      p.id === editTarget.id
        ? {
            ...p,
            aeronave: editForm.aeronave,
            nome: editForm.nome,
            fornecedor: editForm.fornecedor,
            tipo: editForm.tipo as 'Nacional' | 'Importada',
            tipoBadgeVariant: editForm.tipo === 'Nacional' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed',
          }
        : p
    ));
    setIsEditOpen(false);
  };

  const openDelete = (p: Peca) => { setDeleteTarget(p); setIsDeleteOpen(true); };
  const handleDelete = () => {
    if (!deleteTarget) return;
    setPecas(pecas.filter(p => p.id !== deleteTarget.id));
    setIsDeleteOpen(false);
  };

  const openStatus = (p: Peca) => {
    setStatusTarget(p);
    setStatusVal(statusToKey(p.status));
    setIsStatusOpen(true);
  };
  const handleStatus = () => {
    if (!statusTarget) return;
    const opt = statusOptions[statusVal];
    setPecas(pecas.map(p =>
      p.id === statusTarget.id
        ? { ...p, status: opt.label, statusIcon: opt.icon, statusBadgeVariant: opt.variant }
        : p
    ));
    setIsStatusOpen(false);
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
              <span className="text-primary-container font-bold">Peças</span>
            </nav>
            <h1 className="font-h2 text-h2 text-on-surface">Inventário de Peças</h1>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-md w-full sm:w-auto">
            <div className="relative w-full md:w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                className={searchInputCls}
                placeholder="Buscar peças..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`${btnFilterCls} ${ (filters.tipo !== 'Todos' || filters.status !== 'Todos' || filters.aeronave !== 'Todas') ? 'border-primary bg-primary-fixed text-primary shadow-sm' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros { (filters.tipo !== 'Todos' || filters.status !== 'Todos' || filters.aeronave !== 'Todas') && '•'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={btnPrimaryCls}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nova Peça
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 lg:p-xl flex flex-col gap-6 md:gap-lg flex-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] md:min-w-0">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className={tableHeaderCls}>Nome</th>
                    <th className={tableHeaderCls}>Tipo</th>
                    <th className={`${tableHeaderCls} hidden lg:table-cell`}>Fornecedor</th>
                    <th className={`${tableHeaderCls} hidden sm:table-cell`}>Aeronave</th>
                    <th className={tableHeaderCls}>Status</th>
                    <th className={`${tableHeaderCls} text-right`}>Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredPecas.map((peca) => (
                    <tr key={peca.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="p-md text-body-sm font-body-sm text-on-surface font-medium">{peca.nome}</td>
                      <td className="p-md">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-label-sm font-label-sm ${peca.tipoBadgeVariant}`}>
                          {peca.tipo}
                        </span>
                      </td>
                      <td className="p-md text-body-sm font-body-sm text-secondary hidden lg:table-cell">{peca.fornecedor}</td>
                      <td className="p-md text-body-sm font-body-sm text-on-surface hidden sm:table-cell">{peca.aeronave || '-'}</td>
                      <td className="p-md">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm ${peca.statusBadgeVariant}`}>
                          <span className="material-symbols-outlined text-[14px]">{peca.statusIcon}</span>
                          {peca.status}
                        </span>
                      </td>
                      <td className="p-md text-right">
                        <div className="flex items-center justify-end gap-xs lg:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <Tooltip label="Editar">
                            <button
                              aria-label={`Editar peça ${peca.nome}`}
                              className={actionBtnEditCls}
                              onClick={() => openEdit(peca)}
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          </Tooltip>
                          <Tooltip label="Alterar Status">
                            <button
                              aria-label={`Alterar status de ${peca.nome}`}
                              className={actionBtnStatusCls}
                              onClick={() => openStatus(peca)}
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">published_with_changes</span>
                            </button>
                          </Tooltip>
                          <Tooltip label="Excluir">
                            <button
                              aria-label={`Excluir peça ${peca.nome}`}
                              className={actionBtnDeleteCls}
                              onClick={() => openDelete(peca)}
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
              <span className="text-body-sm font-body-sm text-secondary text-center sm:text-left">Mostrando 1 a {filteredPecas.length} de {pecas.length} peças</span>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Peça a uma Aeronave">
        <form className="flex flex-col gap-md" onSubmit={handleCreate}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código da Aeronave alvo</label>
            <input type="text" value={novaPeca.aeronave} onChange={(e) => setNovaPeca({ ...novaPeca, aeronave: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Nome do componente</label>
            <input type="text" value={novaPeca.nome} onChange={(e) => setNovaPeca({ ...novaPeca, nome: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Empresa fornecedora</label>
            <input type="text" value={novaPeca.fornecedor} onChange={(e) => setNovaPeca({ ...novaPeca, fornecedor: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Origem</label>
            <select value={novaPeca.tipo} onChange={(e) => setNovaPeca({ ...novaPeca, tipo: e.target.value })} className={inputCls} required>
              <option value="Nacional">1- Nacional</option>
              <option value="Importada">2- Importada</option>
            </select>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Cadastrar</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Editar — ${editTarget?.nome || ''}`}>
        <form className="flex flex-col gap-md" onSubmit={handleEdit}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código da Aeronave</label>
            <input type="text" value={editForm.aeronave} onChange={(e) => setEditForm({ ...editForm, aeronave: e.target.value })} className={inputCls} />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Nome do componente</label>
            <input type="text" value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Empresa fornecedora</label>
            <input type="text" value={editForm.fornecedor} onChange={(e) => setEditForm({ ...editForm, fornecedor: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Origem</label>
            <select value={editForm.tipo} onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })} className={inputCls} required>
              <option value="Nacional">1- Nacional</option>
              <option value="Importada">2- Importada</option>
            </select>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Salvar Alterações</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title={`Status — ${statusTarget?.nome || ''}`}>
        <div className="flex flex-col gap-lg">
          <p className="font-body-md text-body-md text-on-surface">Selecione o novo status da peça:</p>
          <div className="flex flex-col gap-sm">
            {(Object.entries(statusOptions) as [StatusKey, typeof statusOptions[StatusKey]][]).map(([key, opt]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusVal(key)}
                className={`flex items-center gap-md p-md rounded-xl border-2 transition-all text-left ${statusVal === key ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant hover:border-primary/40'}`}
              >
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm ${opt.variant}`}>
                  <span className="material-symbols-outlined text-[14px]">{opt.icon}</span>
                </span>
                <span className="font-label-md text-on-surface">{opt.label}</span>
                {statusVal === key && <span className="material-symbols-outlined text-primary ml-auto text-[20px]">check_circle</span>}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-sm">
            <button type="button" onClick={() => setIsStatusOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="button" onClick={handleStatus} className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Confirmar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirmar Exclusão">
        <div className="flex flex-col gap-lg">
          <div className="flex items-start gap-md">
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            </div>
            <div>
              <p className="font-body-md text-body-md text-on-surface">Tem certeza que deseja excluir a peça <strong>{deleteTarget?.nome}</strong>?</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Esta ação não poderá ser desfeita.</p>
            </div>
          </div>
          <div className="flex justify-end gap-sm">
            <button type="button" onClick={() => setIsDeleteOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="button" onClick={handleDelete} className="px-md py-sm rounded bg-error text-on-error hover:opacity-90">Excluir</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtros de Peças">
        <div className="flex flex-col gap-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-md">
              <label className="font-label-md text-on-surface font-semibold">Origem</label>
              <div className="flex flex-col gap-sm">
                {['Todos', 'Nacional', 'Importada'].map((t) => (
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
              <label className="font-label-md text-on-surface font-semibold">Status</label>
              <div className="flex flex-col gap-sm">
                {['Todos', 'Em produção', 'Em transporte', 'Pronta'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters({ ...filters, status: s })}
                    className={`flex items-center justify-between px-md py-sm rounded-lg border-2 transition-all ${filters.status === s ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant hover:border-primary/30'}`}
                  >
                    <span className="font-body-md">{s}</span>
                    {filters.status === s && <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-md">
            <label className="font-label-md text-on-surface font-semibold">Aeronave Destino</label>
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
              onClick={() => { setFilters({ tipo: 'Todos', status: 'Todos', aeronave: 'Todas' }); setIsFilterOpen(false); }}
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

export default Pecas;
