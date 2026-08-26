import React, { useEffect, useRef, useState } from 'react';
import {
    Pencil, Eye, EyeOff, ShieldCheck, Camera, Sun, Moon, Monitor,
    User, Lock, Palette, Mail, Phone, MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import * as authApi from '@/api/auth';
import { ApiError } from '@/api/client';

/* ─── Dark/Light mode preference ──────────────────────────────── */
type Theme = 'light' | 'dark' | 'system';
function getStoredTheme(): Theme { return (localStorage.getItem('gw_theme') as Theme) || 'system'; }
function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.remove('dark');
    else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
    }
    localStorage.setItem('gw_theme', theme);
}

const ROLE_LABEL: Record<string, string> = {
    Administrator: 'Administrator', SubAdmin: 'Sub Admin', Seller: 'Seller', Buyer: 'Buyer',
};

type Tab = 'profile' | 'security' | 'appearance';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile',    label: 'My Profile',  icon: <User size={15} /> },
    { id: 'security',   label: 'Security',    icon: <Lock size={15} /> },
    { id: 'appearance', label: 'Appearance',  icon: <Palette size={15} /> },
];

const INPUT_CLS = 'w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#54B5BB]/40 focus:border-[#54B5BB] transition-all placeholder-slate-400';

export const AccountSettings: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    /* profile */
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ fullName: '', phone: '', whatsappNumber: '' });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');

    /* photo */
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    /* password */
    const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    /* theme */
    const [theme, setTheme] = useState<Theme>(getStoredTheme);

    useEffect(() => {
        if (user) setEditForm({ fullName: user.fullName, phone: user.phone || '', whatsappNumber: user.whatsappNumber || '' });
    }, [user]);

    if (!user) return null;

    const handleTheme = (t: Theme) => { setTheme(t); applyTheme(t); };

    const startEditing = () => {
        setEditForm({ fullName: user.fullName, phone: user.phone || '', whatsappNumber: user.whatsappNumber || '' });
        setSaveError(''); setSaveSuccess(''); setEditing(true);
    };

    const saveEditing = async () => {
        setSaving(true); setSaveError('');
        try {
            await authApi.updateMe({ full_name: editForm.fullName, phone: editForm.phone, whatsapp_number: editForm.whatsappNumber });
            await refreshUser();
            setSaveSuccess('Profile updated successfully.'); setEditing(false);
        } catch (err) {
            setSaveError(err instanceof ApiError ? err.message : 'Failed to update profile.');
        } finally { setSaving(false); }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; e.target.value = '';
        if (!file) return;
        setUploadingPhoto(true);
        try { await authApi.uploadProfilePhoto(file); await refreshUser(); }
        catch { setSaveError('Failed to upload photo.'); }
        finally { setUploadingPhoto(false); }
    };

    const handlePasswordChange = async () => {
        setPasswordError(''); setPasswordSuccess('');
        if (!passwordForm.current) { setPasswordError('Current password is required.'); return; }
        if (passwordForm.newPass.length < 8) { setPasswordError('New password must be at least 8 characters.'); return; }
        if (passwordForm.newPass !== passwordForm.confirm) { setPasswordError('Passwords do not match.'); return; }
        setChangingPassword(true);
        try {
            await authApi.changePassword(passwordForm.current, passwordForm.newPass);
            setPasswordForm({ current: '', newPass: '', confirm: '' });
            setPasswordSuccess('Password updated successfully.');
        } catch (err) {
            setPasswordError(err instanceof ApiError ? err.message : 'Failed to change password.');
        } finally { setChangingPassword(false); }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 font-sans antialiased">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1B395F' }}>Account Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your profile, security, and appearance preferences.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-slate-100 px-4 pt-4 pb-0 flex gap-1">
                    {TABS.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${active
                                    ? 'border-[#1B395F] text-[#1B395F] bg-[#1B395F]/5'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6 sm:p-8">

                    {/* ══════ PROFILE TAB ══════ */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Avatar + identity */}
                            <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-[#54B5BB]/5">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <Avatar src={user.photoUrl} name={user.fullName} size="2xl" className="border-2 border-white shadow-lg" />
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
                                        className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:opacity-90 cursor-pointer text-white"
                                        style={{ background: '#1B395F' }}>
                                        <Camera size={13} />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                                        {user.fullName}
                                        {user.isVerified && <ShieldCheck size={15} className="text-emerald-500" />}
                                    </h3>
                                    <p className="text-xs font-semibold mt-0.5" style={{ color: '#54B5BB' }}>{ROLE_LABEL[user.role] ?? user.role}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                                </div>
                            </div>

                            {/* Editable fields */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-800">Contact Information</h3>
                                    {!editing ? (
                                        <button onClick={startEditing} className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">
                                            <Pencil size={12} /> Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditing(false)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                                            <button onClick={saveEditing} disabled={saving}
                                                className="px-3.5 py-1.5 text-white text-xs font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                                                style={{ background: '#1B395F' }}>
                                                {saving ? 'Saving…' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {saveError && <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl px-3 py-2">{saveError}</p>}
                                {saveSuccess && !editing && <p className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">✓ {saveSuccess}</p>}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <User size={12} /> Full Name
                                        </label>
                                        {editing ? (
                                            <input type="text" value={editForm.fullName}
                                                onChange={(e) => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                                                className={INPUT_CLS} placeholder="Your full name" />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                                        )}
                                    </div>

                                    {/* Email — read-only with info */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <Mail size={12} /> Email Address
                                        </label>
                                        <p className="text-sm font-semibold text-slate-800">{user.email}</p>
                                        <p className="text-[10px] text-slate-400">To change your email, contact support.</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <Phone size={12} /> Phone
                                        </label>
                                        {editing ? (
                                            <input type="tel" value={editForm.phone}
                                                onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                                                className={INPUT_CLS} placeholder="+250 7XX XXX XXX" />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-800">{user.phone || <span className="text-slate-400">—</span>}</p>
                                        )}
                                    </div>

                                    {/* WhatsApp */}
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <MessageSquare size={12} /> WhatsApp
                                        </label>
                                        {editing ? (
                                            <input type="tel" value={editForm.whatsappNumber}
                                                onChange={(e) => setEditForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                                                className={INPUT_CLS} placeholder="+250 7XX XXX XXX" />
                                        ) : (
                                            <p className="text-sm font-semibold text-slate-800">{user.whatsappNumber || <span className="text-slate-400">—</span>}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════ SECURITY TAB ══════ */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 max-w-md">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Change Password</h3>
                                <p className="text-xs text-slate-400">Use a strong password of at least 8 characters.</p>
                            </div>

                            {[
                                { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                                { key: 'newPass', label: 'New Password',      placeholder: 'Minimum 8 characters' },
                                { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 block">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={showPw[key as keyof typeof showPw] ? 'text' : 'password'}
                                            value={passwordForm[key as keyof typeof passwordForm]}
                                            onChange={(e) => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                                            className={INPUT_CLS + ' pr-10'}
                                            placeholder={placeholder}
                                        />
                                        <button onClick={() => setShowPw(s => ({ ...s, [key]: !s[key as keyof typeof s] }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                                            {showPw[key as keyof typeof showPw] ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {passwordError && <p className="text-xs text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl px-3 py-2">{passwordError}</p>}
                            {passwordSuccess && <p className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">✓ {passwordSuccess}</p>}

                            <button onClick={handlePasswordChange} disabled={changingPassword}
                                className="px-6 py-2.5 text-white font-bold text-sm rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #1B395F 0%, #54B5BB 100%)' }}>
                                {changingPassword ? 'Updating…' : 'Update Password'}
                            </button>
                        </div>
                    )}

                    {/* ══════ APPEARANCE TAB ══════ */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Display Theme</h3>
                                <p className="text-xs text-slate-400">Choose how the dashboard looks for you. Changes apply instantly.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {([
                                    { key: 'light',  label: 'Light Mode',  icon: <Sun size={22} />,     desc: 'Clean white interface' },
                                    { key: 'dark',   label: 'Dark Mode',   icon: <Moon size={22} />,    desc: 'Easy on the eyes at night' },
                                    { key: 'system', label: 'System',      icon: <Monitor size={22} />, desc: 'Follows your OS setting' },
                                ] as { key: Theme; label: string; icon: React.ReactNode; desc: string }[]).map((opt) => {
                                    const active = theme === opt.key;
                                    return (
                                        <button key={opt.key} onClick={() => handleTheme(opt.key)}
                                            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer ${active ? 'border-[#1B395F] shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                                            style={active ? { background: 'linear-gradient(135deg, rgba(27,57,95,0.06) 0%, rgba(84,181,187,0.08) 100%)' } : {}}>
                                            <span style={{ color: active ? '#1B395F' : '#94a3b8' }}>{opt.icon}</span>
                                            <div className="text-center">
                                                <p className={`text-sm font-extrabold ${active ? 'text-[#1B395F]' : 'text-slate-600'}`}>{opt.label}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                                            </div>
                                            {active && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                                                    style={{ background: '#1B395F' }}>Active</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-4 rounded-2xl border border-[#54B5BB]/20 bg-[#54B5BB]/5">
                                <p className="text-xs font-semibold text-slate-600">
                                    <span className="font-bold" style={{ color: '#1B395F' }}>Note: </span>
                                    Dark mode support is being progressively rolled out across all dashboard pages.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
