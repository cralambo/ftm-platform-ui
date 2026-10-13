export const toCents = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined || value === "") return 0;
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export const formatCents = (cents: number): string => 
    new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(cents / 100);

export interface BudgetInput {
    own_funds: string;
    grant_amount: string;
    co_funders: { amount: string }[];
}

export function computeBudget(v: BudgetInput) {
    const granted = toCents(v.grant_amount);
    const own = toCents(v.own_funds);
    const coFunders = v.co_funders.reduce((sum, c) => sum + toCents(c.amount), 0);
    return {
        granted,
        own,
        coFunders,
        funded: own + coFunders,
        balance: granted - own - coFunders
    };
}