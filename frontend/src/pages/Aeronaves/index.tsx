import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Tooltip from '../../components/Tooltip';
import { type Aeronave, mockAeronaves } from '../../types/aeronaves';

const inputCls = "px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none w-full transition-all";
const btnPrimaryCls = "w-full md:w-auto bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]";
const btnFilterCls = "w-full md:w-auto flex items-center justify-center gap-xs px-md py-sm border rounded-lg font-label-sm text-label-sm transition-all";
const searchInputCls = "w-full pl-10 pr-sm py-2 border border-outline-variant rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all placeholder:text-outline-variant";
const tableHeaderCls = "px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-outline-variant";
const actionBtnBaseCls = "p-1.5 transition-colors rounded-full";
const actionBtnEditCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnDeleteCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-error hover:bg-error-container/30`;
const actionBtnViewCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;

const Aeronaves: React.FC = () => {
  const navigate = useNavigate();
  const [aeronaves, setAeronaves] = useState<Aeronave[]>(mockAeronaves);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaAeronave, setNovaAeronave] = useState({ codigo: '', modelo: '', tipo: 'Comercial', capacidade: '', alcance: '' });

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Aeronave | null>(null);
  const [editForm, setEditForm] = useState({ codigo: '', modelo: '', tipo: 'Comercial', capacidade: '', alcance: '' });

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Aeronave | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ tipo: 'Todos', minCapacidade: '' });

  const filteredAeronaves = aeronaves.filter(aero => {
    const matchesSearch = aero.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aero.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filters.tipo === 'Todos' || aero.tipo === filters.tipo;
    const matchesCapacidade = !filters.minCapacidade || aero.capacidade >= Number(filters.minCapacidade);
    return matchesSearch && matchesTipo && matchesCapacidade;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const aero: Aeronave = {
      id: Math.random().toString(),
      codigo: novaAeronave.codigo,
      modelo: novaAeronave.modelo,
      tipo: novaAeronave.tipo as 'Comercial' | 'Militar',
      capacidade: Number(novaAeronave.capacidade),
      alcance: Number(novaAeronave.alcance),
      tipoBadgeColor: novaAeronave.tipo === 'Comercial' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed',
    };
    setAeronaves([aero, ...aeronaves]);
    setIsModalOpen(false);
    setNovaAeronave({ codigo: '', modelo: '', tipo: 'Comercial', capacidade: '', alcance: '' });
  };

  const openEdit = (a: Aeronave) => {
    setEditTarget(a);
    setEditForm({ codigo: a.codigo, modelo: a.modelo, tipo: a.tipo, capacidade: String(a.capacidade), alcance: String(a.alcance) });
    setIsEditOpen(true);
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setAeronaves(aeronaves.map(a =>
      a.id === editTarget.id
        ? {
            ...a,
            codigo: editForm.codigo,
            modelo: editForm.modelo,
            tipo: editForm.tipo as 'Comercial' | 'Militar',
            capacidade: Number(editForm.capacidade),
            alcance: Number(editForm.alcance),
            tipoBadgeColor: editForm.tipo === 'Comercial' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed',
          }
        : a
    ));
    setIsEditOpen(false);
  };

  const openDelete = (a: Aeronave) => { setDeleteTarget(a); setIsDeleteOpen(true); };
  const handleDelete = () => {
    if (!deleteTarget) return;
    setAeronaves(aeronaves.filter(a => a.id !== deleteTarget.id));
    setIsDeleteOpen(false);
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
              <span className="text-primary-container font-bold">Aeronaves</span>
            </nav>
            <h1 className="font-h2 text-h2 text-on-surface">Gestão de Frota</h1>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-md w-full sm:w-auto">
            <div className="relative w-full md:w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                className={searchInputCls}
                placeholder="Buscar aeronave..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`${btnFilterCls} ${ (filters.tipo !== 'Todos' || filters.minCapacidade !== '') ? 'border-primary bg-primary-fixed text-primary shadow-sm' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros { (filters.tipo !== 'Todos' || filters.minCapacidade !== '') && '•'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={btnPrimaryCls}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nova Aeronave
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8 lg:p-xl flex flex-col gap-6 md:gap-lg flex-1">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm relative overflow-hidden h-24 md:h-auto flex flex-col justify-center md:justify-start">
              <div className="font-label-md text-label-md text-on-surface-variant mb-xs">Total Registrado</div>
              <div className="font-h2 text-h2 text-on-surface">142</div>
              <div className="absolute -right-2 -bottom-2 opacity-5 hidden md:block">
                <span className="material-symbols-outlined text-[80px]">flight</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm h-24 md:h-auto flex flex-col justify-center md:justify-start">
              <div className="font-label-md text-label-md text-on-surface-variant mb-xs">Em Produção</div>
              <div className="font-h2 text-h2 text-primary-container">18</div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm h-24 md:h-auto flex flex-col justify-center md:justify-start">
              <div className="font-label-md text-label-md text-on-surface-variant mb-xs">Aguardando Testes</div>
              <div className="font-h2 text-h2 text-tertiary-container">05</div>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className={tableHeaderCls}>Código</th>
                    <th className={tableHeaderCls}>Modelo</th>
                    <th className={tableHeaderCls}>Tipo</th>
                    <th className={`${tableHeaderCls} hidden sm:table-cell`}>Capacidade</th>
                    <th className={`${tableHeaderCls} hidden lg:table-cell`}>Alcance</th>
                    <th className={`${tableHeaderCls} text-right`}>Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {filteredAeronaves.map((aero) => (
                    <tr key={aero.id} className="hover:bg-surface-container transition-colors group">
                      <td className="py-md px-lg font-code text-code text-on-surface font-semibold">{aero.codigo}</td>
                      <td className="py-md px-lg font-body-sm text-body-sm text-on-surface">{aero.modelo}</td>
                      <td className="py-md px-lg">
                        <span className={`inline-flex items-center px-2 py-1 rounded-sm font-label-sm text-label-sm ${aero.tipoBadgeColor}`}>
                          {aero.tipo}
                        </span>
                      </td>
                      <td className="py-md px-lg font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">{aero.capacidade} passageiros</td>
                      <td className="py-md px-lg font-body-sm text-body-sm text-on-surface-variant hidden lg:table-cell">{aero.alcance} km</td>
                      <td className="py-md px-lg text-right">
                        <div className="flex items-center justify-end gap-xs lg:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <Tooltip label="Ver Etapas">
                            <button
                              aria-label={`Ver etapas de ${aero.codigo}`}
                              className={actionBtnViewCls}
                              onClick={() => navigate(`/etapas?search=${aero.codigo}`)}
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">assignment</span>
                            </button>
                          </Tooltip>
                          <Tooltip label="Editar">
                            <button
                              aria-label={`Editar ${aero.codigo}`}
                              className={actionBtnEditCls}
                              onClick={() => openEdit(aero)}
                            >
                              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          </Tooltip>
                          <Tooltip label="Excluir">
                            <button
                              aria-label={`Excluir ${aero.codigo}`}
                              className={actionBtnDeleteCls}
                              onClick={() => openDelete(aero)}
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
            {/* Table Footer / Pagination */}
            <div className="px-lg py-sm border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between mt-auto gap-md">
              <span className="font-body-sm text-body-sm text-on-surface-variant text-center sm:text-left">Mostrando 1 a {filteredAeronaves.length} de {filteredAeronaves.length} aeronaves</span>
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

      {/* Modal: Nova Aeronave */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar nova Aeronave">
        <form className="flex flex-col gap-md" onSubmit={handleCreate}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código único</label>
            <input type="text" value={novaAeronave.codigo} onChange={(e) => setNovaAeronave({ ...novaAeronave, codigo: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Modelo</label>
            <input type="text" value={novaAeronave.modelo} onChange={(e) => setNovaAeronave({ ...novaAeronave, modelo: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Capacidade de Passageiros</label>
            <input type="number" value={novaAeronave.capacidade} onChange={(e) => setNovaAeronave({ ...novaAeronave, capacidade: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Alcance em Km</label>
            <input type="number" value={novaAeronave.alcance} onChange={(e) => setNovaAeronave({ ...novaAeronave, alcance: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Tipo</label>
            <select value={novaAeronave.tipo} onChange={(e) => setNovaAeronave({ ...novaAeronave, tipo: e.target.value })} className={inputCls} required>
              <option value="Comercial">1- Comercial</option>
              <option value="Militar">2- Militar</option>
            </select>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Cadastrar</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Editar Aeronave */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Editar — ${editTarget?.codigo || ''}`}>
        <form className="flex flex-col gap-md" onSubmit={handleEdit}>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Código único</label>
            <input type="text" value={editForm.codigo} onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Modelo</label>
            <input type="text" value={editForm.modelo} onChange={(e) => setEditForm({ ...editForm, modelo: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Capacidade de Passageiros</label>
            <input type="number" value={editForm.capacidade} onChange={(e) => setEditForm({ ...editForm, capacidade: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Alcance em Km</label>
            <input type="number" value={editForm.alcance} onChange={(e) => setEditForm({ ...editForm, alcance: e.target.value })} className={inputCls} required />
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Tipo</label>
            <select value={editForm.tipo} onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })} className={inputCls} required>
              <option value="Comercial">1- Comercial</option>
              <option value="Militar">2- Militar</option>
            </select>
          </div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Salvar Alterações</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirmar Exclusão">
        <div className="flex flex-col gap-lg">
          <div className="flex items-start gap-md">
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            </div>
            <div>
              <p className="font-body-md text-body-md text-on-surface">Tem certeza que deseja excluir a aeronave <strong>{deleteTarget?.codigo}</strong> ({deleteTarget?.modelo})?</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Esta ação não poderá ser desfeita.</p>
            </div>
          </div>
          <div className="flex justify-end gap-sm">
            <button type="button" onClick={() => setIsDeleteOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="button" onClick={handleDelete} className="px-md py-sm rounded bg-error text-on-error hover:opacity-90">Excluir</button>
          </div>
        </div>
      </Modal>

      {/* Modal: Filtros */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtros de Frota">
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-md">
            <label className="font-label-md text-on-surface font-semibold">Tipo de Aeronave</label>
            <div className="grid grid-cols-3 gap-sm">
              {['Todos', 'Comercial', 'Militar'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilters({ ...filters, tipo: t })}
                  className={`px-md py-sm rounded-lg border-2 transition-all font-label-sm ${filters.tipo === t ? 'border-primary bg-primary-fixed/30 text-primary' : 'border-outline-variant hover:border-primary/30 text-on-surface-variant'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-md">
            <label className="font-label-md text-on-surface font-semibold">Capacidade Mínima (Passageiros)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">group</span>
              <input 
                type="number" 
                placeholder="Ex: 100" 
                value={filters.minCapacidade}
                onChange={(e) => setFilters({ ...filters, minCapacidade: e.target.value })}
                className="w-full pl-[40px] pr-md py-sm border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
            <button 
              onClick={() => { setFilters({ tipo: 'Todos', minCapacidade: '' }); setIsFilterOpen(false); }}
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

export default Aeronaves;
