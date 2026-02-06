
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase.ts';
import { User, Registration, UserLog } from '../types.ts';

const COLLECTIONS = {
  USERS: 'users',
  REGISTRATIONS: 'registrations',
  LOGS: 'logs'
};

export const DataService = {
  getUsers: async (): Promise<User[]> => {
    if (!db) return [];
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (e) {
      console.error("Erro ao buscar usuários:", e);
      return [];
    }
  },

  saveUser: async (user: User): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
  },

  deleteUser: async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.USERS, id));
  },

  getRegistrations: async (): Promise<Registration[]> => {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTIONS.REGISTRATIONS), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
    } catch (e) {
      console.error("Erro ao buscar inscrições:", e);
      return [];
    }
  },

  saveRegistration: async (reg: Registration): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.REGISTRATIONS, reg.id), reg);
  },

  deleteRegistration: async (id: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, COLLECTIONS.REGISTRATIONS, id));
  },

  getLogs: async (): Promise<UserLog[]> => {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTIONS.LOGS), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserLog));
    } catch (e) {
      return [];
    }
  },

  addLog: async (log: UserLog): Promise<void> => {
    if (!db) return;
    await setDoc(doc(db, COLLECTIONS.LOGS, log.id), log);
  },
  
  exportData: async () => {
    const data = {
      users: await DataService.getUsers(),
      registrations: await DataService.getRegistrations(),
      logs: await DataService.getLogs(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_ejc_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
  },

  importData: async (jsonData: string): Promise<boolean> => {
    if (!db) return false;
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.users) {
        for (const u of parsed.users) await DataService.saveUser(u);
      }
      if (parsed.registrations) {
        for (const r of parsed.registrations) await DataService.saveRegistration(r);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
