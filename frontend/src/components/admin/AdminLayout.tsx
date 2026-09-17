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
    Bell,
    Settings,
    Menu,
    X,
    ChevronDown,
    LogOut,
    User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
        <div className="min-h-screen bg-admin-bg-page">
            {/* ============================================ */}
            {/* TOP BAR */}
            {/* ============================================ */}
            <header className="sticky top-0 z-30 bg-white border-b border-admin-border-light">
                <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                    {/* Left: Mobile menu + Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-admin-text-secondary hover:text-admin-text-primary rounded-md hover:bg-admin-bg-hover transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu size={20} />
                        </button>

                        <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 bg-admin-primary-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    K
                                </span>
                            </div>
                            <span className="text-lg font-semibold text-admin-text-primary hidden sm:block">
                                KaJob{' '}
                                <span className="text-admin-text-secondary font-normal">
                                    Admin
                                </span>
                            </span>
                        </Link>
                    </div>

                    {/* Right: Notifications + Settings + Profile */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <button
                            className="relative p-2 text-admin-text-secondary hover:text-admin-text-primary rounded-md hover:bg-admin-bg-hover transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-admin-danger rounded-full" />
                        </button>

                        {/* Settings */}
                        <button
                            className="p-2 text-admin-text-secondary hover:text-admin-text-primary rounded-md hover:bg-admin-bg-hover transition-colors"
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>

                        {/* Divider */}
                        <div className="h-6 w-px bg-admin-border-light mx-1" />

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-admin-bg-hover transition-colors"
                            >
                                <div className="w-8 h-8 bg-admin-primary-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
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
                <nav className="hidden lg:block border-t border-admin-border-light">
                    <div className="flex items-center gap-1 px-6 overflow-x-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        relative flex items-center gap-2 px-4 py-3
                                        text-sm font-medium whitespace-nowrap
                                        transition-colors duration-150
                                        ${active
                                            ? 'text-admin-primary-600'
                                            : 'text-admin-text-secondary hover:text-admin-text-primary'
                                        }
                                    `}
                                >
                                    <Icon size={16} />
                                    {item.name}
                                    {active && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-admin-primary-500" />
                                    )}
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
                        <div className="flex items-center justify-between h-16 px-4 border-b border-admin-border-light shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-admin-primary-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        K
                                    </span>
                                </div>
                                <span className="text-lg font-semibold text-admin-text-primary">
                                    KaJob Admin
                                </span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-admin-text-secondary hover:text-admin-text-primary rounded-md hover:bg-admin-bg-hover transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Navigation */}
                        <nav className="flex-1 overflow-y-auto p-4">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-admin-button mb-1
                                            text-sm font-medium
                                            transition-colors duration-150
                                            ${active
                                                ? 'bg-admin-primary-50 text-admin-primary-700'
                                                : 'text-admin-text-secondary hover:bg-admin-bg-hover hover:text-admin-text-primary'
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
                        <div className="p-4 border-t border-admin-border-light shrink-0">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 bg-admin-primary-500 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-white text-sm font-medium">
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
            <main className="p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
