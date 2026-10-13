export function getErrorMessage(err: unknown, fallback = "Une erreur est survenue"): string {
  const e = err as {
    status?: number | string;
    message?: string;
    data?: { message?: string; error?: string };
  };
  if (e?.status === "FETCH_ERROR") return "Serveur injoignable";
  return e?.data?.message ?? e?.data?.error ?? e?.message ?? fallback;
}