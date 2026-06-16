export type NavItem = {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
};