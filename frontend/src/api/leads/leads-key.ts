export const leadsKeys = {
    // 1. Root Key: Pure leads module ka data clear ya track karne ke liye
    all: ["leads"] as const,

    // 2. Lists Key: Saari paginated ya filtered lists ka base prefix
    lists: () => [...leadsKeys.all, "list"] as const,

    // 3. Specific Paginated List Key: Jo offset ya query filters accept karegi
    list: (offset: number) => [...leadsKeys.lists(), { offset }] as const,

    // 4. Details Key (Optional par achi practice): Agar kal ko single lead ka page banana ho
    details: () => [...leadsKeys.all, "detail"] as const,
    detail: (id: number) => [...leadsKeys.details(), id] as const,
};