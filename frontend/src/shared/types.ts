export enum SelectedPage {
  Home = "home",
  FindWork = "find work",
  PostJob = "post job",
  Services = "services",
}

export interface BenefitType {
  icon: JSX.Element;
  title: string;
  description: string;
}

export interface ClassType {
  name: string;
  description?: string;
  image: string;
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

export type RoleValue = "WORKER" | "CLIENT";

export const ROLE_OPTIONS = [
  {
    value: "WORKER" as const,
    label: "Find Work",
    description:
      "Browse nearby piecework and apply to jobs.",
  },
  {
    value: "CLIENT" as const,
    label: "Post Jobs",
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
  selected_role: string;
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

export class ApiError extends Error {
  status: number;
  fields: ApiFieldErrors;

  constructor(
    status: number,
    fields: ApiFieldErrors
  ) {
    const firstError = Object.entries(
      fields
    ).find(
      ([key]) =>
        key !== "error" &&
        key !== "detail"
    )?.[1];

    const message =
      fields.error ||
      fields.detail ||
      (Array.isArray(firstError)
        ? firstError[0]
        : firstError) ||
      "Something went wrong.";

    super(String(message));

    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}