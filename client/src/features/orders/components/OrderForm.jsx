/**
 * Formulario de Encargo (Pedido Especial)
 * Permite registrar pedidos de clientes.
 */

import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { orderService } from '../orderService';
import { toast } from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const OrderForm = ({ onSubmitSuccess, sessionId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    estimated_date: '',
    notes: '',
    total: ''
  });

  // Lista de items en el encargo
  const [items, setItems] = useState([
    { description: '', size: '', quantity: 1, unit_price: '' }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', size: '', quantity: 1, unit_price: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        session_id: sessionId,
        total: parseFloat(formData.total) || 0,
        items: items.map(item => ({
          ...item,
          unit_price: parseFloat(item.unit_price) || 0
        }))
      };

      await orderService.createOrder(payload);
      toast.success('¡Encargo registrado con éxito!');
      onSubmitSuccess(true);
    } catch (error) {
      toast.error('Error al registrar el encargo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos del Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Nombre del Cliente" 
          name="client_name" 
          value={formData.client_name} 
          onChange={handleChange} 
          required 
          placeholder="Ej: Juan Pérez"
        />
        <Input 
          label="Teléfono" 
          name="client_phone" 
          value={formData.client_phone} 
          onChange={handleChange} 
          required 
          placeholder="Ej: 0412-1234567"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Fecha Estimada de Entrega" 
          name="estimated_date" 
          type="date"
          value={formData.estimated_date} 
          onChange={handleChange} 
          required 
        />
        <Input 
          label="Monto Total Estimado ($)" 
          name="total" 
          type="number"
          value={formData.total} 
          onChange={handleChange} 
          required 
        />
      </div>

      {/* Listado de Camisas Pedidas */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Detalle del Pedido</h4>
          <button 
            type="button" 
            onClick={addItem}
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <Plus size={14} /> Añadir Jersey
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 items-end">
            <div className="col-span-6">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Descripción (Equipo, Año, Versión)</label>
              <input 
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                placeholder="Ej: Real Madrid 2024 Home Player"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Talla</label>
              <input 
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center"
                value={item.size}
                onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                placeholder="XL"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Cant.</label>
              <input 
                type="number"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                required
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button 
                type="button"
                onClick={() => removeItem(index)}
                className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notas adicionales</label>
        <textarea 
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[80px]"
          placeholder="Ej: Dejó el 50% de abono..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <Button variant="secondary" type="button" onClick={() => onSubmitSuccess(false)}>Cancelar</Button>
        <Button variant="primary" type="submit" isLoading={loading} className="px-10">Guardar Encargo</Button>
      </div>
    </form>
  );
};

export default OrderForm;
