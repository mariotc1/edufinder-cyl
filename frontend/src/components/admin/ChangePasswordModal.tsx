'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Key, X, Check, ShieldCheck } from 'lucide-react';
import api from '@/lib/axios';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  userName: string;
}

export default function ChangePasswordModal({ isOpen, onClose, userId, userName }: ChangePasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/admin/users/${userId}/reset-password`, {
        password,
        password_confirmation: confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 relative"
      >
        {/* Header Gradient */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400"></div>

        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="p-8">
            <div className="flex flex-col items-center text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${success ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
                    {success ? <Check className="w-8 h-8" /> : <Key className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-black text-[#223945]">
                    {success ? '¡Contraseña Actualizada!' : 'Cambiar Contraseña'}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                    {success 
                        ? `La contraseña para ${userName} se ha modificado correctamente.` 
                        : <span>Establece una nueva contraseña para el usuario <span className="font-bold text-[#223945]">{userName}</span>.</span>
                    }
                </p>
            </div>

            {!success ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nueva Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium text-[#223945]"
                                placeholder="Mínimo 8 caracteres"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirmar Contraseña</label>
                        <div className="relative group">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all font-medium text-[#223945]"
                                placeholder="Repite la contraseña"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#223945] to-[#1a2c36] hover:from-[#1a2c36] hover:to-black shadow-lg shadow-slate-200 hover:shadow-xl hover:shadow-slate-300 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <Key className="w-4 h-4" />
                                    Actualizar Contraseña
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="py-4">
                     <div className="w-full bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col items-center gap-2 animate-in zoom-in-95 duration-300">
                        <p className="text-sm font-bold text-green-700">Contraseña cambiada con éxito</p>
                        <p className="text-xs text-green-600">Cerrando ventana...</p>
                     </div>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}
