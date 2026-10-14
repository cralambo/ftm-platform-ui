export type StatusColor =
  | "default"
  | "primary"
  | "success"
  | "error"
  | "warning";

export interface StatusMeta {
  label: string;
  color: StatusColor;
}

export const PROJECT_STATUS_META: Record<string, StatusMeta> = {
  PENDING: { label: "En attente", color: "default" },
  IN_PROGRESS: { label: "En cours", color: "primary" },
  APPROVED: { label: "Approuvé", color: "success" },
  REJECTED: { label: "Rejeté", color: "error" },
  RETURNED: { label: "Retourné", color: "warning" },
};

/** Libellé et couleur d'un statut ; une valeur inconnue s'affiche telle quelle. */
export const statusMeta = (status: string): StatusMeta =>
  PROJECT_STATUS_META[status] ?? { label: status, color: "default" };
