import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Receipt,
  Scan,
  ShoppingCart,
  X,
  User,
  History,
  Tag,
  Zap,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Product, SaleItem, PaymentMethod } from '@/types';
import BarcodeScanner from 'react-qr-barcode-scanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/services/supabase';
import { handleSupabaseError, OperationType } from '@/lib/supabase-errors';

export default function POS() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [discount, setDiscount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const fetchProducts = async () => {
    if (!user?.storeId || user.storeId === 'pending') return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', user.storeId);
      
      if (error) throw error;
      setProducts(data.map((p: any) => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        categoryId: p.category_id,
        brand: p.brand,
        buyingPrice: Number(p.buying_price),
        sellingPrice: Number(p.selling_price),
        stock: p.stock,
        minStock: p.min_stock,
        storeId: p.store_id,
        updatedAt: new Date(p.updated_at).getTime()
      })));
    } catch (error) {
       console.error('Fetch products error:', error);
    }
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('pos-products')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products',
        filter: `store_id=eq.${user?.storeId}`
      }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.storeId]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search)
  );

  const playScanSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime);
    gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    osc.start();
    osc.stop(audioContextRef.current.currentTime + 0.1);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.sellingPrice }];
    });
    playScanSound();
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.19; // 19% VAT example
  const total = (subtotal + tax) - discount;

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!user?.storeId || user.storeId === 'pending') {
      toast.error('Invalid Store Context', { description: 'Please setup your store first.' });
      return;
    }

    setIsProcessing(true);
    const saleId = Math.random().toString(36).substr(2, 9).toUpperCase();
    
    try {
      const storeId = user.storeId;
      
      // 1. Sale Record
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          id: saleId,
          total,
          subtotal,
          tax,
          discount,
          payment_method: paymentMethod,
          cashier_id: user.uid,
          store_id: storeId,
          items_count: cart.reduce((sum, i) => sum + i.quantity, 0),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Sale Items
      const saleItems = cart.map(item => ({
        sale_id: saleId,
        product_id: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // 3. Stock Update & Inventory Log
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.productId);

          await supabase
            .from('inventory_log')
            .insert([{
              product_id: item.productId,
              product_name: item.name,
              type: 'SALE',
              quantity: -item.quantity,
              balance: newStock,
              user_id: user.uid,
              user_name: user.displayName,
              store_id: storeId,
              created_at: new Date().toISOString()
            }]);
        }
      }

      setLastSale({
        ...saleData,
        items: cart,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      });
      setIsReceiptOpen(true);
      
      toast.success('Transaction Completed!', {
        description: `Sale #${saleId} finalized`,
      });
      setCart([]);
      setDiscount(0);
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'sales');
      toast.error('Transaction Failed', { description: 'Failed to record the sale.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScan = (data: string | null) => {
    if (data) {
      const product = products.find(p => p.barcode === data);
      if (product) {
        addToCart(product);
        setIsScanning(false);
      } else {
        toast.error(`Product with barcode ${data} not found`);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search product by name or barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl border-border/50 bg-card/40 backdrop-blur-sm"
              autoFocus
            />
          </div>
          <Dialog open={isScanning} onOpenChange={setIsScanning}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 w-12 rounded-xl group hover:border-primary transition-all">
                <Scan className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Scan Barcode</DialogTitle>
              </DialogHeader>
              <div className="aspect-video relative rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <BarcodeScanner
                  onUpdate={(err, result) => {
                    if (result) handleScan(result.getText());
                  }}
                  width="100%"
                  height="100%"
                />
                <div className="absolute inset-0 border-2 border-primary/50 animate-pulse pointer-events-none m-8 rounded-xl" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1 rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  onClick={() => addToCart(product)}
                  className="border border-border/50 bg-card/40 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer transition-all overflow-hidden group"
                >
                  <div className="aspect-square bg-accent/50 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/20">
                        <ShoppingCart className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                       <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-primary font-bold">
                         ${product.sellingPrice}
                       </Badge>
                    </div>
                    {product.stock < product.minStock && (
                      <Badge variant="destructive" className="absolute top-2 left-2 text-[8px] uppercase">Low Stock</Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">{product.brand}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Stock: {product.stock}</span>
                      <Barcode className="h-3 w-3 text-muted-foreground/50" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart & Checkout Area */}
      <div className="w-[400px] flex flex-col gap-6">
        <Card className="flex-1 flex flex-col border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg">Register</CardTitle>
            </div>
            <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setCart([])}
               className="h-8 px-2 text-rose-500 hover:bg-rose-500/5 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
               <div className="p-4 space-y-3">
                 <AnimatePresence initial={false}>
                   {cart.length === 0 ? (
                     <div className="h-60 flex flex-col items-center justify-center text-muted-foreground opacity-50 italic">
                        <ShoppingCart className="h-12 w-12 mb-2" />
                        <p>Cart is currently empty</p>
                     </div>
                   ) : (
                     cart.map((item) => (
                       <motion.div
                         key={item.productId}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         className="flex items-center justify-between p-3 rounded-xl bg-accent/30 border border-border/30 group"
                       >
                         <div className="flex flex-col gap-1 overflow-hidden pr-2">
                           <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">{item.name}</span>
                           <span className="text-xs font-medium text-primary">${item.price} each</span>
                         </div>
                         <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1 border border-border/50">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-7 w-7 rounded-md hover:bg-rose-500/10 hover:text-rose-500"
                             onClick={() => item.quantity > 1 ? updateQuantity(item.productId, -1) : removeFromCart(item.productId)}
                           >
                             {item.quantity > 1 ? <Minus className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
                           </Button>
                           <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-7 w-7 rounded-md hover:bg-emerald-500/10 hover:text-emerald-500"
                             onClick={() => updateQuantity(item.productId, 1)}
                           >
                             <Plus className="h-3 w-3" />
                           </Button>
                         </div>
                       </motion.div>
                     ))
                   )}
                 </AnimatePresence>
               </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="flex flex-col p-6 bg-accent/20 border-t border-border/50 gap-4">
             <div className="w-full space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Subtotal</span>
                 <span className="font-medium">${subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Tax (19%)</span>
                 <span className="font-medium">${tax.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-1 text-muted-foreground group">
                   <Tag className="h-3 w-3" />
                   <span>Add Discount</span>
                 </div>
                 <Input 
                   type="number" 
                   value={discount} 
                   onChange={(e) => setDiscount(Number(e.target.value))}
                   className="h-7 w-20 text-right bg-background/50 border-none rounded-md text-xs font-bold"
                 />
               </div>
               <div className="pt-2 border-t border-border/50 flex justify-between items-end">
                 <span className="text-lg font-bold">Total</span>
                 <span className="text-3xl font-black text-primary">${total.toFixed(2)}</span>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-2 w-full">
               {[
                 { id: PaymentMethod.CASH, icon: Banknote, label: 'Cash' },
                 { id: PaymentMethod.CARD, icon: CreditCard, label: 'Card' },
                 { id: PaymentMethod.CCP, icon: History, label: 'CCP' },
               ].map((method) => (
                 <Button
                   key={method.id}
                   variant={paymentMethod === method.id ? 'default' : 'outline'}
                   className={`h-16 flex flex-col gap-1 rounded-xl transition-all duration-200 ${
                     paymentMethod === method.id 
                       ? 'ring-2 ring-primary bg-primary shadow-lg shadow-primary/20' 
                       : 'bg-background hover:border-primary/50'
                   }`}
                   onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                 >
                   <method.icon className="h-5 w-5" />
                   <span className="text-[10px] uppercase font-bold tracking-tight">{method.label}</span>
                 </Button>
               ))}
             </div>

             <Button 
               size="lg" 
               onClick={handleCheckout}
               className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
               disabled={cart.length === 0}
             >
               CHECKOUT
             </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
           <div className="bg-white p-8 space-y-6 text-black font-mono">
              <div className="text-center space-y-1">
                 <h2 className="text-2xl font-black italic tracking-tighter">COSMO<span className="text-primary">POS</span></h2>
                 <p className="text-[10px] uppercase font-bold text-zinc-500">Beauty & Luxury Retail</p>
                 <p className="text-[10px] text-zinc-400">15 Champs-Élysées, Paris</p>
              </div>
              
              <div className="border-y border-dashed border-zinc-200 py-4 space-y-1 text-[11px]">
                 <div className="flex justify-between">
                    <span>Receipt: #{lastSale?.id}</span>
                    <span>Date: {lastSale?.date}</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Cashier: {user?.displayName}</span>
                    <span>Time: {lastSale?.time}</span>
                 </div>
              </div>

              <div className="space-y-3">
                 {lastSale?.items.map((item: any) => (
                    <div key={item.productId} className="flex justify-between text-xs">
                       <div className="flex flex-col">
                          <span className="font-bold">{item.name}</span>
                          <span className="text-[10px] text-zinc-500">{item.quantity} x ${item.price}</span>
                       </div>
                       <span className="font-bold">${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                 ))}
              </div>

              <div className="border-t border-dashed border-zinc-200 pt-4 space-y-1">
                 <div className="flex justify-between text-xs">
                    <span>Subtotal</span>
                    <span>${lastSale?.subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span>Tax (19%)</span>
                    <span>${lastSale?.tax.toFixed(2)}</span>
                 </div>
                 {lastSale?.discount > 0 && (
                   <div className="flex justify-between text-xs text-rose-500">
                      <span>Discount</span>
                      <span>-${lastSale?.discount.toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-lg font-black pt-2">
                    <span>TOTAL</span>
                    <span>${lastSale?.total.toFixed(2)}</span>
                 </div>
              </div>

              <div className="text-center space-y-4 pt-4">
                 <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Paid via {lastSale?.method}</p>
                    <div className="h-12 w-full bg-zinc-100 flex items-center justify-center rounded">
                       <Barcode value={lastSale?.id || '0000'} height={30} width={1.5} fontSize={10} background="transparent" />
                    </div>
                 </div>
                 <p className="text-xs italic font-medium">Thank you for choosing CosmoPOS!</p>
              </div>
           </div>
           <div className="p-4 bg-zinc-50 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsReceiptOpen(false)}>Close</Button>
              <Button className="flex-1 rounded-xl bg-primary shadow-lg shadow-primary/20">
                 <Receipt className="mr-2 h-4 w-4" /> Print PDF
              </Button>
           </div>
        </DialogContent>
      </Dialog>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
      `}</style>
    </div>
  );
}
