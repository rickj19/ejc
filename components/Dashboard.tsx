
import React from 'react';
import { Registration, UserLog, User, RegistrationType } from '../types.ts';
import { 
  Users, 
  Baby, 
  Heart, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  registrations: Registration[];
  logs: UserLog[];
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ registrations, logs, users }) => {
  const ineligible = registrations.filter(r => r.type === RegistrationType.YOUTH && (r.hasChildren || r.isMarried));
  const eligible = registrations.filter(r => r.type === RegistrationType.COUPLE || (r.type === RegistrationType.YOUTH && !r.hasChildren && !r.isMarried));
  
  const youthCount = registrations.filter(r => r.type === RegistrationType.YOUTH).length;
  const coupleCount = registrations.filter(r => r.type === RegistrationType.COUPLE).length;

  const stats = [
    { label: 'Jovens Inscritos', value: youthCount, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Casais Inscritos', value: coupleCount, icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Encontreiros', value: registrations.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ações Hoje', value: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const chartData = [
    { name: 'Jovens', value: youthCount },
    { name: 'Casais', value: coupleCount },
  ];

  const eligibilityPie = [
    { name: 'Aptos', value: eligible.length },
    { name: 'Restritos', value: ineligible.length }
  ];
  const COLORS = ['#10b981', '#f59e0b'];

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-800" /> Crescimento do Encontro
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#92400e" radius={[8, 8, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Perfil dos Inscritos</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={eligibilityPie} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {eligibilityPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-sm p-2 bg-green-50 rounded-lg">
              <span className="text-green-700 font-bold">Aptos / Casais</span>
              <span className="font-black text-green-800">{eligible.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2 bg-amber-50 rounded-lg">
              <span className="text-amber-700 font-bold">Restritos (Jovens)</span>
              <span className="font-black text-amber-800">{ineligible.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-800" /> Atividades Recentes
        </h3>
        <div className="space-y-4">
          {recentLogs.map((log, idx) => (
            <div key={log.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border-l-4 border-amber-800 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold">
                  {log.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{log.action}</p>
                  <p className="text-xs text-slate-400">por @{log.username}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <div className="text-center py-10 italic text-slate-400">Nenhuma atividade registrada hoje.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
