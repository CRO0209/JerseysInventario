/**
 * Formulario de Producto (Versión Fútbol)
 * Maneja tallas dinámicas, stock por talla/tienda y campos específicos de jerseys.
 */

import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { ImageIcon, X, Shirt, Hash } from 'lucide-react';
import { inventoryService } from '../inventoryService';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

const SHIRT_VERSIONS = ['PLAYER', 'FAN', 'RETRO', 'CONJUNTO NIÑO', 'EDICION ESPECIAL'];
const STANDARD_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
const KIDS_SIZES = ['18', '20', '22', '24', '26', '28'];

const ProductForm = ({ onSubmitSuccess, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]); // Cargaremos las tiendas reales
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    brand_id: '',
    team_name: '',
    shirt_year: '',
    kit_type: 'Local',
    sleeve_type: 'short',
    version: 'FAN',
    purchase_price: '',
    image_url: ''
  });

  // Estado para el stock por talla y tienda: { 'id_tienda-talla': cantidad }
  const [stockMatrix, setStockMatrix] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catData, storeData] = await Promise.all([
          inventoryService.getCategories().catch(() => []),
          api.get('/stores').then(res => res.data).catch(() => [
            { id: '1', name: 'Jerseys Caracas' },
            { id: '2', name: 'Jerseys Lecheria' }
          ])
        ]);
        
        // Si la API devolvió un array vacío pero necesitamos las tiendas para probar:
        const finalStores = storeData.length > 0 ? storeData : [
          { id: '1', name: 'Jerseys Caracas' },
          { id: '2', name: 'Jerseys Lecheria' }
        ];

        setCategories(catData);
        setStores(finalStores);

        if (initialData) {
          setFormData({ ...initialData, image_url: initialData.product_images?.[0]?.url || '' });
          if (initialData.product_images?.[0]?.url) setImagePreview(initialData.product_images[0].url);
          
          // Llenar matriz de stock si es edición
          const matrix = {};
          initialData.product_stock?.forEach(s => {
            matrix[`${s.store_id}/${s.size}`] = s.quantity;
          });
          setStockMatrix(matrix);
        }
      } catch (error) {
        toast.error('Error al cargar datos');
      }
    };
    loadData();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (storeId, size, value) => {
    setStockMatrix(prev => ({
      ...prev,
      [`${storeId}/${size}`]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image_url;
    const uploadFormData = new FormData();
    uploadFormData.append('image', imageFile);
    const response = await api.post('/uploads/image', uploadFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalImageUrl = await uploadImage();
      
      // Convertir matriz de stock a array para el backend
      const sizes_stock = [];
      Object.keys(stockMatrix).forEach(key => {
        const [store_id, size] = key.split('/');
        const quantity = parseInt(stockMatrix[key]);
        if (quantity > 0) {
          sizes_stock.push({ store_id, size, quantity });
        }
      });

      const payload = {
        ...formData,
        name: formData.team_name, // Usar el equipo como nombre
        image_url: finalImageUrl,
        purchase_price: parseFloat(formData.purchase_price),
        sizes_stock
      };

      if (initialData) {
        await inventoryService.updateProduct(initialData.id, payload);
        toast.success('Producto actualizado');
      } else {
        await inventoryService.createProduct(payload);
        toast.success('Producto creado con éxito');
      }
      
      onSubmitSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const currentSizes = formData.version === 'CONJUNTO NIÑO' ? KIDS_SIZES : STANDARD_SIZES;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Header: Imagen y Datos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Imagen */}
        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/30">
          {imagePreview ? (
            <div className="relative w-full aspect-square">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-md" />
              <button 
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); setFormData(p => ({...p, image_url: ''})); }}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
              <label className="cursor-pointer text-primary font-semibold hover:underline block text-sm">
                Subir Foto
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          )}
        </div>

        {/* Datos Básicos */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Equipo</label>
              <input 
                name="team_name"
                value={formData.team_name}
                onChange={handleChange}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary font-bold"
                placeholder="Ej: Real Madrid"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Año / Temporada</label>
              <input 
                name="shirt_year"
                value={formData.shirt_year}
                onChange={handleChange}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary"
                placeholder="Ej: 2024-25"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detalles Técnicos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Versión</label>
          <select 
            name="version"
            value={formData.version}
            onChange={handleChange}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary"
          >
            {SHIRT_VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Equipación</label>
          <select 
            name="kit_type"
            value={formData.kit_type}
            onChange={handleChange}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary"
          >
            <option value="Local">Local</option>
            <option value="Visitante">Visitante</option>
            <option value="Tercera">Tercera</option>
            <option value="Entrenamiento">Entrenamiento</option>
            <option value="Especial">Especial</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Manga</label>
          <select 
            name="sleeve_type"
            value={formData.sleeve_type}
            onChange={handleChange}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary"
          >
            <option value="short">Corta</option>
            <option value="long">Larga</option>
          </select>
        </div>
        <Input 
          label="Costo Compra ($)" 
          name="purchase_price" 
          type="number" 
          step="0.01" 
          value={formData.purchase_price} 
          onChange={handleChange} 
          required 
        />
      </div>

      {/* 3. Matriz de Stock por Talla y Tienda (Solo al crear nuevo) */}
      {!initialData && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Control de Stock Inicial</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="px-4 py-3 text-left bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase">Tienda / Talla</th>
                  {currentSizes.map(size => (
                    <th key={size} className="px-2 py-3 text-center font-black text-primary text-[11px]">{size}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">{store.name}</td>
                    {currentSizes.map(size => (
                      <td key={size} className="px-1 py-3">
                        <input 
                          type="number"
                          min="0"
                          className="w-12 mx-auto block text-center py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-bold"
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
      )}

      <div className="flex justify-end gap-3">
        <Button variant="secondary" type="button" onClick={() => onSubmitSuccess(false)}>Cancelar</Button>
        <Button variant="primary" type="submit" isLoading={loading} className="px-8">
          {initialData ? 'Actualizar Jersey' : 'Registrar Jersey'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
