/**
 * Página de Inventario
 * Gestión de productos y stock por separado.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProductForm from '../features/inventory/components/ProductForm';
import StockForm from '../features/inventory/components/StockForm';
import { Plus, Search, Filter, Edit2, Trash2, Shirt, ChevronDown, ChevronUp, MapPin, Package } from 'lucide-react';
import { inventoryService } from '../features/inventory/inventoryService';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [productsData, storesData] = await Promise.all([
        inventoryService.getProducts(),
        api.get('/stores').then(res => res.data)
      ]);
      setProducts(productsData);
      setStores(storesData);
    } catch (error) {
      toast.error('Error al cargar el inventario');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenProductModal = (product = null) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleOpenStockModal = (product) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const handleCloseModals = (refresh = false) => {
    setIsProductModalOpen(false);
    setIsStockModalOpen(false);
    setSelectedProduct(null);
    if (refresh === true) fetchInitialData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await inventoryService.deleteProduct(id);
        toast.success('Producto eliminado');
        fetchInitialData();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    return p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           p.team_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Inventario de Productos</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gestiona el stock y detalles de tus productos.</p>
          </div>
          <Button variant="primary" className="gap-2" onClick={() => handleOpenProductModal()}>
            <Plus size={20} />
            Nuevo Producto
          </Button>
        </div>

        <Card className="p-4" noPadding>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-1">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar por equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button variant="secondary" className="gap-2">
              <Filter size={18} />
              Más Filtros
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="w-10"></th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Producto</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Manga</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Precio</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Global</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-8"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                    </tr>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const totalStock = product.product_stock?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
                    const isExpanded = expandedRows[product.id];

                    return (
                      <React.Fragment key={product.id}>
                        <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`} onClick={() => toggleRow(product.id)}>
                          <td className="pl-4">
                            {isExpanded ? <ChevronUp size={18} className="text-primary" /> : <ChevronDown size={18} className="text-slate-400" />}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm">
                                {product.product_images?.[0] ? (
                                  <img src={product.product_images[0].url} alt={product.name} className="object-cover w-full h-full" />
                                ) : (
                                  <Shirt className="text-slate-400" size={24} />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-tight">
                                  {product.team_name} {product.shirt_year} {product.kit_type}
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                                  Manga {product.sleeve_type === 'short' ? 'Corta' : 'Larga'} | {product.version}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-700">
                              {product.sleeve_type === 'long' ? 'Larga' : 'Corta'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-black text-slate-800 dark:text-white">
                            ${product.purchase_price}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                              <span className={`text-sm font-black ${totalStock <= 5 ? 'text-rose-500' : 'text-emerald-500'}`}>{totalStock} UNID.</span>
                              <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full ${totalStock <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((totalStock / 25) * 100, 100)}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleOpenStockModal(product); }} title="Gestionar Stock" className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"><Package size={18} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleOpenProductModal(product); }} title="Editar Producto" className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"><Edit2 size={18} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} title="Eliminar" className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                        
                        {isExpanded && (
                          <tr className="bg-slate-50/30 dark:bg-slate-900/20">
                            <td colSpan="6" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {stores.map(store => {
                                  const storeStock = (product.product_stock?.filter(s => s.store_id === store.id) || [])
                                    .sort((a, b) => {
                                      const order = product.version === 'CONJUNTO NIÑO' 
                                        ? ['18', '20', '22', '24', '26', '28']
                                        : ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
                                      return order.indexOf(a.size) - order.indexOf(b.size);
                                    });
                                  return (
                                    <div key={store.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                          <MapPin size={14} className="text-primary" />
                                          <span className="text-xs font-black uppercase tracking-tight">{store.name}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">{storeStock.reduce((acc, s) => acc + s.quantity, 0)} TOTAL</span>
                                      </div>
                                      <div className="p-3">
                                        {storeStock.length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                            {storeStock.map(s => (
                                              <div key={s.size} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg">
                                                <span className="text-[10px] font-black text-primary uppercase">Talla {s.size}:</span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.quantity}</span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-slate-400 italic text-center py-2">Sin stock en esta sucursal</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">No hay productos que coincidan...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal de Producto (Crear/Editar Básico) */}
        <Modal 
          isOpen={isProductModalOpen} 
          onClose={() => handleCloseModals()} 
          title={selectedProduct ? 'Editar Jersey' : 'Agregar Nuevo Jersey'}
          size="md"
        >
          <ProductForm initialData={selectedProduct} onSubmitSuccess={(refresh) => handleCloseModals(refresh)} />
        </Modal>

        {/* Modal de Stock (Gestionar Cantidades) */}
        <Modal 
          isOpen={isStockModalOpen} 
          onClose={() => handleCloseModals()} 
          title="Gestionar Stock"
          size="md"
        >
          {selectedProduct && <StockForm product={selectedProduct} onSubmitSuccess={(refresh) => handleCloseModals(refresh)} />}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default InventoryPage;
