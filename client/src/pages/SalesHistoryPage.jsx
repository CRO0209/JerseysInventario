/**
 * Página de Historial de Ventas
 * Listado detallado de transacciones realizadas.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { salesService } from '../features/sales/salesService';
import { Eye, FileText, Download, Calendar, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SalesHistoryPage = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const data = await salesService.getSalesHistory();
      setSales(data);
    } catch (error) {
      toast.error('Error al cargar el historial');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${styles[status] || styles.completed}`}>
        {status === 'completed' ? 'Completada' : 'Cancelada'}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Historial de Ventas</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Consulta y audita todas las transacciones realizadas.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="gap-2">
              <Calendar size={18} />
              Filtrar por Fecha
            </Button>
            <Button variant="secondary" className="gap-2">
              <Download size={18} />
              Exportar
            </Button>
          </div>
        </div>

        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nro. Venta</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Productos</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pago</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="7" className="px-6 py-4"><div className="h-10 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                    </tr>
                  ))
                ) : sales.length > 0 ? (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">#{sale.sale_number}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-800 dark:text-white">{new Date(sale.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500">{new Date(sale.created_at).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          {sale.sale_items?.map((item, idx) => (
                            <div key={idx} className="flex flex-col border-l-2 border-primary/20 pl-2 py-0.5">
                              <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase leading-none">
                                {item.quantity}x {item.products?.team_name} {item.products?.shirt_year} {item.products?.kit_type}
                              </p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                                {item.products?.version} | Manga {item.products?.sleeve_type === 'short' ? 'Corta' : 'Larga'} | Talla: <span className="text-primary">{item.size}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">${sale.total}</p>
                        <p className="text-[10px] text-slate-500 italic">Tasa: {sale.exchange_rate_snapshot} BS</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-500 uppercase">{sale.payment_method}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Ver Detalle">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Reimprimir Ticket">
                            <FileText size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">No hay ventas registradas aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SalesHistoryPage;
