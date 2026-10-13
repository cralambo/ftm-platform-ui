// Noms identiques à ceux du backend (snake_case)
export interface StrategicPlan {
  id: string;
  name: string;
  code: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;
  description: string;
}

export interface ShortStrategicPlan {
  id: string;
  code: string;
}

export type StrategicPlanInput = Omit<StrategicPlan, "id">;