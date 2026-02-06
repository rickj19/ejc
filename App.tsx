
import React, { useState, useEffect, useCallback } from 'react';
import { User, Registration, UserRole, UserLog } from './types.ts';
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard.tsx';
import Sidebar from './components/Sidebar.tsx';
import RegistrationForm from './components/RegistrationForm.tsx';
import RegistrationList from './components/RegistrationList.tsx';
import UserManagement from './components/UserManagement.tsx';
import ProfileSettings from './components/ProfileSettings.tsx';
import FirstLoginSetup from './components/FirstLoginSetup.tsx';
import { DataService } from './services/storage.ts';
import { isConfigured } from './services/firebase.ts';
import { Loader2, AlertTriangle, Database } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'list' | 'users' | 'profile'>('dashboard');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  const initData = async () => {
    // Se não houver config de Firebase, encerramos o loading para mostrar a tela de configuração
    if (!isConfigured) {
      console.warn("Firebase não configurado.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setDbError(null);
    
    try {
      // Timeout de segurança para não travar a UI infinitamente
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Tempo limite de conexão excedido")), 10000)
      );

      const dataLoadPromise = (async () => {
        const loadedUsers = await DataService.getUsers();
        
        if (loadedUsers.length === 0) {
          const defaultAdmin: User = {
            id: 'admin_root',
            username: 'admin',
            password: '@dmin',
            fullName: 'Administrador Geral',
            role: UserRole.ADMIN,
            email: 'admin@ejc.com',
            address: 'Paróquia São Francisco',
            phone: '000000000',
            isActive: true,
            isFirstLogin: false,
            createdAt: Date.now()
          };
          try { await DataService.saveUser(defaultAdmin); } catch (e) { console.error(e); }
          setUsers([defaultAdmin]);
        } else {
          setUsers(loadedUsers);
        }

        const [loadedRegs, loadedLogs] = await Promise.all([
          DataService.getRegistrations().catch(() => []),
          DataService.getLogs().catch(() => [])
        ]);

        setRegistrations(loadedRegs);
        setLogs(loadedLogs);
      })();

      await Promise.race([dataLoadPromise, timeoutPromise]);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      setDbError(error.message || "Falha na comunicação com o banco de dados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const addLog = useCallback(async (action: string) => {
    if (!currentUser) return;
    const newLog: UserLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      action,
      timestamp: Date.now()
    };
    try {
      await DataService.addLog(newLog);
      setLogs(prev => [newLog, ...prev]);
    } catch (e) {}
  }, [currentUser]);

  const handleLogout = () => {
    addLog('Logout realizado');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-amber-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-6">
              <Database className="w-10 h-10 text-amber-800" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Configuração Necessária</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              O sistema EJC da <b>Paróquia São Francisco das Chagas</b> precisa de chaves válidas do Firebase no arquivo <code className="bg-slate-100 px-2 py-1 rounded text-amber-800">services/firebase.ts</code> para funcionar.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-amber-800 text-white rounded-2xl font-bold hover:bg-amber-900 transition-all shadow-lg"
            >
              Recarregar Sistema
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-amber-800 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse text-center px-4">
          Conectando à Paróquia São Francisco...
        </p>
      </div>
    );
  }

  if (dbError && users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Erro de Conexão</h2>
        <p className="text-slate-500 max-w-md mb-6">{dbError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-amber-800 text-white rounded-xl font-bold hover:bg-amber-900 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return <Login users={users} onLogin={(user) => {
      setCurrentUser(user);
      addLog('Login realizado');
    }} />;
  }

  if (currentUser.isFirstLogin) {
    return (
      <FirstLoginSetup 
        user={currentUser} 
        onComplete={async (updatedUser) => {
          await DataService.saveUser(updatedUser);
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          setCurrentUser(updatedUser);
          addLog('Perfil completado no primeiro acesso');
        }} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'dashboard' && 'Painel de Controle'}
              {activeTab === 'register' && 'Novo Cadastro'}
              {activeTab === 'list' && 'Lista de Encontristas'}
              {activeTab === 'users' && 'Gestão de Usuários'}
              {activeTab === 'profile' && 'Meu Perfil'}
            </h1>
            <p className="text-slate-500 text-sm">Paróquia São Francisco das Chagas</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{currentUser.fullName}</p>
              <p className="text-xs text-slate-500 capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold overflow-hidden border border-amber-200">
              {currentUser.photo ? (
                <img src={currentUser.photo} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                currentUser.username.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard registrations={registrations} logs={logs} users={users} />
          )}
          {activeTab === 'register' && (
            <RegistrationForm 
              currentUser={currentUser}
              onSubmit={async (reg) => {
                await DataService.saveRegistration(reg);
                setRegistrations(prev => [reg, ...prev]);
                setActiveTab('list');
                const name = reg.fullName || `${reg.husbandName} & ${reg.wifeName}`;
                addLog(`Cadastrou: ${name}`);
              }} 
            />
          )}
          {activeTab === 'list' && (
            <RegistrationList 
              currentUser={currentUser}
              registrations={registrations} 
              onDelete={async (id) => {
                const reg = registrations.find(r => r.id === id);
                await DataService.deleteRegistration(id);
                setRegistrations(prev => prev.filter(r => r.id !== id));
                const name = reg?.fullName || `${reg?.husbandName} & ${reg?.wifeName}`;
                addLog(`Excluiu ficha de: ${name}`);
              }}
              onEdit={async (updatedReg) => {
                await DataService.saveRegistration(updatedReg);
                setRegistrations(prev => prev.map(r => r.id === updatedReg.id ? updatedReg : r));
                const name = updatedReg.fullName || `${updatedReg.husbandName} & ${updatedReg.wifeName}`;
                addLog(`Editou ficha de: ${name}`);
              }}
            />
          )}
          {activeTab === 'users' && currentUser.role === UserRole.ADMIN && (
            <UserManagement 
              currentUser={currentUser}
              users={users} 
              logs={logs}
              onUpdateUsers={async (updatedUsers) => {
                setUsers(updatedUsers);
              }}
              addLog={addLog}
              refreshData={initData}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileSettings 
              user={currentUser} 
              onUpdate={async (updatedUser) => {
                await DataService.saveUser(updatedUser);
                setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                setCurrentUser(updatedUser);
                addLog('Atualizou dados do perfil');
              }} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
