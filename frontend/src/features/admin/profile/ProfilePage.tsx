// frontend/src/features/admin/profile/ProfilePage.tsx

import { useState } from 'react';
import {
    User as UserIcon,
    Mail,
    Phone,
    Lock,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    X,
    KeyRound,
    Clock,
    BadgeCheck,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
    updateMyName,
    updateMyEmail,
    updateMyPhone,
    changeMyPassword,
} from '@/api/profile';

// ============================================
// MODAL
// ============================================

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, description, children }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {title}
                            </h3>
                            {description && (
                                <p className="mt-1 text-sm text-slate-500 leading-6">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="shrink-0 -mt-1 -mr-1 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div className="px-6 pb-6">{children}</div>
            </div>
        </div>
    );
};

// ============================================
// FORM FIELD
// ============================================

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    hint?: string;
}

const FormField = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    hint,
}: FormFieldProps) => (
    <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
        />
        {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
);

// ============================================
// MAIN PAGE
// ============================================

const ProfilePage = () => {
    const { user, refreshUser } = useAuth();

    // Name
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [isSavingName, setIsSavingName] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);
    const [nameSuccess, setNameSuccess] = useState(false);

    // Email
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    // Phone
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [isSavingPhone, setIsSavingPhone] = useState(false);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    // Password
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // ============================================
    // DERIVED
    // ============================================

    const getInitials = () => {
        if (!user) return 'A';
        const first = user.first_name?.[0] || '';
        const last = user.last_name?.[0] || '';
        return `${first}${last}`.toUpperCase() || 'A';
    };

    const memberSince = (user as any)?.created_at
        ? new Date((user as any).created_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
          })
        : '—';

    const lastLogin = (user as any)?.last_login
        ? new Date((user as any).last_login).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : 'Never';

    // ============================================
    // HANDLERS
    // ============================================

    const handleSaveName = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            setNameError('First and last name are required.');
            return;
        }

        try {
            setIsSavingName(true);
            setNameError(null);
            setNameSuccess(false);

            await updateMyName(firstName.trim(), lastName.trim());

            if (refreshUser) {
                await refreshUser();
            }

            setNameSuccess(true);
            setTimeout(() => setNameSuccess(false), 3000);
        } catch (err: any) {
            setNameError(
                err?.error ||
                    err?.first_name?.[0] ||
                    err?.last_name?.[0] ||
                    err?.message ||
                    'Failed to update name.'
            );
        } finally {
            setIsSavingName(false);
        }
    };

    const handleSaveEmail = async () => {
        if (!newEmail.trim()) {
            setEmailError('Email is required.');
            return;
        }

        try {
            setIsSavingEmail(true);
            setEmailError(null);

            const result = await updateMyEmail(newEmail.trim());

            if (refreshUser) {
                await refreshUser();
            }

            setIsEmailModalOpen(false);
            setNewEmail('');
            alert(
                result.message +
                    ' Check your inbox to verify the new address.'
            );
        } catch (err: any) {
            setEmailError(
                err?.error ||
                    err?.email?.[0] ||
                    err?.message ||
                    'Failed to update email.'
            );
        } finally {
            setIsSavingEmail(false);
        }
    };

    const handleSavePhone = async () => {
        if (!newPhone.trim()) {
            setPhoneError('Phone number is required.');
            return;
        }

        try {
            setIsSavingPhone(true);
            setPhoneError(null);

            const result = await updateMyPhone(newPhone.trim());

            if (refreshUser) {
                await refreshUser();
            }

            setIsPhoneModalOpen(false);
            setNewPhone('');
            alert(result.message);
        } catch (err: any) {
            setPhoneError(
                err?.error ||
                    err?.phone_number?.[0] ||
                    err?.message ||
                    'Failed to update phone.'
            );
        } finally {
            setIsSavingPhone(false);
        }
    };

    const handleSavePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required.');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        try {
            setIsSavingPassword(true);
            setPasswordError(null);

            await changeMyPassword(oldPassword, newPassword);

            setPasswordSuccess(true);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordSuccess(false);
            }, 2000);
        } catch (err: any) {
            setPasswordError(
                err?.error ||
                    err?.old_password?.[0] ||
                    err?.new_password?.[0] ||
                    err?.message ||
                    'Failed to change password.'
            );
        } finally {
            setIsSavingPassword(false);
        }
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <>
            <AdminPageHeader
                breadcrumbs={[{ label: 'Account' }, { label: 'Profile' }]}
                title="Profile"
                description="Manage your personal information and account security."
            />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
                {/* ============================================ */}
                {/* LEFT COLUMN — IDENTITY CARD */}
                {/* ============================================ */}
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {/* Banner — dark navy with emerald glow */}
                        <div
                            className="relative h-20 overflow-hidden"
                            style={{
                                background:
                                    'linear-gradient(135deg, #0f172a 0%, #020617 60%, #064e3b 100%)',
                            }}
                        >
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        'radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.35), transparent 60%)',
                                }}
                            />
                        </div>

                        {/* Avatar */}
                        <div className="px-5 -mt-10 flex justify-center relative">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold tracking-tight">
                                            {getInitials()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Name + Role */}
                        <div className="px-5 pt-3 pb-5 text-center">
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                                {user?.full_name || 'Admin'}
                            </h2>
                            <div className="mt-1.5 flex justify-center">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    <BadgeCheck size={12} />
                                    ADMIN
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500 truncate">
                                {user?.email}
                            </p>
                        </div>

                        {/* Meta */}
                        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <Clock
                                    size={14}
                                    className="mt-0.5 shrink-0 text-slate-400"
                                />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Member since
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900">
                                        {memberSince}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock
                                    size={14}
                                    className="mt-0.5 shrink-0 text-slate-400"
                                />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Last login
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900">
                                        {lastLogin}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <ShieldCheck
                                    size={14}
                                    className="mt-0.5 shrink-0 text-slate-400"
                                />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Status
                                    </p>
                                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Active
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ============================================ */}
                {/* RIGHT COLUMN — EDITABLE SECTIONS */}
                {/* ============================================ */}
                <div className="space-y-6 min-w-0">
                    {/* ============================================ */}
                    {/* PERSONAL INFORMATION */}
                    {/* ============================================ */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <UserIcon size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Personal Information
                                </h3>
                                <p className="text-xs text-slate-500">
                                    How your name appears across the platform.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {nameError && (
                                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{nameError}</span>
                                </div>
                            )}
                            {nameSuccess && (
                                <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                                    <span>Your name has been updated.</span>
                                </div>
                            )}

                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField
                                    label="First name"
                                    value={firstName}
                                    onChange={setFirstName}
                                    placeholder="Enter first name"
                                />
                                <FormField
                                    label="Last name"
                                    value={lastName}
                                    onChange={setLastName}
                                    placeholder="Enter last name"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFirstName(user?.first_name || '');
                                        setLastName(user?.last_name || '');
                                        setNameError(null);
                                    }}
                                    disabled={isSavingName}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveName}
                                    disabled={isSavingName}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSavingName ? 'Saving…' : 'Save changes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ============================================ */}
                    {/* CONTACT INFORMATION */}
                    {/* ============================================ */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <Mail size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Contact Information
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Ways users and the system can reach you.
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {/* EMAIL */}
                            <div className="flex items-center gap-4 px-6 py-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                    <Mail size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Email address
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900 truncate">
                                        {user?.email || '—'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsEmailModalOpen(true)}
                                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    Change
                                </button>
                            </div>

                            {/* PHONE */}
                            <div className="flex items-center gap-4 px-6 py-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                    <Phone size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Phone number
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900 truncate">
                                        {user?.phone_number || '—'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsPhoneModalOpen(true)}
                                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ============================================ */}
                    {/* SECURITY */}
                    {/* ============================================ */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Security
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Protect your account and manage access.
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {/* PASSWORD */}
                            <div className="flex items-center gap-4 px-6 py-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                    <KeyRound size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Password
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900">
                                        Keep your account secure with a strong password
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    Change
                                </button>
                            </div>

                            {/* LAST LOGIN */}
                            <div className="flex items-center gap-4 px-6 py-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                    <Clock size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Last login
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900">
                                        {lastLogin}
                                    </p>
                                </div>
                            </div>

                            {/* ACCOUNT STATUS */}
                            <div className="flex items-center gap-4 px-6 py-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                                    <Lock size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Account status
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900">
                                        Active
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    ACTIVE
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* EMAIL MODAL */}
            {/* ============================================ */}
            <Modal
                isOpen={isEmailModalOpen}
                onClose={() => {
                    setIsEmailModalOpen(false);
                    setEmailError(null);
                    setNewEmail('');
                }}
                title="Change email address"
                description="We'll send a verification link to your new email. Your current email stays active until you verify."
            >
                <div className="space-y-4">
                    {emailError && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{emailError}</span>
                        </div>
                    )}

                    <FormField
                        label="New email address"
                        type="email"
                        value={newEmail}
                        onChange={setNewEmail}
                        placeholder="you@example.com"
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => setIsEmailModalOpen(false)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveEmail}
                            disabled={isSavingEmail}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSavingEmail ? 'Sending…' : 'Send verification'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ============================================ */}
            {/* PHONE MODAL */}
            {/* ============================================ */}
            <Modal
                isOpen={isPhoneModalOpen}
                onClose={() => {
                    setIsPhoneModalOpen(false);
                    setPhoneError(null);
                    setNewPhone('');
                }}
                title="Change phone number"
                description="Updating your phone number will reset your phone verification. You'll need to verify the new number."
            >
                <div className="space-y-4">
                    {phoneError && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{phoneError}</span>
                        </div>
                    )}

                    <FormField
                        label="New phone number"
                        type="tel"
                        value={newPhone}
                        onChange={setNewPhone}
                        placeholder="+260971234567"
                        hint="Include your country code, e.g. +260"
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => setIsPhoneModalOpen(false)}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSavePhone}
                            disabled={isSavingPhone}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSavingPhone ? 'Updating…' : 'Update phone'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ============================================ */}
            {/* PASSWORD MODAL */}
            {/* ============================================ */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordError(null);
                    setPasswordSuccess(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }}
                title="Change password"
                description="Use at least 8 characters with a mix of letters and numbers."
            >
                <div className="space-y-4">
                    {passwordSuccess ? (
                        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                            <span>Your password has been changed.</span>
                        </div>
                    ) : (
                        <>
                            {passwordError && (
                                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <FormField
                                label="Current password"
                                type="password"
                                value={oldPassword}
                                onChange={setOldPassword}
                                placeholder="••••••••"
                            />
                            <FormField
                                label="New password"
                                type="password"
                                value={newPassword}
                                onChange={setNewPassword}
                                placeholder="••••••••"
                                hint="At least 8 characters"
                            />
                            <FormField
                                label="Confirm new password"
                                type="password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                placeholder="••••••••"
                            />

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePassword}
                                    disabled={isSavingPassword}
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSavingPassword ? 'Saving…' : 'Change password'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default ProfilePage;
