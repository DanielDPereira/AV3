import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Tooltip from '../../components/Tooltip';
import api from '../../services/api';

interface FuncAPI {
  id: number;
  nome: string;
  usuario: string;
  telefone: string;
  endereco: string;
  nivelPermissao: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR';
}

const inputCls = "px-sm py-xs border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim focus:outline-none w-full transition-all";
const btnPrimaryCls = "w-full md:w-auto bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]";
const btnFilterCls = "w-full md:w-auto flex items-center justify-center gap-xs px-md py-sm border rounded-lg font-label-sm text-label-sm transition-all";
const searchInputCls = "w-full pl-10 pr-sm py-2 border border-outline-variant rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all placeholder:text-outline-variant";
const tableHeaderCls = "px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-outline-variant";
const actionBtnBaseCls = "p-1.5 transition-colors rounded-full";
const actionBtnEditCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;
const actionBtnDeleteCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-error hover:bg-error-container/30`;
const actionBtnViewCls = `${actionBtnBaseCls} text-on-surface-variant hover:text-primary hover:bg-primary-fixed-dim/20`;

const nivelLabels: Record<string, string> = { ADMINISTRADOR: 'Administrador', ENGENHEIRO: 'Engenheiro', OPERADOR: 'Operador' };
const nivelVariants: Record<string, string> = {
  ADMINISTRADOR: 'bg-primary-container text-on-primary-container border-primary-container',
  ENGENHEIRO: 'bg-secondary-container text-on-secondary-container border-secondary-container',
  OPERADOR: 'bg-surface-container-high text-on-surface border-outline-variant',
};
const getIniciais = (nome: string) => nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'NO';

const Funcionarios: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<FuncAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoFunc, setNovoFunc] = useState({ nome: '', usuario: '', senha: '', telefone: '', endereco: '', tipo: 'OPERADOR' });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FuncAPI | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', telefone: '', endereco: '', usuario: '', tipo: 'OPERADOR' });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FuncAPI | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ nivel: 'Todos', search: '' });

  const fetchFuncionarios = useCallback(async () => {
    setIsLoading(true);
    try { const res = await api.get('/api/funcionarios'); setFuncionarios(res.data); } catch (err) { console.error('Erro ao buscar funcionários:', err); } finally { setIsLoading(false); }
  }, []);
  useEffect(() => { fetchFuncionarios(); }, [fetchFuncionarios]);

  const filteredFuncionarios = funcionarios.filter(f => {
    const matchesSearch = f.nome.toLowerCase().includes(filters.search.toLowerCase()) || 
                         f.usuario.toLowerCase().includes(filters.search.toLowerCase());
    const matchesNivel = filters.nivel === 'Todos' || nivelLabels[f.nivelPermissao] === filters.nivel;
    return matchesSearch && matchesNivel;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await api.post('/api/funcionarios', { nome: novoFunc.nome, usuario: novoFunc.usuario, senha: novoFunc.senha, telefone: novoFunc.telefone, endereco: novoFunc.endereco, nivelPermissao: novoFunc.tipo });
      setIsModalOpen(false); setNovoFunc({ nome: '', usuario: '', senha: '', telefone: '', endereco: '', tipo: 'OPERADOR' }); fetchFuncionarios();
    } catch (err) { console.error('Erro ao criar funcionário:', err); } finally { setSubmitLoading(false); }
  };

  const openEdit = (f: FuncAPI) => { setEditTarget(f); setEditForm({ nome: f.nome, telefone: f.telefone, endereco: f.endereco, usuario: f.usuario, tipo: f.nivelPermissao }); setIsEditOpen(true); };
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editTarget) return;
    setSubmitLoading(true);
    try {
      await api.put(`/api/funcionarios/${editTarget.id}`, { nome: editForm.nome, telefone: editForm.telefone, endereco: editForm.endereco, usuario: editForm.usuario, nivelPermissao: editForm.tipo });
      setIsEditOpen(false); fetchFuncionarios();
    } catch (err) { console.error('Erro ao editar funcionário:', err); } finally { setSubmitLoading(false); }
  };
  const openDelete = (f: FuncAPI) => { setDeleteTarget(f); setIsDeleteOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitLoading(true);
    try { await api.delete(`/api/funcionarios/${deleteTarget.id}`); setIsDeleteOpen(false); fetchFuncionarios(); } catch (err) { console.error('Erro ao excluir funcionário:', err); } finally { setSubmitLoading(false); }
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
              <span className="text-primary-container font-bold">Funcionários</span>
            </nav>
            <h1 className="font-h2 text-h2 text-on-surface">Diretório de Pessoal</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs hidden md:block">Gerencie o pessoal e níveis de acesso ao sistema.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-md w-full sm:w-auto">
            <div className="relative w-full md:w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                className={searchInputCls}
                placeholder="Buscar por nome ou usuário..."
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`${btnFilterCls} ${filters.nivel !== 'Todos' ? 'border-primary bg-primary-fixed text-primary shadow-sm' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filtros {filters.nivel !== 'Todos' && '•'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={btnPrimaryCls}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Novo Funcionário
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8 lg:p-xl flex-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px] md:min-w-0">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className={tableHeaderCls}>Nome</th>
                    <th className={`${tableHeaderCls} hidden lg:table-cell`}>Telefone</th>
                    <th className={`${tableHeaderCls} hidden sm:table-cell`}>Endereço</th>
                    <th className={tableHeaderCls}>Nível</th>
                    <th className={`${tableHeaderCls} text-right`}>Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                  {filteredFuncionarios.map((func) => (
                    <tr key={func.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-md px-lg">
                        <div className="flex items-center gap-md">
                          <div className={`w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-label-md text-label-md shrink-0 overflow-hidden text-on-primary-fixed`}>
                            {getIniciais(func.nome)}
                          </div>
                          <div className="min-w-0"><p className="font-label-md text-label-md text-on-surface truncate">{func.nome}</p><p className="font-body-sm text-body-sm text-on-surface-variant truncate">@{func.usuario}</p></div>
                        </div>
                      </td>
                      <td className="py-md px-lg font-body-md text-body-md text-on-surface-variant whitespace-nowrap hidden lg:table-cell">{func.telefone}</td>
                      <td className="py-md px-lg font-body-sm text-body-sm text-on-surface-variant max-w-[200px] truncate hidden sm:table-cell" title={func.endereco}>{func.endereco}</td>
                      <td className="py-md px-lg"><span className={`inline-flex items-center px-3 py-1 rounded-full ${nivelVariants[func.nivelPermissao] || ''} font-label-sm text-label-sm border`}>{nivelLabels[func.nivelPermissao] || func.nivelPermissao}</span></td>
                      <td className="py-md px-lg text-right">
                        <div className="flex items-center justify-end gap-xs lg:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <Tooltip label="Editar">
                            <button aria-label={`Editar ${func.nome}`} className={actionBtnEditCls} onClick={() => openEdit(func)}>
                              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          </Tooltip>
                          <Tooltip label="Excluir">
                            <button aria-label={`Remover ${func.nome}`} className={actionBtnDeleteCls} onClick={() => openDelete(func)}>
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
            <div className="p-md border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-md mt-auto">
              <span className="font-body-sm text-body-sm text-on-surface-variant text-center sm:text-left">Mostrando 1 a {filteredFuncionarios.length} de {funcionarios.length} funcionários</span>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Funcionário">
        <form className="flex flex-col gap-md" onSubmit={handleCreate}>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Nome</label><input type="text" value={novoFunc.nome} onChange={(e) => setNovoFunc({...novoFunc, nome: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Telefone</label><input type="text" value={novoFunc.telefone} onChange={(e) => setNovoFunc({...novoFunc, telefone: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Endereço</label><input type="text" value={novoFunc.endereco} onChange={(e) => setNovoFunc({...novoFunc, endereco: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Usuário (Login)</label><input type="text" value={novoFunc.usuario} onChange={(e) => setNovoFunc({...novoFunc, usuario: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Senha</label><input type="password" value={novoFunc.senha} onChange={(e) => setNovoFunc({...novoFunc, senha: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Tipo de Conta</label><select value={novoFunc.tipo} onChange={(e) => setNovoFunc({...novoFunc, tipo: e.target.value})} className={inputCls} required><option value="OPERADOR">1- Operador</option><option value="ENGENHEIRO">2- Engenheiro</option><option value="ADMINISTRADOR">3- Admin</option></select></div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Cadastrar</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Editar — ${editTarget?.nome || ''}`}>
        <form className="flex flex-col gap-md" onSubmit={handleEdit}>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Nome</label><input type="text" value={editForm.nome} onChange={(e) => setEditForm({...editForm, nome: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Telefone</label><input type="text" value={editForm.telefone} onChange={(e) => setEditForm({...editForm, telefone: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Endereço</label><input type="text" value={editForm.endereco} onChange={(e) => setEditForm({...editForm, endereco: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Usuário</label><input type="text" value={editForm.usuario} onChange={(e) => setEditForm({...editForm, usuario: e.target.value})} className={inputCls} required /></div>
          <div className="flex flex-col gap-xs"><label className="font-label-md text-on-surface">Tipo de Conta</label><select value={editForm.tipo} onChange={(e) => setEditForm({...editForm, tipo: e.target.value})} className={inputCls} required><option value="OPERADOR">1- Operador</option><option value="ENGENHEIRO">2- Engenheiro</option><option value="ADMINISTRADOR">3- Admin</option></select></div>
          <div className="flex justify-end gap-sm mt-md">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-md py-sm rounded text-primary hover:bg-primary-fixed">Cancelar</button>
            <button type="submit" className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90">Salvar Alterações</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirmar Exclusão">
        <div className="flex flex-col gap-lg">
          <div className="flex items-start gap-md">
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-error text-[20px]">warning</span></div>
            <div>
              <p className="font-body-md text-body-md text-on-surface">Tem certeza que deseja excluir o funcionário <strong>{deleteTarget?.nome}</strong>?</p>
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
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtros de Funcionários">
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-md">
            <label className="font-label-md text-on-surface">Nível de Acesso</label>
            <div className="grid grid-cols-1 gap-sm">
              {['Todos', 'Operador', 'Engenheiro', 'Administrador'].map((n) => (
                <button
                  key={n}
                  onClick={() => setFilters({ ...filters, nivel: n })}
                  className={`flex items-center justify-between px-md py-sm rounded-lg border-2 transition-all ${filters.nivel === n ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant hover:border-primary/30'}`}
                >
                  <span className="font-body-md">{n}</span>
                  {filters.nivel === n && <span className="material-symbols-outlined text-primary">check_circle</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
            <button 
              onClick={() => { setFilters({ nivel: 'Todos', search: '' }); setIsFilterOpen(false); }}
              className="px-md py-sm rounded text-error hover:bg-error-container/20 transition-colors"
            >
              Limpar Filtros
            </button>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="px-md py-sm rounded bg-primary text-on-primary hover:opacity-90 transition-opacity"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Funcionarios;
