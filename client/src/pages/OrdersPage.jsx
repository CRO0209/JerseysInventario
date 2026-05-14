/**
 * Página de Gestión de Encargos (Dentro de una Jornada)
 * Maneja los pedidos especiales de clientes filtrados por sesión.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  ClipboardList, 
  Plus, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Truck,
  MoreVertical,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import OrderForm from '../features/orders/components/OrderForm';
import { orderService } from '../features/orders/orderService';
import { toast } from 'react-hot-toast';

const OrdersPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Obtener datos de la jornada para el encabezado
      const allSessions = await orderService.getSessions();
      const currentSession = allSessions.find(s => s.id === sessionId);
      setSession(currentSession);

      // Obtener pedidos de esta jornada
      const ordersData = await orderService.getOrders(sessionId);
      setOrders(ordersData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await orderService.updateOrderStatus(id, newStatus);
      toast.success('Estado actualizado');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleFinishSession = async () => {
    if (!window.confirm('¿Estás seguro de finalizar esta jornada? No se podrán añadir más pedidos.')) return;
    try {
      await orderService.finishSession(sessionId);
      toast.success('Jornada finalizada con éxito');
      navigate('/orders');
    } catch (error) {
      toast.error('Error al finalizar jornada');
    }
  };

  const getStatusInfo = (status) => {
    const map = {
      pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', icon: Clock },
      in_progress: { label: 'En Camino', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', icon: Truck },
      arrived: { label: 'En Tienda', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400', icon: CheckCircle2 },
      delivered: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: CheckCircle2 },
    };
    return map[status] || map.pending;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Header con navegación hacia atrás */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/orders')}
              className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-primary transition-colors shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {session?.name || 'Cargando Jornada...'}
                {session?.status === 'finished' && <Lock size={20} className="text-slate-400" />}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {orders.length} pedidos registrados en esta campaña.
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {session?.status === 'active' ? (
              <>
                <Button variant="secondary" onClick={handleFinishSession} className="gap-2 border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/20">
                  <Lock size={18} />
                  Finalizar Jornada
                </Button>
                <Button variant="primary" className="gap-2" onClick={() => setIsModalOpen(true)}>
                  <Plus size={20} />
                  Nuevo Encargo
                </Button>
              </>
            ) : (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                Jornada Finalizada
              </div>
            )}
          </div>
        </div>

        {/* Grid de Pedidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl"></div>
            ))
          ) : orders.length > 0 ? (
            orders.map(order => {
              const status = getStatusInfo(order.status);
              return (
                <div key={order.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${status.color}`}>
                      <status.icon size={12} />
                      {status.label}
                    </span>
                    <button className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{order.client_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
                    <Phone size={14} className="text-slate-400" />
                    {order.client_phone}
                  </div>

                  <div className="space-y-2 mb-6">
                    {order.order_items?.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 group-hover:border-primary/20 transition-all">
                        <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase leading-tight">
                          {item.quantity}x {item.description || item.products?.team_name}
                        </p>
                        <p className="text-[10px] text-primary font-bold mt-1">Talla: {item.size}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Calendar size={14} />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {session?.status === 'active' && (
                      <div className="flex gap-1">
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusChange(order.id, 'in_progress')}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Marcar como En Camino"
                          >
                            <Truck size={16} />
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button 
                            onClick={() => handleStatusChange(order.id, 'arrived')}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            title="Marcar como En Tienda"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        {order.status === 'arrived' && (
                          <button 
                            onClick={() => handleStatusChange(order.id, 'delivered')}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Marcar como Entregado"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={40} className="text-slate-300" />
              </div>
              <p className="text-slate-400 italic">No hay encargos en esta jornada aún.</p>
              {session?.status === 'active' && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-primary font-bold text-sm hover:underline"
                >
                  Registrar primer pedido
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal de Nuevo Encargo */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={`Nuevo Encargo - ${session?.name}`}
          size="md"
        >
          <OrderForm 
            sessionId={sessionId}
            onSubmitSuccess={(refresh) => {
              setIsModalOpen(false);
              if (refresh) fetchData();
            }} 
          />
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;
