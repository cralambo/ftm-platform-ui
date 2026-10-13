export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface PageParams {
    page: number;
    size: number;
}


export function normalizePage<T>(raw: any): Page<T> {
    const meta = raw?.page ?? raw ?? {};
    return {
        content: raw?.content ?? [],
        totalElements: meta.totalElements ?? 0,
        totalPages: meta.totalPages ?? 0,
        number: meta.number ?? 0,
        size: meta.size ?? 0
    }
}