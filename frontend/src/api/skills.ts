import apiClient from "@/api/client";

/* =========================================================
   TYPES
========================================================= */

export type Proficiency =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: string;
}

export interface SkillsResponse {
  count: number;
  results: Skill[];
}

export interface WorkerSkill {
  id: number;
  skill_id: number;
  skill_name: string;
  skill_category: string;
  skill_icon: string;
  proficiency: Proficiency;
  proficiency_display: string;
  years_experience: number;
  created_at: string;
  updated_at: string;
}

export interface WorkerSkillsResponse {
  count: number;
  results: WorkerSkill[];
}

export interface WorkerSkillResponse {
  message: string;
  skill: WorkerSkill;
}

/* =========================================================
   GET MASTER SKILLS
========================================================= */

export async function getSkills(): Promise<SkillsResponse> {
  return apiClient("/skills/", {
    method: "GET",
  });
}

/* =========================================================
   GET MY WORKER SKILLS
========================================================= */

export async function getMyWorkerSkills(): Promise<WorkerSkillsResponse> {
  return apiClient("/workers/me/skills/", {
    method: "GET",
  });
}

/* =========================================================
   ADD WORKER SKILL
========================================================= */

export async function addWorkerSkill(payload: {
  skill_id: number;
  proficiency: Proficiency;
  years_experience: number;
}): Promise<WorkerSkillResponse> {
  return apiClient("/workers/me/skills/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================================================
   UPDATE WORKER SKILL
========================================================= */

export async function updateWorkerSkill(
  workerSkillId: number,
  payload: {
    proficiency: Proficiency;
    years_experience: number;
  }
): Promise<WorkerSkillResponse> {
  return apiClient(`/workers/me/skills/${workerSkillId}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* =========================================================
   DELETE WORKER SKILL
========================================================= */

export async function deleteWorkerSkill(
  workerSkillId: number
): Promise<{ message: string }> {
  return apiClient(`/workers/me/skills/${workerSkillId}/`, {
    method: "DELETE",
  });
}