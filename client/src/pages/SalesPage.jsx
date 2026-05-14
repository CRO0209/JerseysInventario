/**
 * Página de Ventas (Punto de Venta - POS)
 * Permite buscar productos, seleccionar sucursal y registrar ventas.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, ShoppingCart, Trash2, Plus, Minus, DollarSign, Wallet, Banknote, Store } from 'lucide-react';
import { inventoryService } from '../features/inventory/inventoryService';
import { salesService } from '../features/sales/salesService';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [productsData, storesData] = await Promise.all([
          inventoryService.getProducts(),
          api.get('/stores').then(res => res.data)
        ]);
        setProducts(productsData);
        setStores(storesData);
        if (storesData.length > 0) setSelectedStoreId(storesData[0].id);
      } catch (error) {
        toast.error('Error al cargar datos iniciales');
      }
    };
    loadInitial();
  }, []);

  const addToCart = (product, size) => {
    const existing = cart.find(item => item.product_id === product.id && item.size === size);
    
    // Filtrar stock de la tienda seleccionada
    const storeStock = product.product_stock?.find(s => s.size === size && s.store_id === selectedStoreId)?.quantity || 0;
    const currentInCart = existing ? existing.quantity : 0;

    if (currentInCart >= storeStock) {
      toast.error(`No hay más stock en esta sucursal para la talla ${size}`);
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        (item.product_id === product.id && item.size === size) 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: `${product.team_name} ${product.shirt_year} ${product.kit_type} Manga ${product.sleeve_type === 'short' ? 'Corta' : 'Larga'} ${product.version}`,
        version: product.version,
        size: size,
        unit_price: 0,
        quantity: 1,
        image: product.product_images?.[0]?.url,
        store_id: selectedStoreId
      }]);
    }
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePrice = (index, newPrice) => {
    const newCart = [...cart];
    newCart[index].unit_price = parseFloat(newPrice) || 0;
    setCart(newCart);
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    const item = newCart[index];
    const product = products.find(p => p.id === item.product_id);
    const storeStock = product.product_stock?.find(s => s.size === item.size && s.store_id === selectedStoreId)?.quantity || 0;
    
    const newQty = item.quantity + delta;
    if (newQty > storeStock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }
    
    newCart[index].quantity = Math.max(1, newQty);
    setCart(newCart);
  };

  const totalUSD = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  const totalBS = totalUSD * (parseFloat(exchangeRate) || 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('El carrito está vacío');
    if (!selectedStoreId) return toast.error('Debes seleccionar una sucursal');
    setIsLoading(true);

    try {
      await salesService.createSale({
        items: cart,
        payment_method: paymentMethod,
        total_usd: totalUSD,
        exchange_rate: exchangeRate,
        store_id: selectedStoreId,
        notes: ''
      });
      toast.success('¡Venta registrada con éxito!');
      setCart([]);
      const productsData = await inventoryService.getProducts();
      setProducts(productsData);
    } catch (error) {
      toast.error('Error al procesar la venta');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Nueva Venta</h1>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Selector de Sucursal */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <Store size={16} className="text-primary" />
                <select 
                  value={selectedStoreId}
                  onChange={(e) => {
                    setSelectedStoreId(e.target.value);
                    setCart([]); // Limpiar carrito al cambiar de tienda para evitar errores de stock
                  }}
                  className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase">Tasa:</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-16 text-sm font-bold text-primary bg-transparent outline-none text-center"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Card noPadding>
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="Buscar equipo o camisa..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map(product => {
                // Solo mostrar tallas que tengan stock en la tienda seleccionada
                const availableStock = product.product_stock?.filter(s => s.store_id === selectedStoreId && s.quantity > 0) || [];
                
                return (
                  <div key={product.id} className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-md transition-all">
                    <div className="flex gap-4 mb-3">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={product.product_images?.[0]?.url || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-white leading-tight uppercase text-xs">
                          {product.team_name} {product.shirt_year} {product.kit_type}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                          Manga {product.sleeve_type === 'short' ? 'Corta' : 'Larga'} | {product.version}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {availableStock.map(stock => (
                        <button
                          key={stock.size}
                          onClick={() => addToCart(product, stock.size)}
                          className="px-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all"
                        >
                          {stock.size} ({stock.quantity})
                        </button>
                      ))}
                      {availableStock.length === 0 && (
                        <span className="text-xs text-red-500 font-medium italic">Sin stock en esta sucursal</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {searchTerm && filteredProducts.length === 0 && (
                <div className="col-span-2 py-8 text-center text-slate-500">No se encontraron resultados</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Carrito de Compras" noPadding className="sticky top-24">
            <div className="max-h-[40vh] overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Carrito vacío</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.product_id}-${item.size}`} className="flex justify-between items-start gap-3 p-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex-1">
                      <h5 className="text-sm font-bold text-slate-800 dark:text-white leading-none">{item.name}</h5>
                      <p className="text-[10px] text-slate-500 mt-1">Talla: <span className="font-bold text-primary">{item.size}</span></p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(index, -1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700"><Minus size={12}/></button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(index, 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700"><Plus size={12}/></button>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-400">$</span>
                          <input 
                            type="number"
                            className="w-12 text-xs font-bold bg-transparent outline-none text-right"
                            value={item.unit_price}
                            onChange={(e) => handleUpdatePrice(index, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm font-black text-slate-800 dark:text-white">${(item.unit_price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(index)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-2xl font-black text-slate-800 dark:text-white">
                  <span>Total USD</span>
                  <span>${totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-primary">
                  <span>Total BS</span>
                  <span>{totalBS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BS</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['cash', 'transfer', 'card'].map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`p-2 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${
                      paymentMethod === m ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {m === 'cash' ? 'Efectivo' : m === 'transfer' ? 'P. Móvil' : 'Zelle'}
                  </button>
                ))}
              </div>

              <Button 
                onClick={handleCheckout} 
                className="w-full py-4 text-lg font-bold"
                isLoading={isLoading}
                disabled={cart.length === 0}
              >
                Completar Venta
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SalesPage;
