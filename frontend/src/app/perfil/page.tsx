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
            const formData = new FormData();
            formData.append('name', name);
            formData.append('_method', 'PUT'); // Laravel method spoofing for file upload in POST/PUT
            
            // Note: For file upload to work with PUT in Laravel, sometimes allows standard POST with _method=PUT
            // But api.put might send JSON. For file upload we need FormData.
            // Let's use api.post with _method=PUT for FormData
            
            const res = await api.post('/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUser(res.data.user);
            // Update local storage if needed
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));
            
            setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
        } catch (error) {
            setMessage({ text: 'Error al actualizar perfil', type: 'error' });
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        
        setUploading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('foto_perfil', file);
            formData.append('name', name);
            formData.append('_method', 'PUT');

            const res = await api.post('/me', formData, {
                 headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUser(res.data.user);
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));
             // Trigger Navbar update event or reload
             window.location.reload(); 
        } catch (error) {
            setMessage({ text: 'Error al subir imagen', type: 'error' });
        } finally {
            setUploading(false);
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
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6"> 
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="md:flex">
                        {/* Sidebar */}
                        <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-100">
                            <div className="text-center mb-6">
                                <div className="relative inline-block">
                                    {user?.foto_perfil ? (
                                        <img src={user.foto_perfil} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-3xl font-bold mx-auto">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                    <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50">
                                        <Camera className="w-4 h-4 text-gray-600" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                                    </label>
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.name}</h2>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>

                            <nav className="space-y-2">
                                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <User className="w-4 h-4" /> Perfil
                                </button>
                                <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <Lock className="w-4 h-4" /> Seguridad
                                </button>
                                <button onClick={() => setActiveTab('favorites')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'favorites' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <Heart className="w-4 h-4" /> Favoritos
                                </button>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-8">
                                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                                </button>
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="md:w-2/3 p-6">
                            {message && (
                                <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Información Personal</h3>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input type="email" value={user?.email} disabled className="input bg-gray-50 text-gray-500" />
                                        </div>
                                        <div className="pt-2">
                                            <button type="submit" className="btn-primary">Guardar Cambios</button>
                                        </div>
                                    </form>

                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Ubicación</h3>
                                        <p className="text-sm text-gray-500 mb-4">Activa tu ubicación para ver centros cercanos.</p>
                                        <button onClick={handleLocation} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            <MapPin className="w-4 h-4" /> {user?.ubicacion_lat ? 'Actualizar Ubicación' : 'Activar Ubicación'}
                                        </button>
                                        {user?.ubicacion_lat && <p className="mt-2 text-xs text-green-600">Ubicación activa</p>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Cambiar Contraseña</h3>
                                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                                            <input type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} className="input" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                            <input type="password" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} className="input" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                                            <input type="password" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} className="input" />
                                        </div>
                                        <div className="pt-2">
                                            <button type="submit" className="btn-primary">Actualizar Contraseña</button>
                                        </div>
                                    </form>
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Recuperar Contraseña</h3>
                                    <p className="text-sm text-gray-600">Si has olvidado tu contraseña, puedes solicitar un enlace de restablecimiento.</p>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                await api.post('/forgot-password', { email: user?.email });
                                                setMessage({ text: 'Email de recuperación enviado', type: 'success' });
                                            } catch (e) {
                                                setMessage({ text: 'Error al enviar email', type: 'error' });
                                            }
                                        }}
                                        className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                        Enviar email de recuperación
                                    </button>
                                </div>
                                </div>
                            )}

                            {activeTab === 'favorites' && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Mis Centros Favoritos</h3>
                                    {favoritos.length > 0 ? (
                                        <div className="grid gap-4">
                                            {favoritos.map(fav => (
                                                <div key={fav.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{fav.centro.nombre}</h4>
                                                        <p className="text-sm text-gray-500">{fav.centro.direccion}</p>
                                                    </div>
                                                    <a href={`/mapa?centro=${fav.centro.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Ver en mapa</a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Heart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            <p>No tienes favoritos todavía</p>
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
