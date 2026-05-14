/**
 * Sidebar Administrativa
 * Navegación principal de la aplicación con soporte para submenús.
 */

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  BarChart3, 
  Store, 
  LogOut,
  Shirt,
  ChevronDown,
  History,
  PlusCircle
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [salesOpen, setSalesOpen] = useState(location.pathname.startsWith('/sales'));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-primary p-2 rounded-lg">
          <Shirt size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">Jerseys Admin</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
          `}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
          `}
        >
          <Package size={20} />
          <span className="font-medium">Inventario</span>
        </NavLink>

        {/* Ventas con Submenú */}
        <div className="space-y-1">
          <button
            onClick={() => setSalesOpen(!salesOpen)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
              ${location.pathname.startsWith('/sales') ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} />
              <span className="font-medium">Ventas</span>
            </div>
            <ChevronDown size={16} className={`transition-transform duration-200 ${salesOpen ? 'rotate-180' : ''}`} />
          </button>

          {salesOpen && (
            <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <NavLink
                to="/sales"
                end
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200
                  ${isActive ? 'text-primary font-bold bg-primary/5' : 'text-slate-500 hover:text-white'}
                `}
              >
                <PlusCircle size={16} />
                <span>Nueva Venta</span>
              </NavLink>
              <NavLink
                to="/sales/history"
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200
                  ${isActive ? 'text-primary font-bold bg-primary/5' : 'text-slate-500 hover:text-white'}
                `}
              >
                <History size={16} />
                <span>Historial</span>
              </NavLink>
            </div>
          )}
        </div>

        <NavLink
          to="/orders"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
          `}
        >
          <ClipboardList size={20} />
          <span className="font-medium">Encargos</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
          `}
        >
          <BarChart3 size={20} />
          <span className="font-medium">Reportes</span>
        </NavLink>

        <NavLink
          to="/stores"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
            ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
          `}
        >
          <Store size={20} />
          <span className="font-medium">Sucursales</span>
        </NavLink>
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
