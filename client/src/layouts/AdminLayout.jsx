/**
 * Layout Administrativo
 * Estructura estándar para las páginas protegidas.
 */

import React from 'react';
import Sidebar from '../components/common/Sidebar';
import { useSelector } from 'react-redux';
import { Moon, Sun, User } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [isDark, setIsDark] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Barra Lateral */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header Superior */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10">
          {user?.role !== 'admin' ? (
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Sucursal: <span className="text-slate-800 dark:text-white font-semibold">{user?.stores?.name || 'Cargando...'}</span>
            </h2>
          ) : (
            <div /> // Espacio vacío para admin
          )}

          <div className="flex items-center gap-6">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 border-l pl-6 border-slate-200 dark:border-slate-700">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
