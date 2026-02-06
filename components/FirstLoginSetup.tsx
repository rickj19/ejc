
import React, { useState } from 'react';
import { User } from '../types.ts';
import { ShieldCheck, User as UserIcon, MapPin, Phone, Mail, Camera, ArrowRight } from 'lucide-react';

interface FirstLoginSetupProps {
  user: User;
  onComplete: (user: User) => void;
}

const FirstLoginSetup: React.FC<FirstLoginSetupProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    photo: ''
  });

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

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.password) {
      alert('Todos os campos (exceto foto) são obrigatórios para seu primeiro acesso.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    const updatedUser: User = {
      ...user,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      password: formData.password,
      photo: formData.photo || user.photo,
      isFirstLogin: false
    };

    onComplete(updatedUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-10 h-10 text-amber-800" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Seja bem-vindo ao EJC!</h2>
          <p className="text-slate-500 mt-2">Como é seu primeiro acesso, precisamos completar seu perfil de cadastrador e atualizar sua senha.</p>
        </div>

        <div className="flex justify-between mb-8 px-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          {[1, 2].map(s => (
            <div key={s} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-amber-800 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
              {s}
            </div>
          ))}
        </div>

        <form onSubmit={handleFinish} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  {formData.photo ? (
                    <img src={formData.photo} className="w-24 h-24 rounded-full object-cover border-4 border-amber-100" alt="Avatar" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mt-2">Foto de Perfil (Opcional)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo *</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email *</label>
                  <input 
                    type="email" required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone *</label>
                  <input 
                    type="text" required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço Residencial *</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="w-full bg-amber-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-6"
              >
                Próximo Passo <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
                <p className="text-sm text-blue-700 font-medium">Sua segurança é importante. Crie uma senha forte para proteger os dados dos jovens cadastrados.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nova Senha *</label>
                <input 
                  type="password" required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmar Senha *</label>
                <input 
                  type="password" required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="flex-1 border border-slate-200 py-4 rounded-2xl font-bold"
                >
                  Voltar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-amber-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-800/20"
                >
                  Concluir Perfil e Acessar
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FirstLoginSetup;
