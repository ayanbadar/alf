import { NavItem } from "@/types";
import { BookOpen, Calendar, CalendarCheck, LayoutGrid, MessageCircle, MessageSquare, Percent, Plug, Settings, UserPlus, Users } from "lucide-react";

export const ROUTES = {
    base: "/",
    login: "/login",
    register: "/register",
};

export const chartData = [
    { day: "Mon", messages: 32, leads: 4 },
    { day: "Tue", messages: 48, leads: 7 },
    { day: "Wed", messages: 61, leads: 9 },
    { day: "Thu", messages: 54, leads: 6 },
    { day: "Fri", messages: 72, leads: 11 },
    { day: "Sat", messages: 89, leads: 14 },
    { day: "Sun", messages: 67, leads: 12 },
];

export const replyMix = [
    { name: "AI", value: 184, color: "#25D366" },
    { name: "Human", value: 63, color: "#1e2530" },
];

export const activity = [
    { icon: Users, title: "New lead captured", meta: "Ahmad K.", text: "Interested in 5 marla DHA Phase 6", time: "2m ago", badge: "New" as const },
    { icon: MessageSquare, title: "AI replied to inquiry", meta: "Sara M.", text: "Shared brochure for Bahria Town", time: "8m ago" },
    { icon: CalendarCheck, title: "Site visit booked", meta: "Tariq H.", text: "Tomorrow 11:00 AM — Lake City", time: "21m ago", badge: "Confirmed" as const },
    { icon: MessageSquare, title: "Customer asked for price", meta: "Hassan A.", text: "AI answered from price sheet v3", time: "34m ago" },
    { icon: Users, title: "Lead marked qualified", meta: "Mariam Q.", text: "Budget 2.5cr, ready in 30 days", time: "1h ago", badge: "Qualified" as const },
];

export const stats = [
    { label: "Leads today", value: "12", delta: "+8%", up: true, icon: UserPlus, key: "leads_today" },
    { label: "Messages today", value: "247", delta: "+24%", up: true, icon: MessageSquare, key: "messages_today" },
    { label: "Appointments", value: "5", delta: "-1", up: false, icon: CalendarCheck, key: "appointments_today" },
    { label: "Conversion rate", value: "18%", delta: "+3%", up: true, icon: Percent, key: "conversion_rate", format: (v: number) => `${v}%` },
];

export const mainNav: NavItem[] = [
    { title: "Overview", url: "/", icon: LayoutGrid },
    { title: "Chats", url: "/chats", icon: MessageCircle, badge: "3" },
    { title: "Leads", url: "/leads", icon: Users },
    { title: "Appointments", url: "/appointments", icon: Calendar },
    { title: "Knowledge Base", url: "/knowledge", icon: BookOpen },
    { title: "Connection", url: "/connection", icon: Plug },
    { title: "Settings", url: "/settings", icon: Settings },
];

export const BASE_URL = "/api/v1";