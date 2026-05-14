/**
 * Página de Reportes Detallados
 * Análisis profundo de ventas e inventario.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/ui/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Calendar,
  Download
} from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/reports/dashboard-summary');
        setData(response.data);
      } catch (error) {
        console.error('Error al cargar reportes');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <AdminLayout><div className="p-8 text-center">Cargando reportes detallados...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Análisis de Negocio</h1>
            <p className="text-slate-500 dark:text-slate-400">Consulta el rendimiento de tus ventas e inventario.</p>
          </div>
          <Button variant="secondary" className="gap-2">
            <Download size={18} />
            Exportar PDF
          </Button>
        </div>

        {/* Resumen de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ventas Totales</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">${data?.revenueToday || 0}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-emerald-500 text-xs font-bold">
              <TrendingUp size={14} />
              <span>+12.5% vs ayer</span>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pedidos Hoy</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{data?.salesCountToday || 0}</h3>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <ShoppingCart size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-emerald-500 text-xs font-bold">
              <TrendingUp size={14} />
              <span>Normal</span>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Productos Activos</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{data?.totalProducts || 0}</h3>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <Package size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-slate-400 text-xs font-medium italic">
              Actualizado hace 1 min
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-rose-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tasa Promedio</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">40.50 BS</h3>
              </div>
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                <Calendar size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-rose-500 text-xs font-bold">
              <TrendingDown size={14} />
              <span>Estable</span>
            </div>
          </Card>
        </div>

        {/* Gráficas Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Tendencia de Ingresos (7 días)">
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Productos más vendidos (Categorías)">
            <div className="h-80 w-full pt-4 flex flex-col items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Nacionales', value: 400 },
                      { name: 'Internacionales', value: 300 },
                      { name: 'Retro', value: 300 },
                      { name: 'Niños', value: 200 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {['Nac', 'Int', 'Ret', 'Niños'].map((l, i) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                    <span className="text-xs font-medium text-slate-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Tabla de Productos Críticos */}
        <Card title="Alertas de Inventario (Stock Crítico)">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Jersey</th>
                  <th className="px-6 py-4">Talla</th>
                  <th className="px-6 py-4">Cantidad</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {data?.lowStock?.map((item, i) => (
                  <tr key={i} className="text-sm">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                      {item.products?.team_name} {item.products?.shirt_year}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-bold text-primary">{item.size}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-rose-500 font-bold">{item.quantity} unidades</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary text-xs font-bold hover:underline">Reponer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
