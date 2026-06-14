export type AuthContextValue = {
    user: User | null | undefined;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        organization_name: string;
        email: string;
        password: string;
        full_name?: string;
    }) => Promise<void>;
    logout: () => void;
    loginSuccess: boolean;
    registerSuccess: boolean;
    loginPending: boolean;
    registerPending: boolean;
    token: string | undefined | null;
}

export type User = {
    id: number;
    email: string;
    full_name: string;
    role: string;
    organization_id: number;
    organization_name: string;
    organization_slug: string;
    organization_timezone: string;
}

export type LoginPayload = {
    email: string;
    password: string;
}

export type RegisterPayload = {
    organization_name: string;
    email: string;
    password: string;
    full_name?: string;
}