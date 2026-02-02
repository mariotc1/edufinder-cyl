'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import api from '@/lib/axios';
import { User, MapPin, Heart, Lock, Camera, LogOut, Eye, EyeOff, ChevronLeft, Trash, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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
        // Add other properties as needed
    };
}

export default function ProfileContent() {
    const [user, setUser] = useState<UserData | null>(null);
    const [favoritos, setFavoritos] = useState<Favorito[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'favorites'>('profile');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Form states
    const [name, setName] = useState('');
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [sendingRecovery, setSendingRecovery] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Live Password Validation
    const passwordRequirements = useMemo(() => {
        return [
            { text: "Mínimo 8 caracteres", met: passwordData.new.length >= 8 },
            { text: "Al menos una mayúscula", met: /[A-Z]/.test(passwordData.new) },
            { text: "Al menos un número", met: /[0-9]/.test(passwordData.new) },
            { text: "Coinciden", met: passwordData.new && passwordData.new === passwordData.confirm },
        ];
    }, [passwordData.new, passwordData.confirm]);

    const isPasswordValid = passwordRequirements.every(req => req.met) && passwordData.new.length > 0;

    useEffect(() => {
        fetchData();
        
        // Handle URL params for tab navigation
        const tab = searchParams.get('tab');
        if (tab === 'favorites') setActiveTab('favorites');
        if (tab === 'security') setActiveTab('security');
        if (tab === 'profile') setActiveTab('profile');
    }, [searchParams]);

    const fetchData = async () => {
        try {
            const [userRes, favRes] = await Promise.all([
                api.get('/me'),
                api.get('/favoritos')
            ]);
            setUser(userRes.data);
            setName(userRes.data.name);
            setFavoritos(favRes.data);
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
            // Update local storage if needed
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));

            setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
            // window.location.reload(); // Optional, to refresh navbar
        } catch (error) {
            setMessage({ text: 'Error al actualizar perfil', type: 'error' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        
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
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation (max 2MB)
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
            setUser(prev => prev ? { ...prev, foto_perfil: res.data.user.foto_perfil } : null);
            setMessage({ text: 'Foto actualizada correctamente', type: 'success' });

            // Update local storage
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, foto_perfil: res.data.user.foto_perfil }));
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

            // Update local storage
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, foto_perfil: null }));
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Error al eliminar la foto';
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const handleLocation = () => {
        if (user?.ubicacion_lat) {
            // Deactivate location
            api.put('/me', {
                name,
                ubicacion_lat: null,
                ubicacion_lon: null
            })
                .then(() => {
                    fetchData();
                    setMessage({ text: 'Ubicación desactivada', type: 'success' });
                })
                .catch(() => {
                    setMessage({ text: 'Error al desactivar ubicación', type: 'error' });
                });
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    await api.put('/me', {
                        name,
                        ubicacion_lat: position.coords.latitude,
                        ubicacion_lon: position.coords.longitude
                    });
                    fetchData();
                    setMessage({ text: 'Ubicación actualizada', type: 'success' });
                } catch (e) {
                    setMessage({ text: 'Error al actualizar ubicación', type: 'error' });
                }
            });
        }
    };

    const handleLogout = async () => {
        await api.post('/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-brand-gradient pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Back Link */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#223945] font-bold mb-8 transition-colors text-sm uppercase tracking-wide cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                </button>

                {/* Main Profile Card */}
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 overflow-hidden">
                    {/* Decorative Top Gradient */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

                    <div className="md:flex min-h-[600px]">
                        {/* Sidebar - High Contrast & Branding */}
                        <div className="md:w-1/3 bg-white p-8 border-r border-neutral-100 relative">
                            {/* Avatar Section */}
                            <div className="text-center mb-8 relative">
                                <div className="relative inline-block group">
                                    <div className="absolute inset-0 bg-[#223945] rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    {user?.foto_perfil ? (
                                        <img 
                                            src={user.foto_perfil} 
                                            alt={user.name}
                                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl relative z-10 bg-white" 
                                        />
                                    ) : (
                                        <div className="w-28 h-28 rounded-full bg-[#223945] text-white flex items-center justify-center text-4xl font-bold shadow-xl relative z-10 border-4 border-white">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                    {/* Fallback for onError (hidden by default) */}
                                    <div className="hidden w-28 h-28 rounded-full bg-[#223945] text-white flex items-center justify-center text-4xl font-bold shadow-xl relative z-10 border-4 border-white absolute top-0 left-0">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handlePhotoUpload}
                                    />

                                    {/* Botonera Fotos - Premium Corner Badges */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="absolute bottom-0 right-0 p-2.5 bg-white text-[#223945] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] border-[3px] border-white hover:bg-neutral-50 hover:scale-105 hover:shadow-lg transition-all z-20 group-hover:border-[#223945]/10"
                                        title="Cambiar foto"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>

                                    {user?.foto_perfil && (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            disabled={uploading}
                                            className="absolute top-0 right-0 p-2 bg-white text-red-500 rounded-full shadow-md border-2 border-white hover:bg-red-50 hover:text-red-600 hover:scale-110 transition-all z-20 translate-x-1/4 -translate-y-1/4 opacity-100 md:opacity-0 md:group-hover:opacity-100 duration-200"
                                            title="Eliminar foto"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <h2 className="mt-5 text-xl font-bold text-[#223945]">{user?.name}</h2>
                                <p className="text-sm text-neutral-500 font-medium">{user?.email}</p>
                            </div>

                            {/* Navigation Menu */}
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile'
                                            ? 'bg-[#223945] text-white shadow-md shadow-[#223945]/20'
                                            : 'text-neutral-500 hover:bg-neutral-50 hover:text-[#223945]'
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    <span>Perfil Personal</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'security'
                                            ? 'bg-[#223945] text-white shadow-md shadow-[#223945]/20'
                                            : 'text-neutral-500 hover:bg-neutral-50 hover:text-[#223945]'
                                        }`}
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>Seguridad</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'favorites'
                                            ? 'bg-[#223945] text-white shadow-md shadow-[#223945]/20'
                                            : 'text-neutral-500 hover:bg-neutral-50 hover:text-[#223945]'
                                        }`}
                                >
                                    <Heart className="w-4 h-4" />
                                    <span>Mis Favoritos</span>
                                </button>

                                <div className="pt-8 mt-4 border-t border-neutral-100">
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                                    </button>
                                </div>
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="md:w-2/3 p-8 lg:p-12 bg-white/50">
                            {message && (
                                <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${message.type === 'success'
                                        ? 'bg-green-50 text-green-700 border border-green-100'
                                        : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-[#223945]">Información Personal</h3>
                                        <p className="text-neutral-500 text-sm mt-1">Gestiona tu información básica y ubicación.</p>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 placeholder:text-neutral-400"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">Correo Electrónico</label>
                                                <input
                                                    type="email"
                                                    value={user?.email}
                                                    disabled
                                                    className="w-full px-4 py-3 rounded-xl bg-neutral-100 border-2 border-transparent text-neutral-500 font-medium cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={name === user?.name}
                                                className={`bg-[#223945] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#223945]/20 transition-all text-sm uppercase tracking-wide ${name === user?.name
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:shadow-[#223945]/40 hover:-translate-y-0.5'
                                                    }`}
                                            >
                                                Guardar Cambios
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-10 pt-10 border-t border-neutral-100">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-[#223945]">Ubicación</h3>
                                                <p className="text-sm text-neutral-500 mt-1">Para mejorar los resultados de búsqueda "Cerca de mí".</p>
                                            </div>
                                            {user?.ubicacion_lat && (
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                                                    Activa
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-[#223945]">
                                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                                    <MapPin className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <span className="font-bold text-sm">Geolocalización</span>
                                            </div>
                                            <div className="flex gap-3">
                                                {user?.ubicacion_lat && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleLocation();
                                                        }}
                                                        className="text-sm font-bold text-red-500 hover:text-red-700 hover:underline decoration-2 underline-offset-4"
                                                    >
                                                        Desactivar
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!user?.ubicacion_lat) handleLocation();
                                                        else {
                                                            // Logic to force update if already active?
                                                            // For now we treat 'handleLocation' as 'toggle' based on state, 
                                                            // but here we might want separate actions.
                                                            // If we want a separate 'Update' button we can add it.
                                                            // But reusing 'handleLocation' logic above handles toggle.
                                                            // Let's rely on the separate 'Desactivar' button I just added,
                                                            // and make this button only for 'Update' if present, or 'Activate' if not.
                                                            if (user?.ubicacion_lat) {
                                                                // Re-run geolocation to update
                                                                if (navigator.geolocation) {
                                                                    navigator.geolocation.getCurrentPosition(async (position) => {
                                                                        try {
                                                                            await api.put('/me', {
                                                                                name,
                                                                                ubicacion_lat: position.coords.latitude,
                                                                                ubicacion_lon: position.coords.longitude
                                                                            });
                                                                            fetchData();
                                                                            setMessage({ text: 'Ubicación actualizada', type: 'success' });
                                                                        } catch (e) {
                                                                            setMessage({ text: 'Error al actualizar ubicación', type: 'error' });
                                                                        }
                                                                    });
                                                                }
                                                            } else {
                                                                handleLocation();
                                                            }
                                                        }
                                                    }}
                                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline decoration-2 underline-offset-4"
                                                >
                                                    {user?.ubicacion_lat ? 'Actualizar' : 'Activar ubicación'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-[#223945]">Seguridad</h3>
                                        <p className="text-neutral-500 text-sm mt-1">Gestiona tu contraseña y acceso.</p>
                                    </div>

                                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">Contraseña Actual</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPass ? "text" : "password"}
                                                    value={passwordData.current}
                                                    onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#223945] transition-colors"
                                                >
                                                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">Nueva Contraseña</label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPass ? "text" : "password"}
                                                        value={passwordData.new}
                                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPass(!showNewPass)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#223945] transition-colors"
                                                    >
                                                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">Confirmar Nueva</label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPass ? "text" : "password"}
                                                        value={passwordData.confirm}
                                                        onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#223945] transition-colors"
                                                    >
                                                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>



                                        {/* Password Requirements Indicator */}
                                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 grid grid-cols-2 gap-x-4 gap-y-2">
                                            {passwordRequirements.map((req, idx) => (
                                                <div key={idx} className={`flex items-center gap-2 text-xs font-bold transition-colors ${req.met ? 'text-green-600' : 'text-neutral-400'}`}>
                                                    {req.met ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300" />}
                                                    {req.text}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={
                                                !passwordData.current || 
                                                !isPasswordValid ||
                                                updatingPassword
                                            }
                                                className={`bg-[#223945] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide flex items-center gap-2 ${
                                                (!passwordData.current || !isPasswordValid || updatingPassword)
                                                    ? 'opacity-50 cursor-not-allowed transform-none hover:shadow-none hover:translate-y-0'
                                                    : ''
                                                }`}
                                            >
                                                {updatingPassword ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Actualizando...
                                                    </>
                                                ) : (
                                                    'Actualizar Contraseña'
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-8 pt-8 border-t border-neutral-100 bg-neutral-50/50 p-6 rounded-xl border border-neutral-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-red-100 p-2 rounded-lg text-red-600">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-neutral-900">¿Olvidaste tu contraseña?</h3>
                                        </div>
                                        <p className="text-sm text-neutral-600 mb-4 pl-[3.25rem]">Te enviaremos un enlace seguro a tu correo para restablecerla.</p>
                                        <button
                                            onClick={async () => {
                                                if (sendingRecovery) return;
                                                setSendingRecovery(true);
                                                try {
                                                    await api.post('/forgot-password', { email: user?.email });
                                                    setMessage({ text: 'Email de recuperación enviado', type: 'success' });
                                                } catch (e) {
                                                    setMessage({ text: 'Error al enviar email', type: 'error' });
                                                } finally {
                                                    setSendingRecovery(false);
                                                }
                                            }}
                                            disabled={sendingRecovery}
                                            className={`ml-[3.25rem] text-[#223945] hover:text-[#1a2c35] text-sm font-bold underline underline-offset-4 decoration-2 ${sendingRecovery ? 'opacity-50 cursor-wait' : ''}`}
                                        >
                                            {sendingRecovery ? 'Enviando...' : 'Enviar email de recuperación'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'favorites' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-[#223945]">Mis Favoritos</h3>
                                        <p className="text-neutral-500 text-sm mt-1">Centros que has guardado para consultar más tarde.</p>
                                    </div>

                            {favoritos.length > 0 ? (
                                        <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300">
                                            {favoritos.map(fav => (
                                                <div key={fav.id} className="group relative bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-[#223945] transition-all p-5 pr-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                    
                                                    {/* Content */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-[#223945]/5 p-3 rounded-xl text-[#223945]">
                                                            <Heart className="w-6 h-6 fill-[#223945]" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-neutral-900 text-lg group-hover:text-[#223945] transition-colors">{fav.centro.nombre}</h4>
                                                            <p className="text-sm text-neutral-500 font-medium">{fav.centro.direccion}</p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                        <Link
                                                            href={`/centro/${fav.centro.id}`}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-lg text-sm font-bold shadow-sm hover:bg-neutral-50 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Ver más
                                                        </Link>
                                                        <Link
                                                            href={`/mapa?centro=${fav.centro.id}`}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#223945] text-white rounded-lg text-sm font-bold shadow hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
                                                        >
                                                            <MapPin className="w-4 h-4" />
                                                            Localizar
                                                        </Link>
                                                    </div>

                                                    {/* Remove Button (Heart) - Floating like CentroCard */}
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            try {
                                                                await api.delete(`/favoritos/${fav.centro.id}`);
                                                                setFavoritos(prev => prev.filter(f => f.id !== fav.id));
                                                                setMessage({ text: 'Centro eliminado de favoritos', type: 'success' });
                                                            } catch (error) {
                                                                setMessage({ text: 'Error al eliminar favorito', type: 'error' });
                                                            }
                                                        }}
                                                        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-neutral-100 hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                                                        title="Eliminar de favoritos"
                                                    >
                                                        <Heart className="w-4 h-4 fill-current" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                                            <Heart className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                                            <h4 className="text-lg font-bold text-neutral-900">No tienes favoritos</h4>
                                            <p className="text-neutral-500 text-sm mt-1">Explora el mapa para añadir centros a tu lista.</p>
                                            <a href="/mapa" className="inline-block mt-6 bg-[#223945] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                                Ir al Mapa
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border border-neutral-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">¿Eliminar foto de perfil?</h3>
                            <p className="text-sm text-neutral-500 mb-6">Esta acción no se puede deshacer. Volverás a tener tus iniciales como avatar.</p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 font-bold text-sm hover:bg-neutral-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/30 hover:-translate-y-0.5"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
