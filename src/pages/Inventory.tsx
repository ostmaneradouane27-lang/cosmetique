import { useState, useEffect } from 'react';
import { 
  Box, 
  ArrowUp, 
  ArrowDown, 
  History, 
  Search, 
  Filter, 
  FileDown, 
  RefreshCw,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { handleSupabaseError, OperationType } from '@/lib/supabase-errors';

export default function Inventory() {
  const { user } = useAuth();
  const [moves, setMoves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLog = async () => {
    if (!user?.storeId || user.storeId === 'pending') return;
    try {
      const { data, error } = await supabase
        .from('inventory_log')
        .select('*')
        .eq('store_id', user.storeId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setMoves(data?.map(d => ({
        ...d,
        date: new Date(d.created_at).toLocaleString()
      })) || []);
    } catch (error) {
       handleSupabaseError(error, OperationType.LIST, 'inventory_log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
  }, [user?.storeId]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Logistics</h1>
          <p className="text-muted-foreground mt-1">Track every stock movement and replenishment cycle.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl">
             <RefreshCw className="mr-2 h-4 w-4" /> Full Audit
          </Button>
          <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20">
             <ArrowUp className="mr-2 h-4 w-4" /> Restock Items
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-border/50 bg-card/40 backdrop-blur-md">
           <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Stock Value</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-black italic">$24,580.00</div>
              <p className="text-[10px] text-muted-foreground mt-1 underline decoration-dotted">Estimated sell-through: 24 days</p>
           </CardContent>
        </Card>
        <Card className="border border-border/50 bg-card/40 backdrop-blur-md">
           <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Inbound (30d)</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-black italic text-emerald-500">+1,420 Items</div>
              <p className="text-[10px] text-muted-foreground mt-1">Across 12 supplier deliveries</p>
           </CardContent>
        </Card>
        <Card className="border border-border/50 bg-card/40 backdrop-blur-md">
           <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Outbound (30d)</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-black italic text-rose-500">-842 Items</div>
              <p className="text-[10px] text-muted-foreground mt-1">Driven by organic beauty sales</p>
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-border/50 bg-card/40 backdrop-blur-md">
           <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50 bg-accent/5">
              <div className="flex items-center gap-2">
                 <History className="h-5 w-5 text-primary" />
                 <CardTitle className="text-lg">Movement Log</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                 <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Filter log..." className="pl-9 h-8 text-xs rounded-lg border-none bg-background shadow-none" />
                 </div>
                 <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg p-0"><Filter className="h-3.5 w-3.5" /></Button>
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <Table>
                 <TableHeader className="bg-muted/30">
                    <TableRow>
                       <TableHead>Activity</TableHead>
                       <TableHead>Qty Change</TableHead>
                       <TableHead>Performed By</TableHead>
                       <TableHead>Balance</TableHead>
                       <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {moves.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">No movements recorded yet.</TableCell>
                      </TableRow>
                    )}
                    {moves.map((move) => (
                      <TableRow key={move.id} className="hover:bg-accent/30 transition-colors group">
                         <TableCell>
                            <div className="flex flex-col">
                               <span className="text-sm font-bold truncate max-w-[150px] group-hover:text-primary transition-colors">{move.productName}</span>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                  {move.type === 'SALE' ? <ArrowDown className="h-2.5 w-2.5 text-rose-500" /> : <ArrowUp className="h-2.5 w-2.5 text-emerald-500" />}
                                  <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">{move.type}</span>
                               </div>
                            </div>
                         </TableCell>
                         <TableCell>
                            <span className={`text-sm font-black italic ${move.quantity < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                               {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                            </span>
                         </TableCell>
                         <TableCell>
                            <span className="text-xs font-medium">{move.userName}</span>
                         </TableCell>
                         <TableCell>
                            <Badge variant="outline" className="font-mono text-[9px] h-5 bg-background">{move.balance}</Badge>
                         </TableCell>
                         <TableCell className="text-right text-[10px] text-muted-foreground whitespace-nowrap">
                            {move.date}
                         </TableCell>
                      </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border border-border/50 bg-card/40 backdrop-blur-md overflow-hidden ring-1 ring-rose-500/20">
              <CardHeader className="bg-rose-500/5 pb-4">
                 <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                    <CardTitle className="text-lg text-rose-600">Stock Alerts</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                 {[
                   { name: 'Matte Foundation', stock: 8, min: 10, urgency: 'High' },
                   { name: 'Nail Polish Gold', stock: 5, min: 10, urgency: 'Critical' },
                 ].map((alert) => (
                   <div key={alert.name} className="p-3 rounded-xl bg-background/50 border border-border/50 flex items-center justify-between group">
                      <div className="flex flex-col">
                         <span className="text-xs font-bold truncate group-hover:text-primary transition-colors">{alert.name}</span>
                         <span className="text-[10px] text-rose-500 uppercase font-black tracking-widest">{alert.urgency} Priority</span>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                         <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-rose-500">{alert.stock}</span>
                            <span className="text-[8px] text-muted-foreground">Min: {alert.min}</span>
                         </div>
                      </div>
                   </div>
                 ))}
                 <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 h-10 text-xs font-bold">
                    Generate Replenishment Order
                 </Button>
              </CardContent>
           </Card>

           <Card className="border border-border/50 bg-zinc-950 text-white overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-8 flex items-center gap-6 relative z-10">
                 <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                    <ClipboardList className="h-7 w-7 text-primary" />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-lg font-black uppercase tracking-tighter leading-none italic mb-1">Physical Inventory Count</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Started 2 days ago • 80% Complete</p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
