
import React, { useState } from 'react';
import { Registration, User, UserRole, RegistrationType } from '../types.ts';
import { 
  Search, 
  Printer, 
  FileText, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter,
  Heart,
  Users as UsersIcon,
  MapPin,
  Download,
  AlertCircle
} from 'lucide-react';
import { SERVICE_TEAMS } from '../constants.ts';
import RegistrationForm from './RegistrationForm.tsx';

interface RegistrationListProps {
  currentUser: User;
  registrations: Registration[];
  onDelete: (id: string) => void;
  onEdit: (reg: Registration) => void;
}

const RegistrationList: React.FC<RegistrationListProps> = ({ currentUser, registrations, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterType, setFilterType] = useState<'all' | RegistrationType>('all');
  
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [viewingReg, setViewingReg] = useState<Registration | null>(null);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<Registration | null>(null);

  const filtered = registrations.filter(r => {
    const matchesSearch = 
      (r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       r.husbandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.wifeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.bairro.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTeam = filterTeam === 'all' || 
                       (r.servedTeams && r.servedTeams[filterTeam] > 0) || 
                       (r.coordinatedTeams && r.coordinatedTeams[filterTeam] > 0);
    
    const matchesType = filterType === 'all' || r.type === filterType;

    return matchesSearch && matchesTeam && matchesType;
  });

  const exportToCSV = () => {
    if (filtered.length === 0) return;
    
    const headers = ["Tipo", "Nome/Esposo", "Esposa", "Apelido", "Fone", "Bairro", "Cidade", "Equipes Servidas"];
    const rows = filtered.map(r => [
      r.type === RegistrationType.YOUTH ? "Jovem" : "Casal",
      r.type === RegistrationType.YOUTH ? r.fullName : r.husbandName,
      r.wifeName || "-",
      r.nickname,
      r.phone,
      r.bairro,
      r.city,
      Object.keys(r.servedTeams || {}).join(", ")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lista_ejc_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    if (passwordConfirm === '@dmin') {
      onDelete(showDeleteModal!);
      setShowDeleteModal(null);
      setPasswordConfirm('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleEditConfirm = (reg: Registration) => {
    if (passwordConfirm === currentUser.password) {
      setEditingReg(reg);
      setShowEditModal(null);
      setPasswordConfirm('');
    } else {
      alert('Sua senha está incorreta!');
    }
  };

  const handlePrint = (reg: Registration) => {
    setViewingReg(reg);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (editingReg) {
    return (
      <div>
        <button onClick={() => setEditingReg(null)} className="mb-4 text-amber-800 font-bold flex items-center gap-2">
          ← Voltar para a lista
        </button>
        <RegistrationForm 
          currentUser={currentUser} 
          onSubmit={(updated) => {
            onEdit(updated);
            setEditingReg(null);
          }} 
          initialData={editingReg} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nome, apelido, bairro ou cidade..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
             <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value={RegistrationType.YOUTH}>Apenas Jovens</option>
              <option value={RegistrationType.COUPLE}>Apenas Casais</option>
            </select>

            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 text-green-700 font-bold border border-green-100 hover:bg-green-100 transition-all"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(reg => (
          <div key={reg.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative">
            {(reg as any).observations && (
               <div className="absolute top-2 right-2" title="Possui observações de saúde">
                 <AlertCircle className="w-5 h-5 text-orange-500 fill-orange-50" />
               </div>
            )}
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {reg.photo ? (
                  <img src={reg.photo} className="w-16 h-20 rounded-lg object-cover shadow-sm" alt={reg.nickname} />
                ) : (
                  <div className={`w-16 h-20 rounded-lg flex items-center justify-center text-slate-400 ${reg.type === RegistrationType.COUPLE ? 'bg-red-50' : 'bg-slate-100'}`}>
                    {reg.type === RegistrationType.COUPLE ? <Heart className="w-8 h-8 text-red-300" /> : <UsersIcon className="w-8 h-8 text-slate-300" />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 truncate pr-2">
                    {reg.type === RegistrationType.YOUTH ? reg.fullName : `${reg.husbandName} & ${reg.wifeName}`}
                  </h4>
                </div>
                <p className="text-amber-800 font-semibold text-sm">"{reg.nickname}"</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${reg.type === RegistrationType.COUPLE ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {reg.type === RegistrationType.COUPLE ? 'Casal' : 'Jovem'}
                  </span>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{reg.bairro}, {reg.city}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="flex gap-1">
                <button onClick={() => setViewingReg(reg)} className="p-2 rounded-lg text-slate-400 hover:text-amber-800 hover:bg-amber-50"><Eye className="w-5 h-5" /></button>
                <button onClick={() => setShowEditModal(reg)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit3 className="w-5 h-5" /></button>
                <button onClick={() => handlePrint(reg)} className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50"><Printer className="w-5 h-5" /></button>
              </div>
              <button onClick={() => setShowDeleteModal(reg.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum registro encontrado.</p>
        </div>
      )}

      {viewingReg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-10 shadow-2xl relative">
            <button onClick={() => setViewingReg(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full no-print">
              <XCircle className="w-6 h-6 text-slate-500" />
            </button>

            <div id="print-area">
              <div className="flex items-center gap-4 border-b-2 border-amber-800 pb-6 mb-8">
                <div className="w-20 h-20 bg-amber-800 flex items-center justify-center rounded-2xl text-white">
                  <span className="text-4xl font-bold">{viewingReg.type === RegistrationType.COUPLE ? 'ECC' : 'EJC'}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-900 uppercase">Ficha de Cadastro: {viewingReg.type === RegistrationType.COUPLE ? 'Casal' : 'Encontrista'}</h2>
                  <p className="text-slate-600">Paróquia São Francisco das Chagas</p>
                </div>
                <div className="ml-auto">
                  {viewingReg.photo ? (
                    <img src={viewingReg.photo} className="w-24 h-32 object-cover border-2 border-slate-200 rounded-lg" alt="Foto" />
                  ) : (
                    <div className="w-24 h-32 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">FOTO</div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
                <div>
                  <h3 className="font-bold text-amber-800 border-b border-amber-100 mb-2">IDENTIFICAÇÃO</h3>
                  {viewingReg.type === RegistrationType.YOUTH ? (
                    <p><span className="font-semibold text-xs uppercase text-slate-400">Nome:</span> {viewingReg.fullName}</p>
                  ) : (
                    <>
                      <p><span className="font-semibold text-xs uppercase text-slate-400">Esposo:</span> {viewingReg.husbandName}</p>
                      <p><span className="font-semibold text-xs uppercase text-slate-400">Esposa:</span> {viewingReg.wifeName}</p>
                    </>
                  )}
                  <p><span className="font-semibold text-xs uppercase text-slate-400">Apelido:</span> {viewingReg.nickname}</p>
                  <p><span className="font-semibold text-xs uppercase text-slate-400">Endereço:</span> {viewingReg.address}, {viewingReg.bairro}</p>
                  <p><span className="font-semibold text-xs uppercase text-slate-400">Cidade/UF:</span> {viewingReg.city} - {viewingReg.state}</p>
                  <p><span className="font-semibold text-xs uppercase text-slate-400">Contato:</span> {viewingReg.phone}</p>
                </div>

                <div>
                  <h3 className="font-bold text-amber-800 border-b border-amber-100 mb-2">SAÚDE / OBSERVAÇÕES</h3>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 italic text-slate-700 min-h-[80px]">
                    {(viewingReg as any).observations || "Nenhuma observação informada."}
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-between gap-8 no-print">
                <button onClick={() => handlePrint(viewingReg)} className="flex-1 bg-amber-800 text-white py-3 rounded-xl font-bold flex items-center gap-2 justify-center"><Printer className="w-5 h-5" /> Imprimir Ficha</button>
                <button onClick={() => setViewingReg(null)} className="flex-1 border border-slate-200 py-3 rounded-xl font-bold">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar Edição</h3>
            <p className="text-slate-500 text-sm mb-4">Confirme sua senha de acesso para editar.</p>
            <input type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4" placeholder="Sua senha" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowEditModal(null)} className="flex-1 py-2 rounded-xl border">Cancelar</button>
              <button onClick={() => handleEditConfirm(showEditModal)} className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-red-600 mb-2">Excluir Registro?</h3>
            <p className="text-slate-500 text-sm mb-4 italic">Digite a senha master do administrador (@dmin).</p>
            <input type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4" placeholder="Senha do Administrador Geral" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-2 rounded-xl border">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationList;
