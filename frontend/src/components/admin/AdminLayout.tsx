// frontend/src/components/admin/AdminLayout.tsx

import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Briefcase,
    Flag,
    BarChart3,
    ClipboardList,
    Settings,
    Menu,
    X,
    ChevronDown,
    LogOut,
    User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/dashboard/TopBar/NotificationBell';
import Logo from '@/assets/Logo.png';

// ============================================
// NAVIGATION CONFIG
// ============================================

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Verification', href: '/admin/verifications', icon: ShieldCheck },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Reports', href: '/admin/reports', icon: Flag },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
];

// ============================================
// PROPS
// ============================================

interface AdminLayoutProps {
    children: ReactNode;
}

// ============================================
// COMPONENT
// ============================================

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (href: string) => location.pathname.startsWith(href);

    // Get initials for avatar
    const getInitials = () => {
        if (!user) return 'A';
        const first = user.first_name?.[0] || '';
        const last = user.last_name?.[0] || '';
        return `${first}${last}`.toUpperCase() || 'A';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ============================================ */}
            {/* TOP BAR */}
            {/* ============================================ */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
                <div className="flex h-[72px] items-center justify-between px-4 sm:px-6">
                    {/* Left: Mobile menu + Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>

                        <Link
                            to="/admin/dashboard"
                            className="flex items-center"
                        >
                            <img src={Logo} alt="KaJob Admin" className="h-8 w-auto select-none" draggable={false} />
                        </Link>
                    </div>

                    {/* Right: Notifications + Settings + Profile */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Notifications */}
                        <NotificationBell userRole="ADMIN" />

                        {/* Settings */}
                        <button
                            type="button"
                            onClick={() => navigate('/admin/profile')}
                            className="hidden h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-emerald-700 sm:flex"
                            aria-label="Open admin profile and settings"
                            title="Profile and settings"
                        >
                            <Settings size={20} />
                        </button>

                        {/* Divider */}
                        <div className="h-6 w-px bg-admin-border-light mx-1" />

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                                    <span className="text-sm font-semibold text-emerald-800">
                                        {getInitials()}
                                    </span>
                                </div>
                                <span className="hidden md:block text-sm font-medium text-admin-text-primary">
                                    {user?.full_name || 'Admin'}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className="text-admin-text-muted hidden md:block"
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {profileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setProfileOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-admin-card shadow-admin-dropdown border border-admin-border-light py-1 z-20">
                                        <div className="px-4 py-3 border-b border-admin-border-light">
                                            <p className="text-sm font-medium text-admin-text-primary">
                                                {user?.full_name || 'Admin'}
                                            </p>
                                            <p className="text-xs text-admin-text-secondary truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setProfileOpen(false);
                                                navigate('/admin/profile');
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-admin-text-primary hover:bg-admin-bg-hover transition-colors text-left"
                                        >
                                            <UserIcon size={16} />
                                            Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-admin-danger hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut size={16} />
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* DESKTOP NAVIGATION */}
                {/* ============================================ */}
                <nav className="border-t border-slate-100">
                    <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-2 sm:px-6 lg:px-8">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        relative flex shrink-0 items-center gap-2 border-b-2 px-4 py-4
                                        text-sm font-medium whitespace-nowrap
                                        transition-colors duration-150
                                        ${active
                                            ? 'border-emerald-500 text-slate-900'
                                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    <Icon size={16} />
                                    {item.name}
                                    {active && <span className="sr-only">Current page</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </header>

            {/* ============================================ */}
            {/* MOBILE DRAWER */}
            {/* ============================================ */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
                        {/* Drawer Header */}
                        <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-5 shrink-0">
                            <img src={Logo} alt="KaJob Admin" className="h-8 w-auto select-none" draggable={false} />
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                aria-label="Close menu"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Navigation */}
                        <div className="mx-4 mt-5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Current role</p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">Administrator</p>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-3 py-4">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`
                                            flex items-center gap-3 rounded-xl px-3 py-3 mb-1
                                            text-sm font-medium
                                            transition-colors duration-150
                                            ${active
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        <Icon size={18} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Drawer Footer - User Info */}
                        <div className="border-t border-slate-100 p-4 shrink-0">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                    <span className="text-sm font-semibold text-emerald-800">
                                        {getInitials()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-admin-text-primary truncate">
                                        {user?.full_name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-admin-text-secondary truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-admin-danger rounded-admin-button hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* ============================================ */}
            {/* MAIN CONTENT */}
            {/* ============================================ */}
            <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
