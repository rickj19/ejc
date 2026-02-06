
import React, { useState, useEffect } from 'react';
import { Registration, User, UserRole, RegistrationType } from '../types.ts';
import { SCHOOLING_OPTIONS, SERVICE_TEAMS, APP_THEME } from '../constants.ts';
import { 
  Camera, 
  Save, 
  AlertCircle, 
  Plus, 
  Minus, 
  Users, 
  Heart, 
  MapPin, 
  Search, 
  AlertOctagon,
  GraduationCap,
  Briefcase,
  History,
  Trophy,
  Check
} from 'lucide-react';

interface RegistrationFormProps {
  currentUser: User;
  onSubmit: (reg: Registration) => void;
  initialData?: Registration;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ currentUser, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Registration & { observations?: string }>>(initialData || {
    type: RegistrationType.YOUTH,
    fullName: '',
    husbandName: '',
    wifeName: '',
    nickname: '',
    zipCode: '',
    city: '',
    state: '',
    address: '',
    number: '',
    bairro: '',
    referencePoint: '',
    phone: '',
    birthDate: '',
    schooling: SCHOOLING_OPTIONS[0],
    profession: '',
    ejcHistoryYear: '',
    ejcHistoryCircle: '',
    sacraments: { baptism: false, eucharist: false, confirmation: false, none: false },
    isPastoralMember: false,
    hasMusicalTalent: false,
    hasChildren: false,
    isMarried: false,
    servedTeams: {},
    coordinatedTeams: {},
    photo: '',
    observations: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.type === RegistrationType.YOUTH && !formData.fullName) newErrors.fullName = 'Nome completo é obrigatório';
    if (formData.type === RegistrationType.COUPLE) {
      if (!formData.husbandName) newErrors.husbandName = 'Nome do esposo é obrigatório';
      if (!formData.wifeName) newErrors.wifeName = 'Nome da esposa é obrigatório';
    }
    if (!formData.nickname) newErrors.nickname = 'Como gosta de ser chamado é obrigatório';
    if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
    if (!formData.address) newErrors.address = 'Endereço é obrigatório';
    if (!formData.bairro) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.city) newErrors.city = 'Cidade é obrigatória';
    if (!formData.phone) newErrors.phone = 'Contato é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '').substring(0, 8);
    setFormData(prev => ({ ...prev, zipCode: cep }));
    
