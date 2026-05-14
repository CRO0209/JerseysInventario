/**
 * Formulario de Gestión de Stock
 * Solo maneja la matriz de cantidades por talla y tienda.
 */

import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import api from '../../../services/api';
import { inventoryService } from '../inventoryService';
import { toast } from 'react-hot-toast';
import { Package, Save } from 'lucide-react';

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
const KIDS_SIZES = ['18', '20', '22', '24', '26', '28'];

const StockForm = ({ product, onSubmitSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [stockMatrix, setStockMatrix] = useState({});

  const currentSizes = product.version === 'CONJUNTO NIÑO' ? KIDS_SIZES : STANDARD_SIZES;

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await api.get('/stores');
        setStores(response.data);
        // La matriz se queda vacía (todos en 0) para reponer
      } catch (error) {
        toast.error('Error al cargar sucursales');
      }
    };
    loadStores();
  }, [product]);

  const handleStockChange = (storeId, size, value) => {
    setStockMatrix(prev => ({
      ...prev,
      [`${storeId}/${size}`]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sizes_stock = [];
      Object.keys(stockMatrix).forEach(key => {
        const [store_id, size] = key.split('/');
        const quantity = parseInt(stockMatrix[key]);
        if (quantity >= 0) {
          sizes_stock.push({ store_id, size, quantity });
        }
      });

      await inventoryService.updateProduct(product.id, { sizes_stock });
      toast.success('Inventario actualizado con éxito');
      onSubmitSuccess(true);
    } catch (error) {
      toast.error('Error al actualizar inventario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
        <div className="p-3 bg-primary text-white rounded-lg">
          <Package size={24} />
        </div>
        <div>
          <h4 className="font-black text-slate-800 dark:text-white uppercase leading-tight">
            Reponer: {product.team_name} {product.shirt_year} {product.kit_type}
          </h4>
          <p className="text-xs text-slate-500 font-bold uppercase mt-1">
            Manga {product.sleeve_type === 'short' ? 'Corta' : 'Larga'} | {product.version}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-[10px] tracking-widest">Tienda / Talla</th>
                {currentSizes.map(size => (
                  <th key={size} className="px-2 py-3 text-center font-black text-primary text-[11px]">{size}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 text-xs">{store.name}</td>
                  {currentSizes.map(size => (
                    <td key={size} className="px-1 py-3 text-center">
                      <input 
                        type="number"
                        min="0"
                        className="w-12 mx-auto block text-center py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-slate-800 dark:text-white"
                        value={stockMatrix[`${store.id}/${size}`] || 0}
                        onChange={(e) => handleStockChange(store.id, size, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={() => onSubmitSuccess(false)}>Cancelar</Button>
        <Button variant="primary" type="submit" isLoading={loading} className="gap-2 px-8">
          <Save size={18} />
          Guardar Stock
        </Button>
      </div>
    </form>
  );
};

export default StockForm;
