
export enum UserRole {
  ADMIN = 'ADMIN',
  CADASTRO = 'CADASTRO'
}

export enum RegistrationType {
  YOUTH = 'YOUTH',
  COUPLE = 'COUPLE'
}

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  email: string;
  address: string;
  phone: string;
  photo?: string;
  isActive: boolean;
  isFirstLogin: boolean;
  createdAt: number;
}

export interface Registration {
  id: string;
  type: RegistrationType;
  // Personal Data
  fullName: string; // Used for youth
  husbandName?: string; // Used for couples
  wifeName?: string; // Used for couples
  nickname: string;
  zipCode: string;
  city: string;
  state: string;
  address: string;
  number: string;
  bairro: string;
  referencePoint: string;
  phone: string;
  birthDate: string;
  schooling: string;
  profession: string;
  ejcHistoryYear?: string;
  ejcHistoryCircle?: string;
  photo?: string;
  
  // Religious
  sacraments: {
    baptism: boolean;
    eucharist: boolean;
    confirmation: boolean;
    none: boolean;
  };
  isPastoralMember: boolean;
  pastoralName?: string;
  hasMusicalTalent: boolean;
  musicalTalentDetail?: string;
  
  // Status
  hasChildren: boolean;
  isMarried: boolean;
  
  // Teams
  servedTeams: Record<string, number>;
  coordinatedTeams: Record<string, number>;
  
  registeredBy: string;
  createdAt: number;
}

export interface UserLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  timestamp: number;
}
