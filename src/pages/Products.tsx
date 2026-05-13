import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Barcode as BarcodeIcon,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product } from '@/types';
import Barcode from 'react-barcode';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { handleSupabaseError, OperationType } from '@/lib/supabase-errors';
import { toast } from 'sonner';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    categoryId: 'makeup',
    brand: '',
    buyingPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 5
  });

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
      handleSupabaseError(error, OperationType.LIST, 'products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to changes
    const channel = supabase
      .channel('products-changes')
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

  const handleSaveProduct = async () => {
    if (!user?.storeId) return;
    if (!formData.name || !formData.barcode) {
      toast.error('Name and Barcode are required');
      return;
    }

    setIsSaving(true);
    const productId = formData.barcode;
    
    try {
      const { error } = await supabase
        .from('products')
        .upsert([{
          id: productId,
          name: formData.name,
          barcode: formData.barcode,
          category_id: formData.categoryId,
          brand: formData.brand,
          buying_price: formData.buyingPrice,
          selling_price: formData.sellingPrice,
          stock: formData.stock,
          min_stock: formData.minStock,
          store_id: user.storeId,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      toast.success('Product saved successfully');
      setIsDialogOpen(false);
      setFormData({
        name: '', barcode: '', categoryId: 'makeup', brand: '',
        buyingPrice: 0, sellingPrice: 0, stock: 0, minStock: 5
      });
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'products');
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user?.storeId) return;
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted');
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, 'products');
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your catalog and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-dashed">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Matte Lipstick" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="barcode" 
                        placeholder="Scan or type..." 
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      />
                      <Button variant="outline" size="icon"><BarcodeIcon className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="makeup">Makeup</SelectItem>
                        <SelectItem value="skincare">Skincare</SelectItem>
                        <SelectItem value="hair">Hair Care</SelectItem>
                        <SelectItem value="nails">Nails</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input 
                      id="brand" 
                      placeholder="e.g. L'Oreal" 
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyPrice">Buying Price</Label>
                    <Input 
                      id="buyPrice" 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.buyingPrice}
                      onChange={(e) => setFormData({ ...formData, buyingPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellPrice">Selling Price</Label>
                    <Input 
                      id="sellPrice" 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Initial Stock</Label>
                    <Input 
                      id="stock" 
                      type="number" 
                      placeholder="0" 
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Min Stock Warning</Label>
                  <Input 
                    id="minStock" 
                    type="number" 
                    placeholder="5" 
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                <Button 
                  onClick={handleSaveProduct} 
                  className="rounded-xl bg-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Product'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-border/50 bg-accent/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search catalog..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 border-none bg-background shadow-none rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg gap-2 h-10">
                <Filter className="h-4 w-4" /> Category: All
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg gap-2 h-10">
                <ArrowUpDown className="h-4 w-4" /> Stock: Low
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[100px]">Barcode</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Prices</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p.id} className="hover:bg-accent/30 transition-colors group">
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{p.barcode}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold group-hover:text-primary transition-colors">{p.name}</span>
                      <span className="text-[10px] uppercase text-muted-foreground font-medium tracking-tight">{p.brand}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-tighter bg-primary/5 text-primary">
                      {p.categoryId}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">${p.sellingPrice}</span>
                      <span className="text-[10px] text-muted-foreground underline decoration-dotted decoration-border">Cost: ${p.buyingPrice}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${p.stock <= p.minStock ? 'text-rose-500' : 'text-foreground'}`}>
                          {p.stock}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/ min {p.minStock}</span>
                     </div>
                  </TableCell>
                  <TableCell>
                    {p.stock === 0 ? (
                      <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 border-none text-[9px] h-5">Out of Stock</Badge>
                    ) : p.stock <= p.minStock ? (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/5 text-[9px] h-5 gap-1">
                        <AlertTriangle className="h-2 w-2" /> Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5 text-[9px] h-5">Good</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl shadow-primary/5 p-2">
                        <DropdownMenuItem className="rounded-lg gap-2 p-2">
                           <Edit className="h-4 w-4" /> Edit Info
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsBarcodeOpen(true);
                          }}
                          className="rounded-lg gap-2 p-2"
                        >
                           <BarcodeIcon className="h-4 w-4" /> Print Barcode
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="rounded-lg gap-2 p-2 text-rose-500 focus:bg-rose-500/10 focus:text-rose-600"
                        >
                           <Trash2 className="h-4 w-4" /> Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isBarcodeOpen} onOpenChange={setIsBarcodeOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Barcode Generation</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 gap-6 border rounded-xl bg-accent/10">
             <div className="bg-white p-6 rounded-lg shadow-sm">
                {selectedProduct && <Barcode value={selectedProduct.barcode} width={2} height={80} fontSize={14} />}
             </div>
             <div className="text-center">
                <h4 className="font-bold">{selectedProduct?.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedProduct?.brand}</p>
             </div>
          </div>
          <DialogFooter className="sm:justify-center">
             <Button className="w-full rounded-xl bg-primary">
                <Download className="mr-2 h-4 w-4" /> Download PDF Pack
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
