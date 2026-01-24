'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/register', { name, email, password });
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/';
        } catch (err: any) {
             setError(err.response?.data?.message || 'Error al registrarse');
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            <div className="w-full max-w-md">
                <div className="card p-8 shadow-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                            <UserPlus className="w-8 h-8 text-secondary-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                            Únete a EduFinder CYL
                        </h2>
                        <p className="text-neutral-600">
                            Crea tu cuenta para guardar favoritos
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                                <User className="w-4 h-4 text-primary-600" />
                                Nombre completo
                            </label>
                            <input 
                                id="name"
                                type="text" 
                                required
                                placeholder="Tu nombre"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                                <Mail className="w-4 h-4 text-primary-600" />
                                Correo electrónico
                            </label>
                            <input 
                                id="email"
                                type="email" 
                                required
                                placeholder="tu@email.com"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                                <Lock className="w-4 h-4 text-primary-600" />
                                Contraseña
                            </label>
                            <input 
                                id="password"
                                type="password" 
                                required
                                placeholder="Mínimo 8 caracteres"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary w-full"
                        >
                            Crear Cuenta
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-neutral-600">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