    if (cep.length === 8) {
      searchCep(cep);
    }
  };

  const searchCep = async (cep: string) => {
    setIsSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || prev.address,
          bairro: data.bairro || prev.bairro,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateTeamCount = (type: 'servedTeams' | 'coordinatedTeams', team: string, delta: number) => {
    setFormData(prev => {
      const current = { ...(prev[type] || {}) };
      const currentVal = current[team] || 0;
      const newVal = Math.max(0, currentVal + delta);
      
      if (newVal === 0) {
        delete current[team];
      } else {
        current[team] = newVal;
      }
      
      return {
        ...prev,
        [type]: current
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newReg: Registration = {
      ...formData as Registration,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      registeredBy: currentUser.username,
      createdAt: initialData?.createdAt || Date.now(),
    };
    onSubmit(newReg);
  };

  const isIneligible = formData.type === RegistrationType.YOUTH && (formData.hasChildren || formData.isMarried);

  const TeamSelector = ({ title, type, icon: Icon }: { title: string, type: 'servedTeams' | 'coordinatedTeams', icon: any }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${type === 'coordinatedTeams' ? 'text-amber-600' : 'text-slate-600'}`} />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SERVICE_TEAMS.map(team => {
          const count = (formData[type] as any)?.[team] || 0;
          return (
            <div 
              key={team} 
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                count > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <span className={`text-sm font-medium ${count > 0 ? 'text-amber-900' : 'text-slate-600'}`}>{team}</span>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => updateTeamCount(type, team, -1)}
                  className="p-1 rounded-md hover:bg-white text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className={`text-xs font-black w-4 text-center ${count > 0 ? 'text-amber-800' : 'text-slate-300'}`}>
                  {count}
                </span>
                <button 
                  type="button"
                  onClick={() => updateTeamCount(type, team, 1)}
                  className="p-1 rounded-md hover:bg-white text-slate-400 hover:text-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-32">
      <div className="flex bg-slate-200 p-1 rounded-2xl w-full sm:w-80 mx-auto shadow-inner">
        <button 
          type="button"
          onClick={() => setFormData({...formData, type: RegistrationType.YOUTH})}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${formData.type === RegistrationType.YOUTH ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`}
        >
          Ficha Jovem
        </button>
        <button 
          type="button"
          onClick={() => setFormData({...formData, type: RegistrationType.COUPLE})}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${formData.type === RegistrationType.COUPLE ? 'bg-white text-amber-900 shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`}
        >
          Ficha Casal
        </button>
      </div>

      {isIneligible && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-start gap-3 animate-pulse">
          <AlertOctagon className="w-6 h-6 text-orange-600 shrink-0" />
          <div>
            <h4 className="font-bold text-orange-800">Atenção! Perfil Restrito</h4>
            <p className="text-sm text-orange-700">Jovem com filho ou casado não pode participar do EJC como encontrista (Norma Diocesana).</p>
          </div>
        </div>
      )}

      {/* 1. Dados Pessoais */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
          {formData.type === RegistrationType.YOUTH ? <Users className="w-5 h-5 text-amber-800" /> : <Heart className="w-5 h-5 text-red-600" />}
          1. {formData.type === RegistrationType.YOUTH ? 'Dados Pessoais' : 'Dados do Casal'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 relative group h-full min-h-[160px]">
            {formData.photo ? (
              <img src={formData.photo} className="w-32 h-40 object-cover rounded-lg shadow-md mb-2" alt="Foto 3x4" />
            ) : (
              <div className="w-32 h-40 bg-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 mb-2">
                <Camera className="w-10 h-10" />
                <span className="text-xs mt-2 text-center px-2">Clique para foto 3x4</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.type === RegistrationType.YOUTH ? (
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  value={formData.fullName} 
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-amber-500 bg-slate-50 ${errors.fullName ? 'border-red-500' : 'border-slate-200'}`}
                />
                {errors.fullName && <span className="text-xs text-red-500 mt-1">{errors.fullName}</span>}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Esposo *</label>
                  <input 
                    type="text" 
                    value={formData.husbandName} 
                    onChange={e => setFormData({ ...formData, husbandName: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-amber-500 bg-slate-50 ${errors.husbandName ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  {errors.husbandName && <span className="text-xs text-red-500 mt-1">{errors.husbandName}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nome da Esposa *</label>
                  <input 
                    type="text" 
                    value={formData.wifeName} 
                    onChange={e => setFormData({ ...formData, wifeName: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-amber-500 bg-slate-50 ${errors.wifeName ? 'border-red-500' : 'border-slate-200'}`}
                  />
                  {errors.wifeName && <span className="text-xs text-red-500 mt-1">{errors.wifeName}</span>}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Como gosta de ser chamado? *</label>
              <input 
                type="text" 
                value={formData.nickname} 
                onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                className={`w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50 ${errors.nickname ? 'border-red-500' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nascimento / Aniv. Casamento *</label>
              <input 
                type="date" 
                value={formData.birthDate} 
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className={`w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50 ${errors.birthDate ? 'border-red-500' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <GraduationCap className="w-4 h-4" /> Escolaridade
              </label>
              <select 
                value={formData.schooling} 
                onChange={e => setFormData({ ...formData, schooling: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50"
              >
                {SCHOOLING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> Profissão
              </label>
              <input 
                type="text" 
                value={formData.profession} 
                onChange={e => setFormData({ ...formData, profession: e.target.value })}
                placeholder="Ex: Estudante, Engenheiro..."
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">CEP</label>
            <div className="relative">
              <input 
                type="text" 
                value={formData.zipCode} 
                onChange={handleCepChange}
                placeholder="00000000"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50"
              />
              {isSearchingCep && <Search className="absolute right-3 top-3 w-4 h-4 text-amber-500 animate-pulse" />}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço (com número) *</label>
            <input 
              type="text" 
              value={formData.address} 
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className={`w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50 ${errors.address ? 'border-red-500' : ''}`}
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Bairro *</label>
            <input 
              type="text" 
              value={formData.bairro} 
              onChange={e => setFormData({ ...formData, bairro: e.target.value })}
              className={`w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50 ${errors.bairro ? 'border-red-500' : ''}`}
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contato (Tel) *</label>
            <input 
              type="text" 
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50 ${errors.phone ? 'border-red-500' : ''}`}
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Saúde / Alergias / Observações Importantes</label>
            <textarea 
              rows={2}
              value={formData.observations} 
              onChange={e => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Descreva alergias, restrições alimentares ou medicamentos..."
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50"
            />
          </div>
        </div>

        {formData.type === RegistrationType.YOUTH && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 rounded-xl">
             <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="hasChildren"
                  checked={formData.hasChildren}
                  onChange={e => setFormData({ ...formData, hasChildren: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="hasChildren" className="text-sm font-medium text-slate-700">Possui filhos?</label>
             </div>
             <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="isMarried"
                  checked={formData.isMarried}
                  onChange={e => setFormData({ ...formData, isMarried: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isMarried" className="text-sm font-medium text-slate-700">É casado(a)?</label>
             </div>
          </div>
        )}
      </section>

      {/* 2. Histórico no EJC */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
          <History className="w-5 h-5 text-amber-800" />
          2. Histórico no EJC
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Ano em que vivenciou o encontro</label>
            <input 
              type="text" 
              value={formData.ejcHistoryYear} 
              onChange={e => setFormData({ ...formData, ejcHistoryYear: e.target.value })}
              placeholder="Ex: 2022"
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Círculo Original</label>
            <input 
              type="text" 
              value={formData.ejcHistoryCircle} 
              onChange={e => setFormData({ ...formData, ejcHistoryCircle: e.target.value })}
              placeholder="Ex: Azul, Amarelo, Verde..."
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50"
            />
          </div>
        </div>
      </section>

      {/* 3. Equipes que já SERVIU */}
      <TeamSelector title="Equipes que já SERVIU" type="servedTeams" icon={Check} />

      {/* 4. Equipes que já COORDENOU */}
      <TeamSelector title="Equipes que já COORDENOU" type="coordinatedTeams" icon={Trophy} />

      {/* 5. Informações Religiosas */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">5. Vida Pastoral e Talentos</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Sacramentos Recebidos:</label>
          <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-xl">
            {['Batismo', 'Eucaristia', 'Crisma'].map(sac => (
              <label key={sac} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={(formData.sacraments as any)[sac.toLowerCase()]}
                  onChange={e => {
                    const sacs = { ...formData.sacraments, none: false };
                    (sacs as any)[sac.toLowerCase()] = e.target.checked;
                    setFormData({ ...formData, sacraments: sacs as any });
                  }}
                  className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-slate-700 font-medium">{sac}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Membro de alguma Pastoral/Movimento?</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pastoral" checked={formData.isPastoralMember} onChange={() => setFormData({...formData, isPastoralMember: true})} /> Sim
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pastoral" checked={!formData.isPastoralMember} onChange={() => setFormData({...formData, isPastoralMember: false, pastoralName: ''})} /> Não
              </label>
            </div>
            {formData.isPastoralMember && (
              <input 
                type="text" 
                placeholder="Qual?" 
                value={formData.pastoralName} 
                onChange={e => setFormData({ ...formData, pastoralName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Possui Aptidão Musical ou Artística?</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="musical" checked={formData.hasMusicalTalent} onChange={() => setFormData({...formData, hasMusicalTalent: true})} /> Sim
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="musical" checked={!formData.hasMusicalTalent} onChange={() => setFormData({...formData, hasMusicalTalent: false, musicalTalentDetail: ''})} /> Não
              </label>
            </div>
            {formData.hasMusicalTalent && (
              <input 
                type="text" 
                placeholder="Instrumento ou Habilidade?" 
                value={formData.musicalTalentDetail} 
                onChange={e => setFormData({ ...formData, musicalTalentDetail: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-slate-50"
              />
            )}
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-end gap-3 md:left-64 z-50 shadow-2xl">
        <button 
          type="button" 
          onClick={() => window.history.back()}
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-amber-800 text-white font-bold hover:bg-amber-900 shadow-xl transition-all active:scale-95"
        >
          <Save className="w-5 h-5" /> Salvar Cadastro
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
