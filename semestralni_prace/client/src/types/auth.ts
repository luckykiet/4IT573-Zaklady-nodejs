import { ROLES } from '@/config';

import { ReactElement } from 'react';
type Role = (typeof ROLES)[number];

// ==============================|| TYPES - AUTH  ||============================== //

export type GuardProps = {
  children: ReactElement | null;
};

export type UserProfile = {
  isAuthenticated: boolean;
  email: string;
  name: string;
  role: Role;
};

export interface AuthProps {
  isAuthenticated: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null;
}

export type AuthStore = {
  logout: () => void;
  login: (user: UserProfile) => void;
} & AuthProps;

export interface AuthActionProps {
  type: string;
  payload?: AuthProps;
}

export interface InitialLoginContextProps {
  isAuthenticated: boolean;
  isInitialized?: boolean;
  user?: UserProfile | null | undefined;
}

export interface JWTDataProps {
  userId: string;
}
