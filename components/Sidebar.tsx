
import React from 'react';
import { User, UserRole } from '../types.ts';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Settings, 
  LogOut,
  Cross
} from 'lucide-react';
import { APP_THEME } from '../constants.ts';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.CADASTRO] },
    { id: 'register', label: 'Novo Cadastro', icon: UserPlus, roles: [UserRole.ADMIN, UserRole.CADASTRO] },
    { id: 'list', label: 'Encontristas', icon: Users, roles: [UserRole.ADMIN, UserRole.CADASTRO] },
    { id: 'users', label: 'Usuários', icon: Settings, roles: [UserRole.ADMIN] },
    { id: 'profile', label: 'Meu Perfil', icon: Settings, roles: [UserRole.ADMIN, UserRole.CADASTRO] },
  ];

  return (
    <div className="w-20 md:w-64 bg-amber-900 text-white flex flex-col min-h-screen sticky top-0">
      <div className="p-4 flex flex-col items-center md:items-start gap-2 border-b border-amber-800">
        <div className="bg-white p-2 rounded-lg">
          <Cross className="w-8 h-8 text-amber-900" />
        </div>
        <span className="hidden md:block font-bold text-lg tracking-tight">EJC Paróquia SFC</span>
      </div>

      <nav className="flex-1 mt-6 px-2 space-y-2">
        {menuItems.filter(item => item.roles.includes(user.role)).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-amber-700 text-white shadow-lg' 
                : 'text-amber-200 hover:bg-amber-800 hover:text-white'
            }`}
          >
            <item.icon className="w-6 h-6 shrink-0" />
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-amber-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-amber-200 hover:bg-red-900 hover:text-white transition-all"
        >
          <LogOut className="w-6 h-6 shrink-0" />
          <span className="hidden md:block font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
