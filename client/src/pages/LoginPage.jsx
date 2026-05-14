/**
 * Página de Login
 * Interfaz profesional para autenticación.
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { Shirt, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, isAuthenticated, error } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/inventory" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Guardar en Redux y localStorage
      dispatch(loginSuccess(response.data));
      localStorage.setItem('token', response.data.token);
      
      toast.success('¡Bienvenido de nuevo!');
      navigate('/inventory');
    } catch (error) {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      dispatch(loginFailure(message));
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 mb-4">
            <Shirt size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Jerseys Admin</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Gestión de Inventario y Ventas</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="admin@jerseys.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-shake">
                ⚠️ {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3"
              isLoading={isLoading}
            >
              Iniciar Sesión
            </Button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase tracking-widest">o</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/5"
              onClick={() => {
                dispatch(loginSuccess({
                  user: { full_name: 'Desarrollador', role: 'admin', stores: { name: 'Jerseys Caracas' } },
                  token: 'dev-token'
                }));
                toast.success('Acceso de desarrollador concedido');
                navigate('/inventory');
              }}
            >
              Entrar como Invitado (Modo Dev)
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          ¿No tienes acceso? Contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
