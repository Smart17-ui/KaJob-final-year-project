export enum SelectedPage {
  Home = "home",
  HowItWorks = "How It Works",
  ContactUs = "Contact Us",
  About = "About",
}

/* =========================
   USER
========================= */

export interface User {
  id: string | number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  account_status: string;
  is_verified: boolean;
  roles: string[];
  is_admin: boolean;
  is_worker: boolean;
  is_client: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

/* =========================
   ROLES
========================= */

export type RoleValue =
  | "WORKER"
  | "CLIENT";

export const ROLE_OPTIONS: {
  value: RoleValue;
  label: string;
  description: string;
}[] = [
  {
    value: "WORKER",
    label: "Worker",
    description:
      "Browse nearby piecework and apply to jobs.",
  },
  {
    value: "CLIENT",
    label: "Client",
    description:
      "Post tasks and hire workers nearby.",
  },
];

/* =========================
   REGISTER
========================= */

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirm: string;
  role: RoleValue;
}

export interface RegisterResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

/* =========================
   LOGIN
========================= */

export interface LoginPayload {
  email: string;
  password: string;
  role?: RoleValue;
}

export interface LoginResponse {
  message: string;
  user: User;

  tokens: {
    access: string;
    refresh: string;
  };

  selected_role: RoleValue;

  available_roles: string[];
}

/* =========================
   API ERRORS
========================= */

export interface ApiFieldErrors {
  [field: string]:
    | string[]
    | string
    | undefined;

  error?: string;
  detail?: string;
}