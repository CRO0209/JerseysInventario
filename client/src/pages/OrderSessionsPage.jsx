/**
 * Página de Jornadas de Encargos
 * Lista las campañas de pedidos activas y finalizadas.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../features/orders/orderService';
import Modal from '../components/ui/Modal';
import { toast } from 'react-hot-toast';

const OrderSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({ name: '', notes: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getSessions();
      setSessions(data);
    } catch (error) {
      toast.error('Error al cargar jornadas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await orderService.createSession(newSession);
      toast.success('¡Jornada creada con éxito!');
      setIsModalOpen(false);
      setNewSession({ name: '', notes: '' });
      fetchSessions();
    } catch (error) {
      toast.error('Error al crear jornada');
    }
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const finishedSessions = sessions.filter(s => s.status === 'finished');

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Jornadas de Encargos</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gestiona tus campañas de pedidos especiales.</p>
          </div>
          <Button variant="primary" className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Nueva Jornada
          </Button>
        </div>

        {/* Jornadas Activas */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
            <Clock size={16} />
            Jornadas Activas
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map(session => (
              <div 
                key={session.id} 
                onClick={() => navigate(`/orders/${session.id}`)}
                className="group bg-white dark:bg-slate-800 rounded-3xl border-2 border-primary/10 p-6 cursor-pointer hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <ClipboardList size={80} />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <FolderOpen size={24} />
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full">Abierta</span>
                </div>

                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary transition-colors">{session.name}</h3>
                <p className="text-xs text-slate-500 mb-6 line-clamp-2">{session.notes || 'Sin descripción.'}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Calendar size={14} />
                    {new Date(session.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase">
                    Ver Pedidos <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
            {activeSessions.length === 0 && !isLoading && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <p className="text-slate-400 text-sm italic">No hay jornadas activas actualmente.</p>
              </div>
            )}
          </div>
        </section>

        {/* Jornadas Finalizadas */}
        {finishedSessions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 font-black uppercase text-xs tracking-widest">
              <CheckCircle2 size={16} />
              Historial de Jornadas
            </div>
            <Card noPadding>
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {finishedSessions.map(session => (
                  <div 
                    key={session.id} 
                    onClick={() => navigate(`/orders/${session.id}`)}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg">
                        <FolderOpen size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{session.name}</p>
                        <p className="text-[10px] text-slate-400">Cerrada el {new Date(session.finished_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}
      </div>

      {/* Modal para Nueva Jornada */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Crear Nueva Jornada de Encargos"
        size="sm"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre de la Jornada</label>
            <input 
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Ej: Jornada Final Mayo 2026"
              value={newSession.name}
              onChange={(e) => setNewSession({...newSession, name: e.target.value})}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notas u Observaciones</label>
            <textarea 
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Detalles sobre fechas de pedido, proveedor, etc."
              rows="3"
              value={newSession.notes}
              onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1" type="submit">Crear Jornada</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default OrderSessionsPage;
