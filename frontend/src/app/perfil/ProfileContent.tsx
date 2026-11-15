'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from '@/lib/axios';
import { getSavedSearches, deleteSavedSearch, getFpQuizResult, deleteFpQuizResult } from '@/services/api';
import { QuizResult, ATTRIBUTE_LABELS, ATTRIBUTE_EMOJIS } from '@/lib/descubre-fp/types';
import PullToRefresh from '@/components/PullToRefresh';
import { SavedSearch } from '@/types';
import { User, Heart, Lock, Camera, LogOut, Trash, AlertCircle, CheckCircle, Bookmark, X, Building2, MapPin, RotateCcw, Compass, ArrowRight, Sparkles, Mail, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import LogoutConfirmationModal from '@/components/auth/LogoutConfirmationModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';

import { centroName, centroTipo, centroLugar, titleCase } from '@/lib/centro-format';
import { AuthField, BrandBackdrop } from '@/components/auth/AuthLayout';
interface UserData {
    name: string;
    email: string;
    foto_perfil?: string;
    ubicacion_lat?: number;
    ubicacion_lon?: number;
}

interface Favorito {
    id: number;
    centro: {
        id: number;
        nombre: string;
        direccion?: string;
        denominacion_generica?: string;
        naturaleza?: string;
        localidad?: string;
        provincia?: string;
    };
}

export default function ProfileContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [favoritos, setFavoritos] = useState<Favorito[]>([]);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'favorites' | 'searches' | 'fp-analysis'>('profile');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { restartTour } = useOnboarding();
    const { logout: authLogout, updateUser, user: authUser } = useAuth();

    const [name, setName] = useState('');
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    const [uploading, setUploading] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [sendingRecovery, setSendingRecovery] = useState(false);
    const [passwordFailed, setPasswordFailed] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Custom Logout Modal State
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Delete Search Confirmation Modal State
    const [searchToDelete, setSearchToDelete] = useState<SavedSearch | null>(null);

    // FP Quiz Result
    const [fpResult, setFpResult] = useState<QuizResult | null>(null);
    const [deletingFpResult, setDeletingFpResult] = useState(false);


    const passwordRequirements = useMemo(() => {
        return [
            { text: "8 caracteres", met: passwordData.new.length >= 8 },
            { text: "Una mayúscula", met: /[A-Z]/.test(passwordData.new) },
            { text: "Un número", met: /[0-9]/.test(passwordData.new) },
            { text: "Coinciden", met: passwordData.new && passwordData.new === passwordData.confirm },
        ];
    }, [passwordData.new, passwordData.confirm]);

    const isPasswordValid = passwordRequirements.every(req => req.met) && passwordData.new.length > 0;

    // Los avisos flotantes se ocultan solos
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(() => setMessage(null), 3500);
        return () => clearTimeout(t);
    }, [message]);

    useEffect(() => {
        fetchData();

        const tab = searchParams.get('tab');
        if (tab === 'favorites') setActiveTab('favorites');
        if (tab === 'security') setActiveTab('security');
        if (tab === 'profile') setActiveTab('profile');
        if (tab === 'searches') setActiveTab('searches');
        if (tab === 'fp-analysis') setActiveTab('fp-analysis');

    }, [searchParams]);

    const fetchData = async () => {
        try {
            const [userRes, favRes, searchesRes, fpRes] = await Promise.all([
                api.get('/me'),
                api.get('/favoritos'),
                getSavedSearches(),
                getFpQuizResult().catch(() => null),
            ]);
            setUser(userRes.data);
            setName(userRes.data.name);
            setFavoritos(favRes.data);
            setSavedSearches(searchesRes);
            setFpResult(fpRes);

        } catch (error) {
            router.push('/login');

        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            const res = await api.put('/me', { name });

            setUser(res.data.user);

            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));

            setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });

        } catch (error) {
            setMessage({ text: 'Error al actualizar perfil', type: 'error' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setPasswordFailed(false);

        if (!isPasswordValid) {
            setMessage({ text: 'Por favor cumple todos los requisitos de la contraseña', type: 'error' });
            return;
        }

        setUpdatingPassword(true);
        try {
            await api.put('/me/password', {
                current_password: passwordData.current,
                password: passwordData.new,
                password_confirmation: passwordData.confirm
            });
            setMessage({ text: 'Contraseña actualizada', type: 'success' });
            setPasswordData({ current: '', new: '', confirm: '' });

        } catch (error: any) {
            setMessage({ text: error.response?.data?.message || 'Error al cambiar contraseña', type: 'error' });
            setPasswordFailed(true);

        } finally {
            setUpdatingPassword(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setMessage({ text: 'La imagen no debe superar los 2MB', type: 'error' });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const res = await api.post('/me/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newFoto = res.data.user.foto_perfil;
            setUser(prev => prev ? { ...prev, foto_perfil: newFoto } : null);
            setMessage({ text: 'Foto actualizada correctamente', type: 'success' });

            // Sincronizar AuthContext para que Navbar/BottomNav actualicen el avatar sin reload
            if (authUser) updateUser({ ...authUser, foto_perfil: newFoto });

        } catch (error) {
            setMessage({ text: 'Error al subir la imagen', type: 'error' });

        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete('/me/photo');
            setUser(prev => prev ? { ...prev, foto_perfil: undefined } : null);
            setMessage({ text: 'Foto eliminada correctamente', type: 'success' });

            // Sincronizar AuthContext
            if (authUser) updateUser({ ...authUser, foto_perfil: undefined });

        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Error al eliminar la foto';
            setMessage({ text: errorMsg, type: 'error' });

        } finally {
            setShowDeleteConfirm(false);
        }
    };


    const handleDeleteFpResult = async () => {
        setDeletingFpResult(true);
        try {
            await deleteFpQuizResult();
            try { localStorage.removeItem('edufinder_descubre_fp_result'); } catch {}
            setFpResult(null);
            setMessage({ text: 'Análisis eliminado', type: 'success' });
        } catch {
            setMessage({ text: 'Error al eliminar el análisis', type: 'error' });
        } finally {
            setDeletingFpResult(false);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleDeleteSearch = async (search: SavedSearch) => {
        try {
            await deleteSavedSearch(search.id);
            setSavedSearches(prev => prev.filter(s => s.id !== search.id));
            setMessage({ text: 'Búsqueda eliminada', type: 'success' });
            setSearchToDelete(null);
        } catch (error) {
            setMessage({ text: 'Error al eliminar búsqueda', type: 'error' });
            setSearchToDelete(null);
        }
    };

    const buildSearchUrl = (filters: any) => {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.provincia) params.set('provincia', filters.provincia);
        if (filters.tipo) params.set('tipo', filters.tipo);
        if (filters.naturaleza) params.set('naturaleza', filters.naturaleza);
        if (filters.familia) params.set('familia', filters.familia);
        if (filters.ciclo) params.set('ciclo', filters.ciclo);
        if (filters.nivel) params.set('nivel', filters.nivel);
        if (filters.modalidad) params.set('modalidad', filters.modalidad);
        if (filters.lat && filters.lng) {
            params.set('lat', filters.lat.toString());
            params.set('lng', filters.lng.toString());
            params.set('radio', (filters.radio || 10).toString());
        }
        return `/?${params.toString()}`;
    };

    const formatFilters = (filters: any) => {
        const parts: { label: string; type: 'location' | 'education' | 'general' }[] = [];
        if (filters.provincia) parts.push({ label: filters.provincia, type: 'location' });
        if (filters.naturaleza) parts.push({ label: filters.naturaleza, type: 'general' });
        if (filters.familia) parts.push({ label: filters.familia, type: 'education' });
        if (filters.nivel) parts.push({ label: filters.nivel, type: 'education' });
        if (filters.modalidad) parts.push({ label: filters.modalidad, type: 'education' });
        if (filters.lat && filters.lng) parts.push({ label: `Radio ${filters.radio || 10}km`, type: 'location' });
        return parts;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);
        await authLogout(); // limpia AuthContext (setUser null) + localStorage + API call
        setIsLoggingOut(false);
        setShowLogoutModal(false);
        window.location.href = '/login'; // hard redirect para limpiar estado React completamente
    };

    const handleRefresh = useCallback(async () => { await fetchData(); }, []);

    if (loading) return <ProfileSkeleton />;

    const fpLabel = fpResult?.userProfile.profileLabel.replace(/^Perfil\s+/i, '').replace(/^./, c => c.toUpperCase());

    const TABS = [
        { key: 'profile', icon: User, label: 'Perfil', title: 'Tu información', subtitle: 'Cómo te ven en EduFinder.', count: 0 },
        { key: 'security', icon: Lock, label: 'Seguridad', title: 'Seguridad', subtitle: 'Cambia tu contraseña de acceso.', count: 0 },
        { key: 'favorites', icon: Heart, label: 'Favoritos', title: 'Mis favoritos', subtitle: 'Los centros que has guardado.', count: favoritos.length },
        { key: 'searches', icon: Bookmark, label: 'Búsquedas', title: 'Búsquedas guardadas', subtitle: 'Vuelve a tus filtros con un toque.', count: savedSearches.length },
        { key: 'fp-analysis', icon: Compass, label: 'Mi FP', title: 'Mi análisis FP', subtitle: 'Tu perfil vocacional y tus caminos.', count: 0 },
    ] as const;
    const current = TABS.find(t => t.key === activeTab)!;

    const avatar = (size: 'sm' | 'lg') => (
        <button
            type="button"
            onClick={() => setShowPhotoMenu(true)}
            aria-label="Cambiar foto de perfil"
            className="relative shrink-0 group rounded-full"
        >
            <span className={`block rounded-full p-[3px] bg-gradient-to-br from-[#223945] via-blue-600 to-blue-300 shadow-lg shadow-[#223945]/20 ${size === 'lg' ? 'w-24 h-24' : 'w-14 h-14'}`}>
                {user?.foto_perfil ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={user.foto_perfil}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover bg-white ring-2 ring-white"
                        onError={() => setUser(prev => prev ? { ...prev, foto_perfil: undefined } : null)}
                    />
                ) : (
                    <span className={`w-full h-full rounded-full bg-gradient-to-br from-[#223945] to-[#2d4a5e] ring-2 ring-white text-white font-bold flex items-center justify-center ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </span>
                )}
            </span>
            <span className={`absolute bottom-0 right-0 rounded-full bg-white shadow-md ring-1 ring-neutral-200 flex items-center justify-center text-[#223945] group-hover:text-blue-600 transition-colors ${size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'}`}>
                <Camera className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
            </span>
        </button>
    );

    return (
        <div className="profile-ui relative isolate bg-brand-gradient h-[calc(100dvh-var(--mobile-header-height)-var(--bottom-nav-height))] md:h-[calc(100dvh-5rem)] p-3 sm:p-4 md:p-8 flex items-stretch md:items-center justify-center">
            <PullToRefresh onRefresh={handleRefresh} />
            <BrandBackdrop pattern={false} />

            <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handlePhotoUpload} />

            {/* Aviso flotante (no desplaza el contenido) */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        key={message.text}
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        role="status"
                        className={`fixed left-1/2 -translate-x-1/2 top-[calc(var(--mobile-header-height)+0.75rem)] md:top-24 z-[150] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold max-w-[calc(100%-2rem)] ${
                            message.type === 'success' ? 'bg-[#223945] text-white' : 'bg-red-600 text-white'
                        }`}
                    >
                        {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span className="truncate">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full max-w-5xl h-full md:h-auto md:max-h-full md:min-h-[560px] flex flex-col md:flex-row bg-white/85 backdrop-blur-xl rounded-3xl border border-white/70 shadow-[0_24px_60px_-20px_rgba(34,57,69,0.35)] overflow-hidden"
            >
                <div aria-hidden="true" className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300 z-10" />

                {/* ── Cabecera móvil ── */}
                <div className="md:hidden shrink-0 px-4 pt-5 pb-3">
                    <div className="flex items-center gap-3">
                        {avatar('sm')}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-extrabold text-[#223945] leading-tight truncate">{user?.name}</h1>
                            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogoutClick}
                            aria-label="Cerrar sesión"
                            className="shrink-0 w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <LogOut className="w-[18px] h-[18px]" />
                        </button>
                    </div>
                </div>

                {/* Pestañas móvil: control segmentado */}
                <div className="md:hidden shrink-0 px-3 pb-2">
                    <div role="tablist" className="flex p-1 rounded-2xl bg-[#223945]/[0.06]">
                        {TABS.map(t => {
                            const active = activeTab === t.key;
                            return (
                                <button
                                    key={t.key}
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setActiveTab(t.key)}
                                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                                        active ? 'bg-white text-[#223945] shadow-sm' : 'text-neutral-500'
                                    }`}
                                >
                                    <span className="relative">
                                        <t.icon className={`w-4 h-4 ${active ? 'text-blue-600' : ''}`} />
                                        {t.count > 0 && (
                                            <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#223945] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                                                {t.count}
                                            </span>
                                        )}
                                    </span>
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Lateral escritorio ── */}
                <aside className="hidden md:flex md:w-72 lg:w-80 shrink-0 flex-col border-r border-neutral-100 bg-white/60 p-6 pt-9">
                    <div className="flex flex-col items-center text-center">
                        {avatar('lg')}
                        <h1 className="mt-4 text-xl font-extrabold text-[#223945] leading-tight">{user?.name}</h1>
                        <p className="text-sm text-neutral-500 truncate max-w-full">{user?.email}</p>
                        {fpLabel && (
                            <span className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-100">
                                <Sparkles className="w-3 h-3" />
                                {fpLabel}
                            </span>
                        )}
                    </div>

                    <nav className="mt-6 space-y-1">
                        {TABS.map(t => {
                            const active = activeTab === t.key;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveTab(t.key)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        active
                                            ? 'bg-gradient-to-r from-[#223945] to-blue-700 text-white shadow-md shadow-[#223945]/20'
                                            : 'text-neutral-600 hover:bg-[#223945]/[0.05] hover:text-[#223945]'
                                    }`}
                                >
                                    <t.icon className="w-4 h-4" />
                                    <span className="flex-1 text-left">{t.label === 'Mi FP' ? 'Mi análisis FP' : t.label}</span>
                                    {t.count > 0 && (
                                        <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center ${active ? 'bg-white/20' : 'bg-neutral-100 text-neutral-500'}`}>
                                            {t.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-neutral-100 space-y-1">
                        <button
                            onClick={() => { restartTour(); router.push('/'); }}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-[#223945]/[0.05] hover:text-[#223945] transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Ver la guía de nuevo
                        </button>
                        <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </aside>

                {/* ── Contenido ── */}
                <section className="flex-1 min-h-0 flex flex-col">
                    <header className="hidden md:block shrink-0 px-8 pt-9 pb-4">
                        <h2 className="text-2xl font-extrabold tracking-tight text-[#223945]">{current.title}</h2>
                        <p className="text-sm text-neutral-500 mt-0.5">{current.subtitle}</p>
                    </header>

                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4 pt-1 md:px-8 md:pb-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.18 }}
                            >
                                {activeTab === 'profile' && (
                                    <div className="space-y-4 max-w-lg">
                                        <form onSubmit={handleUpdateProfile}>
                                            <AuthField
                                                id="profile-name"
                                                label="Nombre"
                                                icon={User}
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                autoComplete="name"
                                                labelAction={name !== user?.name && name.trim() ? (
                                                    <button type="submit" className="text-xs font-bold text-blue-600 hover:text-blue-700">Guardar cambios</button>
                                                ) : undefined}
                                            />
                                        </form>
                                        <AuthField
                                            id="profile-email"
                                            label="Correo electrónico"
                                            icon={Mail}
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            readOnly
                                        />
                                        <button
                                            onClick={() => { restartTour(); router.push('/'); }}
                                            className="md:hidden w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-neutral-200 text-left active:scale-[0.99] transition-transform"
                                        >
                                            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <RotateCcw className="w-4 h-4" />
                                            </span>
                                            <span className="flex-1">
                                                <span className="block text-sm font-bold text-[#223945]">Ver la guía de nuevo</span>
                                                <span className="block text-xs text-neutral-500">Repasa cómo usar EduFinder en 1 minuto</span>
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-neutral-400" />
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <form onSubmit={handleUpdatePassword} className="space-y-3.5 max-w-lg">
                                        <AuthField
                                            id="current-password"
                                            label="Contraseña actual"
                                            icon={Lock}
                                            type="password"
                                            autoComplete="current-password"
                                            value={passwordData.current}
                                            onChange={e => { setPasswordData({ ...passwordData, current: e.target.value }); setPasswordFailed(false); }}
                                        />
                                        <div className="grid sm:grid-cols-2 gap-3.5">
                                            <AuthField
                                                id="new-password"
                                                label="Nueva contraseña"
                                                icon={Lock}
                                                type="password"
                                                autoComplete="new-password"
                                                value={passwordData.new}
                                                onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                            />
                                            <AuthField
                                                id="confirm-password"
                                                label="Repite la nueva"
                                                icon={Lock}
                                                type="password"
                                                autoComplete="new-password"
                                                value={passwordData.confirm}
                                                onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-1">
                                            {passwordRequirements.map(req => (
                                                <div key={req.text} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${req.met ? 'text-emerald-600' : 'text-neutral-400'}`}>
                                                    {req.met ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 shrink-0" />}
                                                    {req.text}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!passwordData.current || !isPasswordValid || updatingPassword}
                                            className="w-full sm:w-auto sm:px-8 h-11 rounded-xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white text-sm font-bold shadow-lg shadow-[#223945]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:shadow-none enabled:hover:-translate-y-0.5"
                                        >
                                            {updatingPassword && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                            {updatingPassword ? 'Actualizando…' : 'Actualizar contraseña'}
                                        </button>
                                        {passwordFailed && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (sendingRecovery) return;
                                                    setSendingRecovery(true);
                                                    try {
                                                        await api.post('/forgot-password', { email: user?.email });
                                                        setPasswordFailed(false);
                                                        setMessage({ text: 'Email de recuperación enviado a ' + user?.email, type: 'success' });
                                                    } catch {
                                                        setMessage({ text: 'Error al enviar email', type: 'error' });
                                                    } finally {
                                                        setSendingRecovery(false);
                                                    }
                                                }}
                                                disabled={sendingRecovery}
                                                className="block text-xs font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                {sendingRecovery ? 'Enviando enlace…' : '¿No la recuerdas? Recibir enlace de recuperación →'}
                                            </button>
                                        )}
                                    </form>
                                )}

                                {activeTab === 'favorites' && (
                                    favoritos.length > 0 ? (
                                        <ul className="space-y-2">
                                            {favoritos.map(fav => {
                                                const publico = fav.centro.naturaleza?.toUpperCase().includes('PÚBLICO');
                                                return (
                                                    <li key={fav.id} className="flex items-center gap-3 p-2.5 pr-2 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#223945]/25 hover:shadow-md transition-all">
                                                        <Link href={`/centro/${fav.centro.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                                            <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${publico ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                <Building2 className="w-5 h-5" />
                                                            </span>
                                                            <span className="min-w-0">
                                                                <span className="block text-[15px] font-bold text-[#111827] leading-tight truncate">{centroName(fav.centro)}</span>
                                                                <span className="block text-xs text-neutral-500 truncate mt-0.5">
                                                                    {centroTipo(fav.centro.denominacion_generica)} · {centroLugar(fav.centro)}
                                                                </span>
                                                            </span>
                                                        </Link>
                                                        <Link
                                                            href={`/mapa?centro=${fav.centro.id}`}
                                                            aria-label="Ver en el mapa"
                                                            className="w-9 h-9 rounded-xl bg-neutral-50 text-neutral-500 hover:text-[#223945] hover:bg-neutral-100 flex items-center justify-center shrink-0 transition-colors"
                                                        >
                                                            <MapPin className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await api.delete(`/favoritos/${fav.centro.id}`);
                                                                    setFavoritos(prev => prev.filter(f => f.id !== fav.id));
                                                                    setMessage({ text: 'Centro eliminado de favoritos', type: 'success' });
                                                                } catch {
                                                                    setMessage({ text: 'Error al eliminar favorito', type: 'error' });
                                                                }
                                                            }}
                                                            aria-label="Quitar de favoritos"
                                                            className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center shrink-0 transition-colors"
                                                        >
                                                            <Heart className="w-4 h-4 fill-current" />
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <EmptyState
                                            icon={Heart}
                                            title="Aún no tienes favoritos"
                                            text="Guarda centros con el corazón para tenerlos a mano y recibir recomendaciones."
                                            href="/"
                                            cta="Buscar centros"
                                        />
                                    )
                                )}

                                {activeTab === 'searches' && (
                                    savedSearches.length > 0 ? (
                                        <ul className="space-y-2">
                                            {savedSearches.map(search => {
                                                const filterItems = formatFilters(search.filters);
                                                return (
                                                    <li key={search.id} className="flex items-center gap-3 p-2.5 pr-2 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#223945]/25 hover:shadow-md transition-all">
                                                        <Link href={buildSearchUrl(search.filters)} className="flex items-center gap-3 flex-1 min-w-0">
                                                            <span className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                                <Bookmark className="w-5 h-5" />
                                                            </span>
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block text-[15px] font-bold text-[#111827] leading-tight truncate">{search.name}</span>
                                                                <span className="mt-1 flex gap-1 overflow-hidden">
                                                                    {search.filters.q && (
                                                                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">“{search.filters.q}”</span>
                                                                    )}
                                                                    {filterItems.map((f, i) => (
                                                                        <span key={i} className="shrink-0 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-semibold">
                                                                            {titleCase(f.label)}
                                                                        </span>
                                                                    ))}
                                                                    {filterItems.length === 0 && !search.filters.q && (
                                                                        <span className="text-[11px] text-neutral-400">{formatDate(search.created_at)}</span>
                                                                    )}
                                                                </span>
                                                            </span>
                                                        </Link>
                                                        <button
                                                            onClick={() => setSearchToDelete(search)}
                                                            aria-label="Eliminar búsqueda"
                                                            className="w-9 h-9 rounded-xl bg-neutral-50 text-neutral-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <EmptyState
                                            icon={Bookmark}
                                            title="No tienes búsquedas guardadas"
                                            text="Filtra en el buscador y pulsa el marcador para guardar la búsqueda."
                                            href="/"
                                            cta="Ir al buscador"
                                        />
                                    )
                                )}

                                {activeTab === 'fp-analysis' && (
                                    fpResult ? (
                                        <div className="space-y-3">
                                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#223945] via-[#24406a] to-blue-700 p-4 shadow-lg shadow-blue-900/20">
                                                <div aria-hidden="true" className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-400/20 blur-2xl" />
                                                <p className="relative text-[11px] font-bold uppercase tracking-widest text-blue-200/80">Tu perfil</p>
                                                <p className="relative text-xl font-extrabold text-white leading-tight">{fpLabel}</p>
                                                <div className="relative mt-2.5 flex flex-wrap gap-1.5">
                                                    {fpResult.userProfile.topAttributes.slice(0, 3).map(attr => (
                                                        <span key={attr} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-xs font-semibold text-white">
                                                            {ATTRIBUTE_EMOJIS[attr]} {ATTRIBUTE_LABELS[attr]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <ul className="space-y-2">
                                                {fpResult.matches.map((match, i) => (
                                                    <li key={match.family.codigo}>
                                                        <Link
                                                            href={`/?tipo=FP&familia=${encodeURIComponent(match.family.queryParam)}`}
                                                            className="flex items-center gap-3 p-2.5 pr-3 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#223945]/25 hover:shadow-md transition-all"
                                                        >
                                                            <span
                                                                className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-xl"
                                                                style={{ background: `linear-gradient(135deg, ${match.family.colorFrom}, ${match.family.colorTo})` }}
                                                            >
                                                                {match.family.emoji}
                                                            </span>
                                                            <span className="flex-1 min-w-0">
                                                                <span className="flex items-center gap-1.5">
                                                                    {i === 0 && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                                                                    <span className="text-[15px] font-bold text-[#111827] truncate">{match.family.nombre}</span>
                                                                </span>
                                                                <span className="mt-1.5 flex items-center gap-2">
                                                                    <span className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                                                                        <span className="block h-full rounded-full bg-gradient-to-r from-[#223945] to-blue-500" style={{ width: `${match.score}%` }} />
                                                                    </span>
                                                                    <span className="text-xs font-extrabold text-[#223945] tabular-nums">{match.score}%</span>
                                                                </span>
                                                            </span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="flex gap-2 pt-1">
                                                <Link
                                                    href="/descubre-tu-fp"
                                                    className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#223945] via-[#2d4a5e] to-blue-600 text-white text-sm font-bold shadow-lg shadow-[#223945]/20 hover:-translate-y-0.5 transition-all"
                                                >
                                                    Ver análisis completo
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={handleDeleteFpResult}
                                                    disabled={deletingFpResult}
                                                    aria-label="Eliminar análisis"
                                                    className="w-11 h-11 rounded-xl bg-white border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50"
                                                >
                                                    {deletingFpResult
                                                        ? <span className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                                                        : <Trash className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Compass}
                                            title="Aún no has hecho tu análisis"
                                            text="12 preguntas y 3 minutos para descubrir qué FP encaja contigo."
                                            href="/descubre-tu-fp"
                                            cta="Descubre tu FP"
                                        />
                                    )
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>
            </motion.div>

            {/* Menú de foto */}
            {showPhotoMenu && (
                <>
                    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm" onClick={() => setShowPhotoMenu(false)} />
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pointer-events-none">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden pointer-events-auto animate-in zoom-in-95 fade-in duration-200">
                            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center pt-4 pb-3 border-b border-neutral-100">
                                Foto de perfil
                            </p>
                            <button
                                onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
                                disabled={uploading}
                                className="w-full px-6 py-3.5 text-sm font-bold text-[#223945] hover:bg-neutral-50 active:bg-neutral-100 transition-colors border-b border-neutral-100"
                            >
                                {uploading ? 'Subiendo…' : 'Cambiar foto'}
                            </button>
                            {user?.foto_perfil && (
                                <button
                                    onClick={() => { setShowDeleteConfirm(true); setShowPhotoMenu(false); }}
                                    className="w-full px-6 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors border-b border-neutral-100"
                                >
                                    Eliminar foto actual
                                </button>
                            )}
                            <button
                                onClick={() => setShowPhotoMenu(false)}
                                className="w-full px-6 py-3.5 text-sm font-medium text-neutral-400 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showDeleteConfirm && (
                <ConfirmDialog
                    title="¿Eliminar foto de perfil?"
                    text="Volverás a tener tu inicial como avatar."
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={confirmDelete}
                />
            )}

            {searchToDelete && (
                <ConfirmDialog
                    title="¿Eliminar búsqueda guardada?"
                    text={`Vas a eliminar “${searchToDelete.name}”. Esta acción no se puede deshacer.`}
                    onCancel={() => setSearchToDelete(null)}
                    onConfirm={() => handleDeleteSearch(searchToDelete)}
                />
            )}

            <LogoutConfirmationModal
                key="logout-modal-profile"
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogoutConfirm}
                isLoggingOut={isLoggingOut}
            />
        </div>
    );
}

// ─── Piezas de presentación ──────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, text, href, cta }: { icon: LucideIcon; title: string; text: string; href: string; cta: string }) {
    return (
        <div className="flex flex-col items-center text-center px-6 py-10 rounded-3xl border border-dashed border-neutral-200 bg-white/50">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#223945] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-[#223945]/20">
                <Icon className="w-6 h-6" />
            </span>
            <h3 className="mt-4 text-base font-extrabold text-[#223945]">{title}</h3>
            <p className="mt-1 text-sm text-neutral-500 max-w-xs">{text}</p>
            <Link
                href={href}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#223945] text-white text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all"
            >
                {cta}
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

function ConfirmDialog({ title, text, onCancel, onConfirm }: { title: string; text: string; onCancel: () => void; onConfirm: () => void }) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 text-center">
                <span className="mx-auto w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-500">
                    <AlertCircle className="w-6 h-6" />
                </span>
                <h3 className="text-lg font-extrabold text-[#223945]">{title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500">{text}</p>
                <div className="mt-6 flex gap-3">
                    <button onClick={onCancel} className="flex-1 h-11 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-sm hover:bg-neutral-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="flex-1 h-11 rounded-xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="bg-brand-gradient h-[calc(100dvh-var(--mobile-header-height)-var(--bottom-nav-height))] md:h-[calc(100dvh-5rem)] p-3 sm:p-4 md:p-8 flex items-stretch md:items-center justify-center">
            <div className="w-full max-w-5xl h-full md:h-[560px] rounded-3xl bg-white/70 animate-pulse flex flex-col md:flex-row overflow-hidden">
                <div className="md:w-80 p-6 flex md:flex-col items-center gap-4">
                    <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-neutral-200" />
                    <div className="space-y-2 md:w-full md:flex md:flex-col md:items-center">
                        <div className="h-5 w-32 bg-neutral-200 rounded-lg" />
                        <div className="h-4 w-44 bg-neutral-100 rounded-lg" />
                    </div>
                </div>
                <div className="flex-1 p-6 space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-neutral-100 rounded-xl" />)}
                </div>
            </div>
        </div>
    );
}
