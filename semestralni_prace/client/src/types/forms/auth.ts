import { ROLES } from '@/config';

type Role = (typeof ROLES)[number];

export interface LoginForm {
  email: string;
  password: string;
}

export type LoginFormMutation = {} & LoginForm;

export interface RegistrationForm {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

export type RegistrationFormMutation = {} & RegistrationForm;
