/**
 * Dashboard Administrativo
 * Resumen visual de ventas, stock y KPIs.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/ui/Card';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import api from '../services/api';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/reports/dashboard-summary');
        setSummary(response.data);
      } catch (error) {
        console.error('Error al cargar dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const stats = [
    { 
      title: 'Ventas de Hoy', 
      value: `$${summary?.revenueToday.toFixed(2) || '0.00'}`, 
      sub: `${summary?.salesCountToday || 0} transacciones`,
      icon: DollarSign, 
      color: 'bg-emerald-500' 
    },
    { 
      title: 'Productos Totales', 
      value: summary?.totalProducts || 0, 
      sub: 'En catálogo activo',
      icon: Package, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Stock Crítico', 
      value: summary?.lowStock?.length || 0, 
      sub: 'Productos por agotarse',
      icon: AlertTriangle, 
      color: 'bg-amber-500' 
    },
    { 
      title: 'Rendimiento', 
      value: '+12.5%', 
      sub: 'Vs. semana pasada',
      icon: TrendingUp, 
      color: 'bg-indigo-500' 
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        {/* Bienvenida */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Bienvenido de nuevo 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Aquí tienes lo que está pasando en tu tienda hoy.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start justify-between group hover:border-primary/50 transition-all duration-300">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-xs text-slate-400">{stat.sub}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gráfica de Ventas */}
          <Card title="Ventas Semanales" subtitle="Ingresos en Dólares (USD)" className="lg:col-span-2">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.chartData || []}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Stock Bajo */}
          <Card title="Alerta de Stock" subtitle="Productos por agotarse">
            <div className="space-y-4 mt-4">
              {summary?.lowStock?.length > 0 ? (
                summary.lowStock.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{item.products?.team_name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Talla {item.size}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-red-500">{item.quantity} uni</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 italic">No hay alertas de stock</div>
              )}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-all">
              Ver Inventario Completo
            </button>
          </Card>

        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
