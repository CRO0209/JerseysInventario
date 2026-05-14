/**
 * Página de Gestión de Sucursales y Transferencias
 * Rediseño del modal de transferencias para mayor practicidad.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Store, ArrowRightLeft, History, Package, MapPin, Search, ArrowRight, Minus, Plus, X, CheckCircle2 } from 'lucide-react';
import { storeService } from '../features/stores/storeService';
import { inventoryService } from '../features/inventory/inventoryService';
import { toast } from 'react-hot-toast';
import Modal from '../components/ui/Modal';

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para el modal de transferencia
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [transferData, setTransferData] = useState({
    product_id: '',
    from_store_id: '',
    to_store_id: '',
    size: '',
    quantity: 1,
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [storesData, transfersData, productsData] = await Promise.all([
        storeService.getStores(),
        storeService.getTransfers(),
        inventoryService.getProducts()
      ]);
      setStores(storesData);
      setTransfers(transfersData);
      setProducts(productsData);
      
      if (storesData.length >= 2) {
        setTransferData(prev => ({
          ...prev,
          from_store_id: storesData[0].id,
          to_store_id: storesData[1].id
        }));
      }
    } catch (error) {
      toast.error('Error al cargar datos de sucursales');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setTransferData(prev => ({ ...prev, product_id: product.id, size: '', quantity: 1 }));
    setSearchTerm('');
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferData.product_id || !transferData.size) {
      return toast.error('Selecciona un producto y una talla');
    }

    try {
      await storeService.createTransfer(transferData);
      toast.success('¡Transferencia completada!');
      setIsModalOpen(false);
      setSelectedProduct(null);
      fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al procesar transferencia');
    }
  };

  const filteredProducts = products.filter(p => 
    p.team_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  // Obtener tallas con stock en la tienda de origen seleccionada
  const availableSizes = selectedProduct?.product_stock?.filter(
    s => s.store_id === transferData.from_store_id && s.quantity > 0
  ) || [];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Sucursales y Transferencias</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Controla el stock entre Caracas y Lechería.</p>
          </div>
          <Button variant="primary" className="gap-2" onClick={() => setIsModalOpen(true)}>
            <ArrowRightLeft size={20} />
            Mover Mercancía
          </Button>
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map(store => (
            <Card key={store.id} noPadding className="overflow-hidden group">
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Store size={24} />
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full border border-emerald-500/30">Activa</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{store.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <MapPin size={14} /> {store.location || 'Venezuela'}
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Jerseys</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{store.total_jerseys || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Valor Inventario</p>
                  <p className="text-2xl font-black text-primary">${(store.inventory_value || 0).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Transfer History */}
        <Card title="Historial de Movimientos" subtitle="Transferencias recientes entre tiendas">
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="pb-4 text-left font-bold uppercase text-[10px] tracking-widest">Producto</th>
                  <th className="pb-4 text-center font-bold uppercase text-[10px] tracking-widest">Origen</th>
                  <th className="pb-4 text-center font-bold uppercase text-[10px] tracking-widest">Destino</th>
                  <th className="pb-4 text-center font-bold uppercase text-[10px] tracking-widest">Talla</th>
                  <th className="pb-4 text-center font-bold uppercase text-[10px] tracking-widest">Cant.</th>
                  <th className="pb-4 text-left font-bold uppercase text-[10px] tracking-widest pl-4">Nota</th>
                  <th className="pb-4 text-right font-bold uppercase text-[10px] tracking-widest">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {transfers.map(transfer => (
                  <tr key={transfer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="py-4">
                      <p className="text-xs font-bold text-slate-800 dark:text-white uppercase leading-tight">
                        {transfer.products?.team_name} {transfer.products?.shirt_year} {transfer.products?.kit_type}
                      </p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                        Manga {transfer.products?.sleeve_type === 'short' ? 'Corta' : 'Larga'} | {transfer.products?.version}
                      </p>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                        {transfer.from?.name}
                      </span>
                    </td>
                    <td className="py-4 text-center text-primary">
                      <div className="flex items-center justify-center gap-2">
                        <ArrowRight size={14} className="opacity-30" />
                        <span className="px-2 py-1 bg-primary/5 rounded text-[10px] font-bold text-primary uppercase">
                          {transfer.to?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-black">{transfer.size}</td>
                    <td className="py-4 text-center">
                       <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg font-black text-slate-800 dark:text-white">
                        {transfer.quantity}
                       </span>
                    </td>
                    <td className="py-4 pl-4">
                      <p className="text-[10px] text-slate-400 font-medium italic max-w-[150px] truncate" title={transfer.notes}>
                        {transfer.notes || '-'}
                      </p>
                    </td>
                    <td className="py-4 text-right text-slate-400 text-[10px] font-bold">
                      {new Date(transfer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal Rediseñado para Transferencias */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} 
          title="Mover Mercancía entre Tiendas"
          size="md"
        >
          <div className="space-y-6">
            {/* 1. Selección de Tiendas */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Origen</p>
                <select 
                  className="bg-transparent font-bold text-slate-800 dark:text-white outline-none w-full"
                  value={transferData.from_store_id}
                  onChange={(e) => setTransferData({...transferData, from_store_id: e.target.value, size: ''})}
                >
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <button 
                type="button"
                onClick={() => setTransferData(prev => ({
                  ...prev, 
                  from_store_id: prev.to_store_id, 
                  to_store_id: prev.from_store_id,
                  size: '' // Reset talla para evitar errores de stock
                }))}
                className="px-4 text-primary hover:scale-110 active:rotate-180 transition-all duration-300"
                title="Intercambiar tiendas"
              >
                <ArrowRightLeft size={22} />
              </button>

              <div className="flex-1 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Destino</p>
                <select 
                  className="bg-transparent font-bold text-slate-800 dark:text-white outline-none w-full text-right"
                  value={transferData.to_store_id}
                  onChange={(e) => setTransferData({...transferData, to_store_id: e.target.value})}
                >
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* 2. Buscador de Producto */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Producto a Mover</label>
              
              {!selectedProduct ? (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Buscar jersey (ej: Real Madrid)..."
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  
                  {searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                      {filteredProducts.map(p => (
                        <div 
                          key={p.id} 
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
                          onClick={() => handleSelectProduct(p)}
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden">
                            <img src={p.product_images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-tight">{p.team_name} {p.shirt_year} {p.kit_type}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{p.version} | Manga {p.sleeve_type === 'short' ? 'Corta' : 'Larga'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-primary/10">
                      <img src={selectedProduct.product_images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-tight">
                        {selectedProduct.team_name} {selectedProduct.shirt_year} {selectedProduct.kit_type}
                      </p>
                      <p className="text-[10px] text-primary font-bold uppercase mt-0.5">
                        {selectedProduct.version} | Manga {selectedProduct.sleeve_type === 'short' ? 'Corta' : 'Larga'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* 3. Selección de Talla y Cantidad */}
            {selectedProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Seleccionar Talla</label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSizes.length > 0 ? (
                      availableSizes.map(s => (
                        <button
                          key={s.size}
                          onClick={() => setTransferData({...transferData, size: s.size, quantity: 1})}
                          className={`py-2 text-xs font-black rounded-lg border transition-all ${
                            transferData.size === s.size 
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                          }`}
                        >
                          {s.size}
                          <span className="block text-[8px] opacity-60">({s.quantity} disp.)</span>
                        </button>
                      ))
                    ) : (
                      <p className="col-span-3 text-[10px] text-rose-500 font-bold italic py-2">Sin stock en origen</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Cantidad a Mover</label>
                  <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => setTransferData(prev => ({...prev, quantity: Math.max(1, prev.quantity - 1)}))}
                      className="p-3 text-slate-500 hover:text-primary transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-xl font-black text-slate-800 dark:text-white">{transferData.quantity}</span>
                    <button 
                      onClick={() => {
                        const max = availableSizes.find(s => s.size === transferData.size)?.quantity || 1;
                        setTransferData(prev => ({...prev, quantity: Math.min(max, prev.quantity + 1)}));
                      }}
                      className="p-3 text-slate-500 hover:text-primary transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Motivo del Movimiento (Opcional)</label>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
                placeholder="Ej: Reposición de stock Lechería..."
                rows="2"
                value={transferData.notes}
                onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
              />
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => { setIsModalOpen(false); setSelectedProduct(null); }}>
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                className="gap-2 px-8" 
                onClick={handleTransferSubmit}
                disabled={!transferData.size || transferData.quantity <= 0}
              >
                <CheckCircle2 size={18} />
                Confirmar Envío
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default StoresPage;
