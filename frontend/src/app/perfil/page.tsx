'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { User, MapPin, Heart, Lock, Camera, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function Profile() {
    const [user, setUser] = useState<UserData | null>(null);
    const [favoritos, setFavoritos] = useState<Favorito[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'favorites'>('profile');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    // Form states
    const [name, setName] = useState('');
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

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
        if (passwordData.new !== passwordData.confirm) {
            setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
            return;
        }

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
        }
    };

    const handleLocation = () => {
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
        <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-50 pt-28 pb-12 px-4 sm:px-6"> 
            <div className="max-w-5xl mx-auto">
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
                                        <img src={user.foto_perfil} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl relative z-10" />
                                    ) : (
                                        <div className="w-28 h-28 rounded-full bg-[#223945] text-white flex items-center justify-center text-4xl font-bold shadow-xl relative z-10 border-4 border-white">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                    <button className="absolute bottom-1 right-1 z-20 bg-white p-2 rounded-full shadow-lg border border-neutral-100 text-neutral-500 hover:text-[#223945] transition-colors">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <h2 className="mt-5 text-xl font-bold text-[#223945]">{user?.name}</h2>
                                <p className="text-sm text-neutral-500 font-medium">{user?.email}</p>
                            </div>

                            {/* Navigation Menu */}
                            <nav className="space-y-2">
                                <button 
                                    onClick={() => setActiveTab('profile')} 
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === 'profile' 
                                        ? 'bg-[#223945] text-white shadow-md shadow-[#223945]/20' 
                                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-[#223945]'
                                    }`}
                                >
                                    <User className="w-4 h-4" /> 
                                    <span>Perfil Personal</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('security')} 
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === 'security' 
                                        ? 'bg-[#223945] text-white shadow-md shadow-[#223945]/20' 
                                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-[#223945]'
                                    }`}
                                >
                                    <Lock className="w-4 h-4" /> 
                                    <span>Seguridad</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('favorites')} 
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === 'favorites' 
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
                                <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
                                    message.type === 'success' 
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
                                                className="bg-[#223945] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide"
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
                                            <button 
                                                onClick={handleLocation} 
                                                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline decoration-2 underline-offset-4"
                                            >
                                                {user?.ubicacion_lat ? 'Actualizar mi ubicación' : 'Activar ubicación'}
                                            </button>
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
                                            <input 
                                                type="password" 
                                                value={passwordData.current} 
                                                onChange={e => setPasswordData({...passwordData, current: e.target.value})} 
                                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">Nueva Contraseña</label>
                                                <input 
                                                    type="password" 
                                                    value={passwordData.new} 
                                                    onChange={e => setPasswordData({...passwordData, new: e.target.value})} 
                                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#223945] uppercase tracking-wider ml-1">Confirmar Nueva</label>
                                                <input 
                                                    type="password" 
                                                    value={passwordData.confirm} 
                                                    onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} 
                                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border-2 border-transparent focus:bg-white focus:border-[#223945] focus:ring-4 focus:ring-[#223945]/10 outline-none transition-all font-medium text-neutral-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button 
                                                type="submit" 
                                                className="bg-[#223945] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide"
                                            >
                                                Actualizar Contraseña
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
                                                try {
                                                    await api.post('/forgot-password', { email: user?.email });
                                                    setMessage({ text: 'Email de recuperación enviado', type: 'success' });
                                                } catch (e) {
                                                    setMessage({ text: 'Error al enviar email', type: 'error' });
                                                }
                                            }}
                                            className="ml-[3.25rem] text-[#223945] hover:text-[#1a2c35] text-sm font-bold underline underline-offset-4 decoration-2"
                                        >
                                            Enviar email de recuperación
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
                                        <div className="grid gap-4">
                                            {favoritos.map(fav => (
                                                <div key={fav.id} className="group flex items-center justify-between p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-[#223945] group-hover:text-white transition-colors">
                                                            <Heart className="w-5 h-5 fill-current" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-neutral-900 group-hover:text-[#223945] transition-colors">{fav.centro.nombre}</h4>
                                                            <p className="text-sm text-neutral-500">{fav.centro.direccion}</p>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={`/mapa?centro=${fav.centro.id}`} 
                                                        className="px-4 py-2 bg-neutral-50 text-neutral-600 rounded-lg text-sm font-bold hover:bg-[#223945] hover:text-white transition-all"
                                                    >
                                                        Ver ficha
                                                    </a>
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
        </div>
    );
}
